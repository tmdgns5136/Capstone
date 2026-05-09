import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Server,
  Wifi,
  WifiOff,
  Camera,
  RefreshCw,
  Settings,
  Terminal,
  AlertTriangle,
  PlaySquare,
  X,
  ShieldCheck,
  Search,
  Key,
  Copy,
  Check,
  Clock,
  Plus,
  FileWarning,
  Eye,
  EyeOff,
} from "lucide-react";
import { toast } from "sonner";
import Webcam from "react-webcam";

const spring = { type: "spring", stiffness: 100, damping: 20 } as const;

// 장치 타입 (임베디드 명세서 기반)
interface Device {
  deviceId: string;
  classroom: string;
  deviceName: string;
  deviceSecret: string;
  isLoggedIn: boolean; // 로그인 여부 → 온라인/오프라인
  uptime: string;
  lastHeartbeat: string;
  cameraStatus: "OK" | "DISCONNECTED" | "CAPTURE_FAIL";
  networkStatus: "ONLINE" | "OFFLINE" | "UNSTABLE";
  config: {
    active: boolean;
    captureIntervalSec: number;
    heartbeatIntervalSec: number;
    imageWidth: number;
    imageHeight: number;
    imageQuality: number;
    maxUploadSizeMb: number;
  };
  errorLogs: ErrorLog[];
}

interface ErrorLog {
  id: number;
  errorCode: string;
  message: string;
  createdAt: string;
}

// Mock Data (명세서 구조 기반)
const MOCK_DEVICES: Device[] = [
  {
    deviceId: "RPI-G207-001",
    classroom: "공학관 207호",
    deviceName: "G207 카메라 1",
    deviceSecret: "sk_rpi_a3f8e2b1c9d4",
    isLoggedIn: true,
    uptime: "14일 2시간",
    lastHeartbeat: "방금 전",
    cameraStatus: "OK",
    networkStatus: "ONLINE",
    config: {
      active: true,
      captureIntervalSec: 60,
      heartbeatIntervalSec: 30,
      imageWidth: 4608,
      imageHeight: 2592,
      imageQuality: 100,
      maxUploadSizeMb: 30,
    },
    errorLogs: [],
  },
  {
    deviceId: "RPI-G211-001",
    classroom: "공학관 211호",
    deviceName: "G211 카메라 1",
    deviceSecret: "sk_rpi_b7c1d4e5f2a8",
    isLoggedIn: true,
    uptime: "5일 11시간",
    lastHeartbeat: "3초 전",
    cameraStatus: "OK",
    networkStatus: "ONLINE",
    config: {
      active: true,
      captureIntervalSec: 60,
      heartbeatIntervalSec: 30,
      imageWidth: 4608,
      imageHeight: 2592,
      imageQuality: 100,
      maxUploadSizeMb: 30,
    },
    errorLogs: [
      {
        id: 1,
        errorCode: "CAMERA_CAPTURE_FAIL",
        message: "캡처 타임아웃 발생",
        createdAt: "2026-05-08 09:12:33",
      },
    ],
  },
  {
    deviceId: "RPI-G301-001",
    classroom: "공학관 301호",
    deviceName: "G301 카메라 1",
    deviceSecret: "sk_rpi_c2d3e4f5a6b7",
    isLoggedIn: false,
    uptime: "-",
    lastHeartbeat: "2시간 전",
    cameraStatus: "DISCONNECTED",
    networkStatus: "OFFLINE",
    config: {
      active: false,
      captureIntervalSec: 60,
      heartbeatIntervalSec: 30,
      imageWidth: 4608,
      imageHeight: 2592,
      imageQuality: 100,
      maxUploadSizeMb: 30,
    },
    errorLogs: [
      {
        id: 2,
        errorCode: "NETWORK_TIMEOUT",
        message: "서버 연결 실패",
        createdAt: "2026-05-09 07:45:10",
      },
      {
        id: 3,
        errorCode: "CAMERA_DISCONNECTED",
        message: "카메라 모듈 연결 끊김",
        createdAt: "2026-05-09 07:44:58",
      },
    ],
  },
  {
    deviceId: "RPI-IT201-001",
    classroom: "IT관 201호",
    deviceName: "IT201 카메라 1",
    deviceSecret: "sk_rpi_d8e9f0a1b2c3",
    isLoggedIn: true,
    uptime: "30일 5시간",
    lastHeartbeat: "1초 전",
    cameraStatus: "OK",
    networkStatus: "ONLINE",
    config: {
      active: true,
      captureIntervalSec: 60,
      heartbeatIntervalSec: 30,
      imageWidth: 4608,
      imageHeight: 2592,
      imageQuality: 100,
      maxUploadSizeMb: 30,
    },
    errorLogs: [],
  },
  {
    deviceId: "RPI-IT301-001",
    classroom: "IT관 301호",
    deviceName: "IT301 카메라 1",
    deviceSecret: "sk_rpi_e4f5a6b7c8d9",
    isLoggedIn: true,
    uptime: "2일 1시간",
    lastHeartbeat: "15초 전",
    cameraStatus: "CAPTURE_FAIL",
    networkStatus: "UNSTABLE",
    config: {
      active: true,
      captureIntervalSec: 60,
      heartbeatIntervalSec: 30,
      imageWidth: 4608,
      imageHeight: 2592,
      imageQuality: 100,
      maxUploadSizeMb: 30,
    },
    errorLogs: [
      {
        id: 4,
        errorCode: "CAMERA_CAPTURE_FAIL",
        message: "캡처 실패 - 조명 부족",
        createdAt: "2026-05-09 13:22:05",
      },
      {
        id: 5,
        errorCode: "NETWORK_UNSTABLE",
        message: "네트워크 불안정 감지",
        createdAt: "2026-05-09 13:20:11",
      },
      {
        id: 6,
        errorCode: "UPLOAD_TIMEOUT",
        message: "이미지 업로드 타임아웃",
        createdAt: "2026-05-09 13:18:44",
      },
    ],
  },
];

