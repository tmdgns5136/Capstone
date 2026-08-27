import os
import subprocess
import atexit
from datetime import datetime, timezone, timedelta

# Keep Ultralytics settings inside the worker project so service accounts do not
# depend on a writable user profile directory.
os.environ.setdefault(
    "YOLO_CONFIG_DIR",
    os.path.join(os.path.dirname(os.path.abspath(__file__)), ".ultralytics"),
)

from ultralytics import YOLO
import cv2
import time
import requests

# =========================
# 기본 설정
# =========================

def env_bool(name, default=False):
    value = os.getenv(name)
    if value is None:
        return default
    return value.strip().lower() in ("1", "true", "yes", "y", "on")


DEVICE_ID = os.getenv("DEVICE_ID", "RPI-TEST-0513")
DEVICE_SECRET = os.getenv("DEVICE_SECRET", "1234")

STREAM_URL = os.getenv("YOLO_SOURCE", "rtsp://127.0.0.1:8554/RPI-TEST-0513")
MODEL_PATH = os.getenv("YOLO_MODEL", "yolo26n.pt")

SERVER_BASE_URL = os.getenv("YOLO_SERVER_BASE_URL", "http://100.68.215.22:8080")
YOLO_DEVICE = os.getenv("YOLO_DEVICE", "cpu")
SHOW_WINDOW = env_bool("YOLO_DISPLAY", False)

OUTPUT_RTSP_URL = os.getenv("YOLO_OUTPUT_RTSP", "").strip()
OUTPUT_ENABLED = env_bool("YOLO_OUTPUT_ENABLED", True) and bool(OUTPUT_RTSP_URL)
OUTPUT_FPS = float(os.getenv("YOLO_OUTPUT_FPS", "10"))
OUTPUT_BITRATE = os.getenv("YOLO_OUTPUT_BITRATE", "2500k")
FFMPEG_COMMAND = os.getenv("YOLO_FFMPEG_COMMAND", "ffmpeg")

KST = timezone(timedelta(hours=9))

# 사람 수 저장 주기
SEND_INTERVAL_SEC = float(os.getenv("YOLO_SEND_INTERVAL_SEC", "2"))

# 사람 수 변화가 이 시간만큼 유지되면 진짜 ENTER / EXIT로 인정
STABLE_SECONDS = float(os.getenv("YOLO_STABLE_SECONDS", "10"))

# YOLO 모델 로드
model = YOLO(MODEL_PATH)

# JWT 토큰
access_token = None

# 서버 전송 시간 관리
last_send_time = 0

# 입장/퇴장 감지용 상태
confirmed_people_count = None
candidate_people_count = None
candidate_started_at = None

# YOLO 박스가 그려진 영상을 다시 MediaMTX RTSP path로 publish하는 ffmpeg 프로세스
stream_process = None
stream_frame_size = None
stream_disabled = False
stream_retry_after = 0


# =========================
# 공통 함수
# =========================

def now_kst_iso():
    return datetime.now(KST).isoformat(timespec="seconds")


def login_device():
    url = f"{SERVER_BASE_URL}/api/device/login"

    response = requests.post(url, json={
        "deviceId": DEVICE_ID,
        "deviceSecret": DEVICE_SECRET
    }, timeout=5)

    response.raise_for_status()

    data = response.json()["data"]
    return data["accessToken"]


def get_auth_headers():
    global access_token

    if access_token is None:
        access_token = login_device()
        print("[LOGIN] 장치 로그인 성공")

    return {
        "Authorization": f"Bearer {access_token}"
    }


# =========================
# YOLO 적용 영상 RTSP 재송출
# =========================

