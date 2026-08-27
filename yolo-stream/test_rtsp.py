import cv2

STREAM_URL = "rtsp://127.0.0.1:8554/RPI-TEST-0507"
# 안 되면 아래 주소로 바꿔서 테스트
# STREAM_URL = "rtsp://100.68.215.22:8554/RPI-TEST-0507"

cap = cv2.VideoCapture(STREAM_URL)

if not cap.isOpened():
    print("[ERROR] RTSP 스트림을 열 수 없습니다.")
    exit()

print("[OK] RTSP 스트림 연결 성공")

while True:
    ret, frame = cap.read()

    if not ret:
        print("[ERROR] 프레임을 읽지 못했습니다.")
        break

    cv2.imshow("RTSP Test", frame)

    if cv2.waitKey(1) & 0xFF == ord("q"):
        break

cap.release()
cv2.destroyAllWindows()