export default function AdminDeviceManagement() {
  const [devices, setDevices] = useState(MOCK_DEVICES);
  const [searchQuery, setSearchQuery] = useState("");

  // 각 모달용 장치 상태 (각각 독립)
  const [configDevice, setConfigDevice] = useState<Device | null>(null);
  const [logsDevice, setLogsDevice] = useState<Device | null>(null);
  const [testDevice, setTestDevice] = useState<Device | null>(null);

  // 장치 등록 모달
  const [showRegister, setShowRegister] = useState(false);
  const [regDeviceId, setRegDeviceId] = useState("");
  const [regClassroom, setRegClassroom] = useState("");
  const [regDeviceName, setRegDeviceName] = useState("");

  // 시크릿 키 표시
  const [visibleSecrets, setVisibleSecrets] = useState<Set<string>>(new Set());
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // 시크릿 키 비밀번호 인증
  const [secretAuthTarget, setSecretAuthTarget] = useState<string | null>(null); // 인증 대상 deviceId
  const [secretAuthAction, setSecretAuthAction] = useState<"view" | "copy">("view"); // 인증 후 동작
  const [secretAuthPassword, setSecretAuthPassword] = useState("");
  const [secretAuthError, setSecretAuthError] = useState(false);
  const ADMIN_PASSWORD = "test1234"; // TODO: 실제 인증 API로 교체

  // 카메라 테스트
  const [testResult, setTestResult] = useState<any>(null);

  const filteredDevices = devices.filter(
    (d) =>
      d.classroom.includes(searchQuery) ||
      d.deviceId.includes(searchQuery) ||
      d.deviceName.includes(searchQuery),
  );

  const onlineCount = devices.filter((d) => d.isLoggedIn).length;
  const offlineCount = devices.filter((d) => !d.isLoggedIn).length;

  // 시크릿 키 복사
  const handleCopySecret = (deviceId: string, secret: string) => {
    navigator.clipboard.writeText(secret);
    setCopiedId(deviceId);
    toast.success("시크릿 키가 클립보드에 복사되었습니다");
    setTimeout(() => setCopiedId(null), 2000);
  };

  // 시크릿 키 표시 토글 (이미 보이면 숨기기, 안 보이면 비밀번호 인증 모달)
  const toggleSecretVisible = (deviceId: string) => {
    if (visibleSecrets.has(deviceId)) {
      setVisibleSecrets((prev) => {
        const next = new Set(prev);
        next.delete(deviceId);
        return next;
      });
    } else {
      setSecretAuthTarget(deviceId);
      setSecretAuthAction("view");
      setSecretAuthPassword("");
      setSecretAuthError(false);
    }
  };

  // 시크릿 키 복사 요청 (인증 필요)
  const requestCopySecret = (deviceId: string) => {
    setSecretAuthTarget(deviceId);
    setSecretAuthAction("copy");
    setSecretAuthPassword("");
    setSecretAuthError(false);
  };

  // 비밀번호 인증 확인
  const handleSecretAuth = () => {
    if (secretAuthPassword === ADMIN_PASSWORD) {
      if (secretAuthTarget) {
        const device = devices.find((d) => d.deviceId === secretAuthTarget);
        if (secretAuthAction === "view") {
          setVisibleSecrets((prev) => new Set(prev).add(secretAuthTarget));
        } else if (secretAuthAction === "copy" && device) {
          navigator.clipboard.writeText(device.deviceSecret);
          setCopiedId(secretAuthTarget);
          toast.success("시크릿 키가 클립보드에 복사되었습니다");
          setTimeout(() => setCopiedId(null), 2000);
        }
      }
      setSecretAuthTarget(null);
      setSecretAuthPassword("");
      setSecretAuthError(false);
    } else {
      setSecretAuthError(true);
    }
  };

  // 장치 등록
  const handleRegister = () => {
    if (!regDeviceId || !regClassroom || !regDeviceName) {
      toast.error("모든 필드를 입력해주세요");
      return;
    }
    if (devices.find((d) => d.deviceId === regDeviceId)) {
      toast.error("이미 존재하는 장치 ID입니다");
      return;
    }

    const newDevice: Device = {
      deviceId: regDeviceId,
      classroom: regClassroom,
      deviceName: regDeviceName,
      deviceSecret: `sk_rpi_${Math.random().toString(36).slice(2, 14)}`,
      isLoggedIn: false,
      uptime: "-",
      lastHeartbeat: "-",
      cameraStatus: "DISCONNECTED",
      networkStatus: "OFFLINE",
      config: {
        active: false,
        captureIntervalSec: 60,
        heartbeatIntervalSec: 30,
        imageWidth: 4608,
        imageHeight: 2592,
        imageQuality: 100,
        maxUploadSizeMb: 30,
      },
      errorLogs: [],
    };

    setDevices((prev) => [...prev, newDevice]);
    toast.success("장치가 등록되었습니다. 시크릿 키를 확인해주세요.");
    setShowRegister(false);
    setRegDeviceId("");
    setRegClassroom("");
    setRegDeviceName("");
    setConfigDevice(newDevice);
  };

  // 카메라 테스트
  const handleRunFaceTest = (device: Device) => {
    setTestDevice(device);
    setTestResult(null);
  };

  const simulateFaceRecognition = () => {
    setTestResult({ status: "scanning" });
    setTimeout(() => {
      setTestResult({
        status: "success",
        matched: 3,
        total: 5,
        latency: "142ms",
        confidence: "98.5%",
      });
      toast.success("얼굴 인식 테스트 완료");
    }, 2000);
  };

  const errorCodeLabel: Record<string, string> = {
    CAMERA_CAPTURE_FAIL: "캡처 실패",
    CAMERA_DISCONNECTED: "카메라 연결 끊김",
    NETWORK_TIMEOUT: "네트워크 타임아웃",
    NETWORK_UNSTABLE: "네트워크 불안정",
    UPLOAD_TIMEOUT: "업로드 타임아웃",
  };

  return (
    <div className="max-w-7xl mx-auto pb-10 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={spring}
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-zinc-900">장비 관리</h1>
          <p className="text-sm text-zinc-400 mt-1">
            장치 등록, 인증, 상태 모니터링 및 오류 로그
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-4 px-4 py-2 bg-white rounded-xl border border-zinc-200">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary"></span>
              <span className="text-xs text-zinc-500">온라인</span>
              <span className="text-sm font-semibold text-zinc-900">{onlineCount}</span>
            </div>
            <div className="w-px h-4 bg-zinc-200"></div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500"></span>
              <span className="text-xs text-zinc-500">오프라인</span>
              <span className="text-sm font-semibold text-zinc-900">{offlineCount}</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Toolbar */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...spring, delay: 0.05 }}
        className="flex flex-col md:flex-row gap-3"
      >
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" strokeWidth={1.5} />
          <input
            type="text"
            placeholder="강의실, 장치 ID, 장치명 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-zinc-200 bg-white p-3 pl-10 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
          />
        </div>
        <div className="flex gap-2">
          <button className="bg-white text-zinc-700 text-sm font-medium px-5 py-2.5 rounded-xl border border-zinc-200 hover:bg-zinc-50 transition-colors flex items-center gap-2">
            <RefreshCw className="w-4 h-4" strokeWidth={1.5} /> 새로고침
          </button>
          <button
            onClick={() => {
              setShowRegister(true);
              setRegDeviceId("");
              setRegClassroom("");
              setRegDeviceName("");
            }}
            className="bg-primary text-white text-sm font-medium px-5 py-2.5 rounded-xl hover:bg-primary-hover transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" strokeWidth={1.5} /> 장치 등록
          </button>
        </div>
      </motion.div>

      {/* Device Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        <AnimatePresence>
          {filteredDevices.map((device, index) => {
            const isOnline = device.isLoggedIn;
            const hasWarning = device.cameraStatus !== "OK" || device.networkStatus === "UNSTABLE";
            return (
              <motion.div
                key={device.deviceId}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ ...spring, delay: index * 0.05 }}
                className="bg-white rounded-xl border border-zinc-200 overflow-hidden transition-all hover:shadow-sm flex flex-col h-full"
              >
                {/* Card Header - 상태 + 우측 상단 설정 버튼 */}
                <div className="px-5 py-3.5 border-b border-zinc-100 flex justify-between items-center">
                  <div className="flex items-center gap-2.5">
                    {isOnline ? (
                      <Wifi className="w-4 h-4 text-primary-dark" strokeWidth={1.5} />
                    ) : (
                      <WifiOff className="w-4 h-4 text-rose-500" strokeWidth={1.5} />
                    )}
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${
                        isOnline ? "bg-primary/10 text-primary-dark" : "bg-rose-50 text-rose-700"
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? "bg-primary" : "bg-rose-500"}`}></span>
                      {isOnline ? "온라인" : "오프라인"}
                    </span>
                    {hasWarning && isOnline && (
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-500" strokeWidth={1.5} />
                    )}
                  </div>
                  <button
                    onClick={() => setConfigDevice(device)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center bg-zinc-50 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700 transition-colors"
                    title="장치 설정"
                  >
                    <Settings className="w-4 h-4" strokeWidth={1.5} />
                  </button>
                </div>

                {/* Card Body */}
                <div className="px-5 py-4 flex-1 flex flex-col gap-4">
                  <div>
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-zinc-900 tracking-tight">{device.classroom}</h3>
                      <span className="text-xs text-zinc-400 font-mono">{device.deviceId}</span>
                    </div>
                    <span className="text-xs text-zinc-400 mt-1 inline-block">{device.deviceName}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-zinc-50/80 rounded-xl px-3 py-2.5">
                      <span className="text-xs text-zinc-400 font-medium">업타임</span>
                      <p className="text-sm font-medium text-zinc-700 mt-0.5">{device.uptime}</p>
                    </div>
                    <div className="bg-zinc-50/80 rounded-xl px-3 py-2.5">
                      <span className="text-xs text-zinc-400 font-medium">마지막 통신</span>
                      <p className="text-sm font-medium text-zinc-700 mt-0.5">{device.lastHeartbeat}</p>
                    </div>
                    <div className="bg-zinc-50/80 rounded-xl px-3 py-2.5">
                      <span className="text-xs text-zinc-400 font-medium">카메라</span>
                      <p className={`text-sm font-medium mt-0.5 ${device.cameraStatus === "OK" ? "text-zinc-700" : "text-rose-600"}`}>
                        {device.cameraStatus === "OK" ? "정상" : device.cameraStatus === "DISCONNECTED" ? "연결 끊김" : "캡처 실패"}
                      </p>
                    </div>
                    <div className="bg-zinc-50/80 rounded-xl px-3 py-2.5">
                      <span className="text-xs text-zinc-400 font-medium">네트워크</span>
                      <p className={`text-sm font-medium mt-0.5 ${device.networkStatus === "ONLINE" ? "text-zinc-700" : device.networkStatus === "UNSTABLE" ? "text-amber-600" : "text-rose-600"}`}>
                        {device.networkStatus === "ONLINE" ? "정상" : device.networkStatus === "UNSTABLE" ? "불안정" : "오프라인"}
                      </p>
                    </div>
                  </div>

                  {/* 시크릿 키 (카드 중간) */}
                  <div className="bg-zinc-50/80 rounded-xl px-3 py-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Key className="w-3.5 h-3.5 text-zinc-400" strokeWidth={1.5} />
                        <span className="text-xs text-zinc-400 font-medium">시크릿 키</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-mono text-zinc-500">
                          {visibleSecrets.has(device.deviceId) ? device.deviceSecret : "••••••••••••••"}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleSecretVisible(device.deviceId);
                          }}
                          className="w-6 h-6 rounded flex items-center justify-center text-zinc-400 hover:text-zinc-600 transition-colors"
                        >
                          {visibleSecrets.has(device.deviceId) ? (
                            <EyeOff className="w-3.5 h-3.5" strokeWidth={1.5} />
                          ) : (
                            <Eye className="w-3.5 h-3.5" strokeWidth={1.5} />
                          )}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            requestCopySecret(device.deviceId);
                          }}
                          className="w-6 h-6 rounded flex items-center justify-center text-zinc-400 hover:text-zinc-600 transition-colors"
                        >
                          {copiedId === device.deviceId ? (
                            <Check className="w-3.5 h-3.5 text-primary-dark" strokeWidth={1.5} />
                          ) : (
                            <Copy className="w-3.5 h-3.5" strokeWidth={1.5} />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Footer - 카메라 테스트 + 오류 로그 버튼 */}
                <div className="px-5 py-3 border-t border-zinc-100 flex gap-2">
                  <button
                    onClick={() => handleRunFaceTest(device)}
                    disabled={!isOnline}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-primary/10 text-primary-dark hover:bg-primary/20 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <Camera className="w-3.5 h-3.5" strokeWidth={1.5} />
                    카메라 테스트
                  </button>
                  <button
                    onClick={() => setLogsDevice(device)}
                    className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                      device.errorLogs.length > 0
                        ? "bg-rose-50 text-rose-600 hover:bg-rose-100"
                        : "bg-zinc-50 text-zinc-500 hover:bg-zinc-100"
                    }`}
                  >
                    <FileWarning className="w-3.5 h-3.5" strokeWidth={1.5} />
                    오류 로그 {device.errorLogs.length > 0 && `(${device.errorLogs.length})`}
                  </button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {filteredDevices.length === 0 && (
        <div className="bg-white rounded-xl border border-zinc-200 p-16 text-center">
          <Server className="w-10 h-10 text-zinc-300 mx-auto mb-3" strokeWidth={1.5} />
          <p className="text-sm text-zinc-400">검색된 장비가 없습니다</p>
        </div>
      )}

      {/* 장치 설정 모달 */}
      <AnimatePresence>
        {configDevice && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setConfigDevice(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              transition={spring}
              className="bg-white rounded-2xl border border-zinc-200 shadow-2xl w-full max-w-lg overflow-hidden max-h-[90vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${configDevice.isLoggedIn ? "bg-primary/10" : "bg-rose-50"}`}>
                    <Settings className={`w-4 h-4 ${configDevice.isLoggedIn ? "text-primary-dark" : "text-rose-500"}`} strokeWidth={1.5} />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-zinc-900">장치 설정</h2>
                    <p className="text-xs text-zinc-400">{configDevice.classroom} · {configDevice.deviceId}</p>
                  </div>
                </div>
                <button
                  onClick={() => setConfigDevice(null)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center bg-zinc-50 text-zinc-500 hover:bg-zinc-100 transition-colors"
                >
                  <X className="w-4 h-4" strokeWidth={1.5} />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 space-y-6 overflow-y-auto">
                {/* 연결 정보 */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-zinc-900 flex items-center gap-2">
                    <Wifi className="w-4 h-4 text-zinc-400" strokeWidth={1.5} /> 연결 정보
                  </h3>
                  <div className="bg-zinc-50 rounded-xl p-4 space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-500">상태</span>
                      <span className={`font-medium ${configDevice.isLoggedIn ? "text-primary-dark" : "text-rose-600"}`}>
                        {configDevice.isLoggedIn ? "온라인 (로그인됨)" : "오프라인 (로그아웃)"}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-500">업타임</span>
                      <span className="font-medium text-zinc-700">{configDevice.uptime}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-500">마지막 하트비트</span>
                      <span className="font-medium text-zinc-700">{configDevice.lastHeartbeat}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-500">카메라 상태</span>
                      <span className={`font-medium ${configDevice.cameraStatus === "OK" ? "text-zinc-700" : "text-rose-600"}`}>
                        {configDevice.cameraStatus === "OK" ? "정상" : configDevice.cameraStatus === "DISCONNECTED" ? "연결 끊김" : "캡처 실패"}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-500">네트워크</span>
                      <span className={`font-medium ${
                        configDevice.networkStatus === "ONLINE" ? "text-zinc-700" : configDevice.networkStatus === "UNSTABLE" ? "text-amber-600" : "text-rose-600"
                      }`}>
                        {configDevice.networkStatus === "ONLINE" ? "정상" : configDevice.networkStatus === "UNSTABLE" ? "불안정" : "오프라인"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 촬영 설정 */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-zinc-900 flex items-center gap-2">
                    <Camera className="w-4 h-4 text-zinc-400" strokeWidth={1.5} /> 촬영 설정
                  </h3>
                  <div className="bg-zinc-50 rounded-xl p-4 space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-500">활성화</span>
                      <span className={`font-medium ${configDevice.config.active ? "text-primary-dark" : "text-zinc-400"}`}>
                        {configDevice.config.active ? "활성" : "비활성"}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-500">촬영 간격</span>
                      <span className="font-medium text-zinc-700">{configDevice.config.captureIntervalSec}초</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-500">하트비트 간격</span>
                      <span className="font-medium text-zinc-700">{configDevice.config.heartbeatIntervalSec}초</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-500">해상도</span>
                      <span className="font-medium text-zinc-700">{configDevice.config.imageWidth}×{configDevice.config.imageHeight}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-500">이미지 품질</span>
                      <span className="font-medium text-zinc-700">{configDevice.config.imageQuality}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-500">최대 업로드</span>
                      <span className="font-medium text-zinc-700">{configDevice.config.maxUploadSizeMb}MB</span>
                    </div>
                  </div>
                </div>

                {/* 인증 정보 */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-zinc-900 flex items-center gap-2">
                    <Key className="w-4 h-4 text-zinc-400" strokeWidth={1.5} /> 인증 정보
                  </h3>
                  <div className="bg-zinc-50 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-sm text-zinc-500">시크릿 키 (장치 로그인에 사용)</p>
                        <p className="text-sm font-mono font-medium text-zinc-700">
                          {visibleSecrets.has(configDevice.deviceId) ? configDevice.deviceSecret : "••••••••••••••••••••"}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleSecretVisible(configDevice.deviceId)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center bg-white border border-zinc-200 text-zinc-500 hover:bg-zinc-100 transition-colors"
                        >
                          {visibleSecrets.has(configDevice.deviceId) ? (
                            <EyeOff className="w-4 h-4" strokeWidth={1.5} />
                          ) : (
                            <Eye className="w-4 h-4" strokeWidth={1.5} />
                          )}
                        </button>
                        <button
                          onClick={() => requestCopySecret(configDevice.deviceId)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center bg-white border border-zinc-200 text-zinc-500 hover:bg-zinc-100 transition-colors"
                        >
                          {copiedId === configDevice.deviceId ? (
                            <Check className="w-4 h-4 text-primary-dark" strokeWidth={1.5} />
                          ) : (
                            <Copy className="w-4 h-4" strokeWidth={1.5} />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 오류 로그 모달 */}
      <AnimatePresence>
        {logsDevice && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setLogsDevice(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              transition={spring}
              className="bg-white rounded-2xl border border-zinc-200 shadow-2xl w-full max-w-lg overflow-hidden max-h-[90vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center">
                    <FileWarning className="w-4 h-4 text-rose-500" strokeWidth={1.5} />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-zinc-900">오류 로그</h2>
                    <p className="text-xs text-zinc-400">{logsDevice.classroom} · {logsDevice.deviceId}</p>
                  </div>
                </div>
                <button
                  onClick={() => setLogsDevice(null)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center bg-zinc-50 text-zinc-500 hover:bg-zinc-100 transition-colors"
                >
                  <X className="w-4 h-4" strokeWidth={1.5} />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 overflow-y-auto space-y-3">
                {logsDevice.errorLogs.length === 0 ? (
                  <div className="py-12 text-center">
                    <ShieldCheck className="w-10 h-10 text-zinc-200 mx-auto mb-3" strokeWidth={1.5} />
                    <p className="text-sm text-zinc-400">오류 로그가 없습니다</p>
                    <p className="text-xs text-zinc-300 mt-1">장치가 정상적으로 작동 중입니다</p>
                  </div>
                ) : (
                  logsDevice.errorLogs.map((log) => (
                    <div key={log.id} className="flex items-start gap-3 px-4 py-3 bg-zinc-50 rounded-xl">
                      <div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center shrink-0 mt-0.5">
                        <AlertTriangle className="w-4 h-4 text-rose-500" strokeWidth={1.5} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-rose-100 text-rose-700">
                            {errorCodeLabel[log.errorCode] || log.errorCode}
                          </span>
                          <span className="text-xs text-zinc-400">{log.createdAt}</span>
                        </div>
                        <p className="text-sm text-zinc-600 mt-1">{log.message}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Camera Test Modal */}
      <AnimatePresence>
        {testDevice && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setTestDevice(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              transition={spring}
              className="bg-white rounded-xl border border-zinc-200 shadow-2xl w-full max-w-4xl md:max-w-2xl lg:max-w-4xl flex flex-col overflow-hidden max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-zinc-100 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Terminal className="w-4 h-4 text-primary-dark" strokeWidth={1.5} />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-zinc-900">카메라 테스트</h2>
                    <p className="text-xs text-zinc-400">{testDevice.classroom} / {testDevice.deviceId}</p>
                  </div>
                </div>
                <button
                  onClick={() => setTestDevice(null)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center bg-zinc-50 text-zinc-500 hover:bg-zinc-100 transition-colors"
                >
                  <X className="w-4 h-4" strokeWidth={1.5} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="flex flex-col md:flex-row overflow-y-auto">
                {/* Left: Camera Feed */}
                <div className="flex-1 border-b md:border-b-0 md:border-r border-zinc-100 p-5 flex flex-col gap-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-zinc-700">Live Feed</span>
                    <span className="text-xs text-zinc-400 font-mono">{testDevice.deviceId}</span>
                  </div>
                  <div className="flex-1 bg-zinc-900 rounded-xl relative overflow-hidden flex items-center justify-center min-h-[300px]">
                    <Webcam
                      audio={false}
                      className={`w-full h-full object-cover rounded-xl ${testResult?.status === "scanning" ? "opacity-70" : "opacity-90"}`}
                    />
                    {testResult?.status === "scanning" && (
                      <div className="absolute inset-0 z-10 pointer-events-none rounded-xl">
                        <motion.div
                          animate={{ top: ["0%", "100%", "0%"] }}
                          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                          className="absolute left-0 right-0 h-0.5 bg-primary shadow-[0_0_8px_rgba(197,216,59,0.5)]"
                        />
                        <div className="absolute inset-0 bg-primary/5 flex items-center justify-center rounded-xl">
                          <span className="bg-zinc-900/80 text-primary-dark px-4 py-2 rounded-lg text-sm font-medium backdrop-blur-sm animate-pulse">
                            분석 중...
                          </span>
                        </div>
                      </div>
                    )}
                    {testResult?.status === "success" && (
                      <div className="absolute inset-0 pointer-events-none p-4 rounded-xl">
                        <div className="absolute top-[20%] left-[30%] w-[100px] h-[100px] border-2 border-primary rounded-lg bg-primary/10">
                          <span className="bg-primary text-white text-xs font-medium w-fit px-1.5 py-0.5 rounded-br-lg">99%</span>
                        </div>
                        <div className="absolute top-[40%] right-[20%] w-[120px] h-[120px] border-2 border-primary rounded-lg bg-primary/10">
                          <span className="bg-primary text-white text-xs font-medium w-fit px-1.5 py-0.5 rounded-br-lg">97%</span>
                        </div>
                        <div className="absolute bottom-[10%] left-[40%] w-[110px] h-[110px] border-2 border-rose-400 rounded-lg bg-rose-400/10">
                          <span className="bg-rose-500 text-white text-xs font-medium w-fit px-1.5 py-0.5 rounded-br-lg">미등록</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: Controls & Results */}
                <div className="w-full md:w-[300px] lg:w-[340px] shrink-0 flex flex-col">
                  <div className="px-5 py-4 border-b border-zinc-100">
                    <h3 className="text-sm font-semibold text-zinc-900 flex items-center gap-2">
                      <Settings className="w-4 h-4 text-zinc-400" strokeWidth={1.5} /> 테스트 제어
                    </h3>
                  </div>
                  <div className="p-5 space-y-4 flex-1">
                    <button
                      onClick={simulateFaceRecognition}
                      disabled={testResult?.status === "scanning"}
                      className="w-full bg-primary text-white text-sm font-medium px-5 py-2.5 rounded-xl hover:bg-primary-hover transition-colors disabled:opacity-50 flex justify-center items-center gap-2"
                    >
                      {testResult?.status === "scanning" ? (
                        <RefreshCw className="w-4 h-4 animate-spin" strokeWidth={1.5} />
                      ) : (
                        <PlaySquare className="w-4 h-4" strokeWidth={1.5} />
                      )}
                      인식 모델 구동
                    </button>

                    {testResult?.status === "success" && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={spring}
                        className="bg-zinc-50 rounded-xl p-4 space-y-2.5"
                      >
                        <div className="flex items-center gap-2 pb-2.5 border-b border-zinc-200">
                          <ShieldCheck className="w-4 h-4 text-primary-dark" strokeWidth={1.5} />
                          <span className="text-sm font-medium text-zinc-700">테스트 결과</span>
                        </div>
                        <div className="space-y-1.5 text-sm text-zinc-600">
                          <div className="flex justify-between">
                            <span>API 응답 시간</span>
                            <span className="font-medium text-zinc-900">{testResult.latency}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>감지된 얼굴</span>
                            <span className="font-medium text-zinc-900">{testResult.total}명</span>
                          </div>
                          <div className="flex justify-between">
                            <span>DB 매칭 성공</span>
                            <span className="font-medium text-zinc-900">{testResult.matched}명</span>
                          </div>
                          <div className="flex justify-between">
                            <span>평균 신뢰도</span>
                            <span className="font-medium text-zinc-900">{testResult.confidence}</span>
                          </div>
                        </div>
                        <div className="pt-2 border-t border-zinc-200">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-primary/10 text-primary-dark">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                            정상 작동
                          </span>
                        </div>
                      </motion.div>
                    )}
                  </div>

                  <div className="p-5 border-t border-zinc-100 bg-zinc-50/50">
                    <p className="text-xs font-medium text-zinc-400 mb-2.5">디바이스 정보</p>
                    <ul className="text-sm space-y-1.5">
                      <li className="flex justify-between">
                        <span className="text-zinc-500">강의실</span>
                        <span className="font-medium text-zinc-700">{testDevice.classroom}</span>
                      </li>
                      <li className="flex justify-between">
                        <span className="text-zinc-500">해상도</span>
                        <span className="font-medium text-zinc-700">{testDevice.config.imageWidth}×{testDevice.config.imageHeight}</span>
                      </li>
                      <li className="flex justify-between">
                        <span className="text-zinc-500">장치 ID</span>
                        <span className="font-medium text-zinc-700 font-mono text-xs">{testDevice.deviceId}</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Register Device Modal */}
      <AnimatePresence>
        {showRegister && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setShowRegister(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              transition={spring}
              className="bg-white rounded-2xl border border-zinc-200 shadow-2xl w-full max-w-sm overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-6 py-4 border-b border-zinc-100 flex justify-between items-center">
                <div className="flex items-center gap-2.5">
                  <Server className="w-4 h-4 text-zinc-500" strokeWidth={1.5} />
                  <h2 className="text-lg font-semibold text-zinc-900">장치 등록</h2>
                </div>
                <button
                  onClick={() => setShowRegister(false)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center bg-zinc-50 text-zinc-500 hover:bg-zinc-100 transition-colors"
                >
                  <X className="w-4 h-4" strokeWidth={1.5} />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-zinc-700">장치 ID</label>
                  <input
                    value={regDeviceId}
                    onChange={(e) => setRegDeviceId(e.target.value)}
                    placeholder="RPI-G207-001"
                    className="w-full rounded-xl border border-zinc-200 bg-white p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-zinc-700">강의실</label>
                  <input
                    value={regClassroom}
                    onChange={(e) => setRegClassroom(e.target.value)}
                    placeholder="공학관 207호"
                    className="w-full rounded-xl border border-zinc-200 bg-white p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-zinc-700">장치명</label>
                  <input
                    value={regDeviceName}
                    onChange={(e) => setRegDeviceName(e.target.value)}
                    placeholder="G207 카메라 1"
                    className="w-full rounded-xl border border-zinc-200 bg-white p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                  />
                </div>
                <p className="text-xs text-zinc-400">등록 후 시크릿 키가 자동으로 생성됩니다. 장치 로그인에 사용하세요.</p>
                <button
                  onClick={handleRegister}
                  className="w-full bg-primary text-white text-sm font-medium px-5 py-2.5 rounded-xl hover:bg-primary-hover transition-colors mt-2"
                >
                  등록하기
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 시크릿 키 비밀번호 인증 모달 */}
      <AnimatePresence>
        {secretAuthTarget && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setSecretAuthTarget(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              transition={spring}
              className="bg-white rounded-2xl border border-zinc-200 shadow-2xl w-full max-w-xs overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-6 py-4 border-b border-zinc-100 flex justify-between items-center">
                <div className="flex items-center gap-2.5">
                  <Key className="w-4 h-4 text-zinc-500" strokeWidth={1.5} />
                  <h2 className="text-base font-semibold text-zinc-900">관리자 인증</h2>
                </div>
                <button
                  onClick={() => setSecretAuthTarget(null)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center bg-zinc-50 text-zinc-500 hover:bg-zinc-100 transition-colors"
                >
                  <X className="w-4 h-4" strokeWidth={1.5} />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <p className="text-sm text-zinc-500">
                  시크릿 키를 {secretAuthAction === "view" ? "확인" : "복사"}하려면 관리자 비밀번호를 입력하세요.
                </p>
                <div className="space-y-1.5">
                  <input
                    type="password"
                    value={secretAuthPassword}
                    onChange={(e) => {
                      setSecretAuthPassword(e.target.value);
                      setSecretAuthError(false);
                    }}
                    onKeyDown={(e) => e.key === "Enter" && handleSecretAuth()}
                    placeholder="비밀번호 입력"
                    autoFocus
                    className={`w-full rounded-xl border bg-white p-3 text-sm focus:outline-none focus:ring-2 transition-all ${
                      secretAuthError
                        ? "border-rose-300 focus:ring-rose-200 focus:border-rose-400"
                        : "border-zinc-200 focus:ring-primary/30 focus:border-primary"
                    }`}
                  />
                  {secretAuthError && (
                    <p className="text-xs text-rose-500 font-medium">비밀번호가 올바르지 않습니다.</p>
                  )}
                </div>
                <button
                  onClick={handleSecretAuth}
                  className="w-full bg-primary text-white text-sm font-medium px-5 py-2.5 rounded-xl hover:bg-primary-hover transition-colors"
                >
                  확인
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