def start_annotated_stream(frame):
    global stream_process
    global stream_frame_size
    global stream_disabled

    if not OUTPUT_ENABLED or stream_disabled:
        return None

    height, width = frame.shape[:2]
    stream_frame_size = (width, height)
    key_interval = max(1, int(round(OUTPUT_FPS * 2)))

    command = [
        FFMPEG_COMMAND,
        "-loglevel", "warning",
        "-f", "rawvideo",
        "-pix_fmt", "bgr24",
        "-s:v", f"{width}x{height}",
        "-r", str(OUTPUT_FPS),
        "-i", "pipe:0",
        "-an",
        "-c:v", "libx264",
        "-preset", "veryfast",
        "-tune", "zerolatency",
        "-profile:v", "baseline",
        "-level", "3.1",
        "-pix_fmt", "yuv420p",
        "-b:v", OUTPUT_BITRATE,
        "-g", str(key_interval),
        "-bf", "0",
        "-f", "rtsp",
        "-rtsp_transport", "tcp",
        OUTPUT_RTSP_URL,
    ]

    try:
        stream_process = subprocess.Popen(
            command,
            stdin=subprocess.PIPE,
            stdout=subprocess.DEVNULL,
            stderr=None,
        )
        print(
            f"[YOLO_STREAM] publishing annotated stream "
            f"{width}x{height}@{OUTPUT_FPS}fps -> {OUTPUT_RTSP_URL}"
        )
        return stream_process
    except FileNotFoundError:
        stream_disabled = True
        print(f"[YOLO_STREAM_ERROR] ffmpeg 명령을 찾을 수 없습니다: {FFMPEG_COMMAND}")
    except Exception as e:
        stream_disabled = True
        print(f"[YOLO_STREAM_ERROR] annotated stream 시작 실패: {e}")

    return None


def stop_annotated_stream():
    global stream_process
    global stream_frame_size

    process = stream_process
    stream_process = None
    stream_frame_size = None

    if process is None:
        return

    try:
        if process.stdin:
            process.stdin.close()
    except Exception:
        pass

    if process.poll() is None:
        process.terminate()
        try:
            process.wait(timeout=2)
        except subprocess.TimeoutExpired:
            process.kill()


def publish_annotated_frame(frame):
    global stream_retry_after

    if not OUTPUT_ENABLED or stream_disabled:
        return

    if time.time() < stream_retry_after:
        return

    height, width = frame.shape[:2]
    current_size = (width, height)
    process = stream_process

    if process is None or process.poll() is not None or stream_frame_size != current_size:
        stop_annotated_stream()
        process = start_annotated_stream(frame)

    if process is None or process.stdin is None:
        return

    try:
        process.stdin.write(frame.tobytes())
        process.stdin.flush()
    except (BrokenPipeError, OSError) as e:
        print(f"[YOLO_STREAM_ERROR] annotated frame 전송 실패: {e}")
        stop_annotated_stream()
        stream_retry_after = time.time() + 5


atexit.register(stop_annotated_stream)


# =========================
# 사람 수 저장 API
# =========================

def send_detection(people_count, track_ids):
    global access_token

    url = f"{SERVER_BASE_URL}/api/device/stream/detections"

    payload = {
        "deviceId": DEVICE_ID,
        "peopleCount": people_count,
        "trackIds": track_ids,
        "detectedAt": now_kst_iso()
    }

    headers = get_auth_headers()
    headers["Content-Type"] = "application/json"

    response = requests.post(url, json=payload, headers=headers, timeout=5)

    if response.status_code == 401:
        access_token = login_device()
        headers["Authorization"] = f"Bearer {access_token}"
        response = requests.post(url, json=payload, headers=headers, timeout=5)

    response.raise_for_status()

    print(f"[SEND] people_count={people_count}, track_ids={track_ids}")


# =========================
# ENTER / EXIT 이벤트 저장 API
# =========================

def send_stream_event(event):
    global access_token

    url = f"{SERVER_BASE_URL}/api/device/stream/events"

    payload = {
        "deviceId": DEVICE_ID,
        "eventType": event["eventType"],
        "beforeCount": event["beforeCount"],
        "afterCount": event["afterCount"],
        "diffCount": event["diffCount"],
        "eventTime": now_kst_iso()
    }

    headers = get_auth_headers()
    headers["Content-Type"] = "application/json"

    response = requests.post(url, json=payload, headers=headers, timeout=5)

    if response.status_code == 401:
        access_token = login_device()
        headers["Authorization"] = f"Bearer {access_token}"
        response = requests.post(url, json=payload, headers=headers, timeout=5)

    if response.status_code >= 400:
        print(f"[STREAM_EVENT_FAIL] HTTP {response.status_code} | {response.text}")
        return

    result = response.json()
    event_id = result.get("data", {}).get("eventId")

    print(
        f"[STREAM_EVENT_SEND] eventId={event_id}, "
        f"type={event['eventType']}, "
        f"{event['beforeCount']} -> {event['afterCount']}"
    )


# =========================
# ENTER / EXIT 판단
# =========================

def check_enter_exit(current_people_count):
    global confirmed_people_count
    global candidate_people_count
    global candidate_started_at

    current_time = time.time()

    # 최초 기준값 설정
    if confirmed_people_count is None:
        confirmed_people_count = current_people_count
        candidate_people_count = current_people_count
        candidate_started_at = current_time
        print(f"[INIT] confirmed_people_count={confirmed_people_count}")
        return None

    # 현재 사람 수가 확정된 사람 수와 같으면 변화 후보 초기화
    if current_people_count == confirmed_people_count:
        candidate_people_count = current_people_count
        candidate_started_at = current_time
        return None

    # 새로운 변화 후보 발생
    if candidate_people_count != current_people_count:
        candidate_people_count = current_people_count
        candidate_started_at = current_time
        print(f"[CANDIDATE] {confirmed_people_count} -> {candidate_people_count}")
        return None

    # 같은 변화 후보가 STABLE_SECONDS 이상 유지됐는지 확인
    elapsed = current_time - candidate_started_at

    if elapsed >= STABLE_SECONDS:
        old_count = confirmed_people_count
        new_count = candidate_people_count
        diff = new_count - old_count

        event = None

        if diff > 0:
            print(
                f"[EVENT] ENTER detected | "
                f"{old_count} -> {new_count} | "
                f"entered={diff} | at={now_kst_iso()}"
            )

            event = {
                "eventType": "ENTER",
                "beforeCount": old_count,
                "afterCount": new_count,
                "diffCount": diff
            }

        elif diff < 0:
            print(
                f"[EVENT] EXIT detected | "
                f"{old_count} -> {new_count} | "
                f"exited={abs(diff)} | at={now_kst_iso()}"
            )

            event = {
                "eventType": "EXIT",
                "beforeCount": old_count,
                "afterCount": new_count,
                "diffCount": diff
            }

        confirmed_people_count = new_count
        candidate_started_at = current_time

        return event

    return None


def build_annotated_frame(result, people_count):
    annotated_frame = result.plot()

    cv2.putText(
        annotated_frame,
        f"people_count={people_count}",
        (20, 40),
        cv2.FONT_HERSHEY_SIMPLEX,
        1,
        (0, 255, 0),
        2
    )

    if confirmed_people_count is not None:
        cv2.putText(
            annotated_frame,
            f"confirmed={confirmed_people_count}",
            (20, 80),
            cv2.FONT_HERSHEY_SIMPLEX,
            1,
            (0, 255, 255),
            2
        )

    return annotated_frame


# =========================
# YOLO RTSP 추론 시작
# =========================

print("[YOLO] device_id =", DEVICE_ID)
print("[YOLO] source =", STREAM_URL)
print("[YOLO] model =", MODEL_PATH)
print("[YOLO] annotated_output =", OUTPUT_RTSP_URL if OUTPUT_ENABLED else "disabled")

results = model.track(
    source=STREAM_URL,
    stream=True,
    persist=True,
    classes=[0],
    conf=0.3,
    imgsz=416,
    vid_stride=2,
    device=YOLO_DEVICE
)

try:
    for result in results:
        boxes = result.boxes

        people_count = 0
        track_ids = []

        if boxes is not None and len(boxes) > 0:
            people_count = len(boxes)

            if boxes.id is not None:
                track_ids = boxes.id.int().cpu().tolist()

        # ENTER / EXIT 이벤트 판단
        event = check_enter_exit(people_count)

        if event is not None:
            try:
                send_stream_event(event)
            except Exception as e:
                print(f"[STREAM_EVENT_ERROR] 이벤트 전송 실패: {e}")

        # 1초마다 사람 수 저장
        now = time.time()

        if now - last_send_time >= SEND_INTERVAL_SEC:
            try:
                send_detection(people_count, track_ids)
            except Exception as e:
                print(f"[ERROR] 서버 전송 실패: {e}")

            last_send_time = now

        if OUTPUT_ENABLED or SHOW_WINDOW:
            annotated_frame = build_annotated_frame(result, people_count)

            if OUTPUT_ENABLED:
                publish_annotated_frame(annotated_frame)

            if SHOW_WINDOW:
                cv2.imshow("YOLO26 RTSP Person Detection", annotated_frame)

                if cv2.waitKey(1) & 0xFF == ord("q"):
                    break
finally:
    stop_annotated_stream()

    if SHOW_WINDOW:
        cv2.destroyAllWindows()
