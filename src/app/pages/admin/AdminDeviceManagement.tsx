import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Server,
  Wifi,
  WifiOff,
  Camera,
  RefreshCw,
  Settings,
  Terminal,
  Activity,
  AlertTriangle,
  PlaySquare,
  X,
  ShieldCheck,
  Search,
  Lock,
  Power,
  Eye,
  EyeOff,
} from "lucide-react";
import { toast } from "sonner";
import Webcam from "react-webcam";

const spring = { type: "spring", stiffness: 100, damping: 20 };

// Mock Data for Devices
const MOCK_DEVICES = [
  {
    id: "pi-cam-001",
    room: "공학관 101호",
    ip: "192.168.1.101",
    mac: "b8:27:eb:xx:xx:01",
    status: "online",
    lastPing: "방금 전",
    uptime: "14일 2시간",
    version: "v2.0.4",
    fps: 30,
  },
  {
    id: "pi-cam-002",
    room: "공학관 102호",
    ip: "192.168.1.102",
    mac: "b8:27:eb:xx:xx:02",
    status: "online",
    lastPing: "방금 전",
    uptime: "5일 11시간",
    version: "v2.0.4",
    fps: 29,
  },
  {
    id: "pi-cam-003",
    room: "공학관 301호",
    ip: "192.168.1.103",
    mac: "b8:27:eb:xx:xx:03",
    status: "offline",
    lastPing: "2시간 전",
    uptime: "-",
    version: "v2.0.3",
    fps: 0,
  },
  {
    id: "pi-cam-004",
    room: "IT관 201호",
    ip: "192.168.1.104",
    mac: "b8:27:eb:xx:xx:04",
    status: "online",
    lastPing: "1초 전",
    uptime: "30일 5시간",
    version: "v2.0.4",
    fps: 30,
  },
  {
    id: "pi-cam-005",
    room: "IT관 301호",
    ip: "192.168.1.105",
    mac: "b8:27:eb:xx:xx:05",
    status: "warning",
    lastPing: "15초 전",
    uptime: "2일 1시간",
    version: "v2.0.4",
    fps: 12,
  },
];

export default function AdminDeviceManagement() {
  const [devices, setDevices] = useState(MOCK_DEVICES);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDevice, setSelectedDevice] = useState<any>(null);
  const [isTestMode, setIsTestMode] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);

  // Reboot password system
  const [rebootPassword, setRebootPassword] = useState(() => localStorage.getItem("rebootPassword") || "");
  const [showPasswordSetup, setShowPasswordSetup] = useState(false);
  const [showRebootConfirm, setShowRebootConfirm] = useState<{ type: "single"; deviceId: string } | { type: "all"; selectedIds: string[] } | null>(null);
  const [showDeviceSelect, setShowDeviceSelect] = useState(false);
  const [selectedRebootIds, setSelectedRebootIds] = useState<string[]>([]);
  const [passwordInput, setPasswordInput] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordConfirm, setNewPasswordConfirm] = useState("");
  const [currentPasswordInput, setCurrentPasswordInput] = useState("");
  const [showNewPw, setShowNewPw] = useState(false);
  const [showNewPwConfirm, setShowNewPwConfirm] = useState(false);
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showRebootPw, setShowRebootPw] = useState(false);

  const isPasswordSet = rebootPassword !== "";

  const filteredDevices = devices.filter(
    (d) =>
      d.room.includes(searchQuery) ||
      d.id.includes(searchQuery) ||
      d.ip.includes(searchQuery),
  );

  const handleRebootRequest = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!isPasswordSet) {
      toast.error("재부팅 비밀번호를 먼저 설정해주세요.");
      setShowPasswordSetup(true);
      return;
    }
    setShowRebootConfirm({ type: "single", deviceId: id });
    setPasswordInput("");
    setShowRebootPw(false);
  };

  const handleRebootAllRequest = () => {
    if (!isPasswordSet) {
      toast.error("재부팅 비밀번호를 먼저 설정해주세요.");
      setShowPasswordSetup(true);
      return;
    }
    const nonOffline = devices.filter((d) => d.status !== "offline").map((d) => d.id);
    setSelectedRebootIds(nonOffline);
    setShowDeviceSelect(true);
  };

  const handleDeviceSelectConfirm = () => {
    if (selectedRebootIds.length === 0) {
      toast.error("재부팅할 장비를 선택해주세요.");
      return;
    }
    setShowDeviceSelect(false);
    setShowRebootConfirm({ type: "all", selectedIds: selectedRebootIds });
    setPasswordInput("");
    setShowRebootPw(false);
  };

  const toggleRebootDevice = (id: string) => {
    setSelectedRebootIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const executeReboot = (id: string) => {
    toast.info(`기기 재부팅 명령 전송됨: ${id}`);
    setDevices((prev) =>
      prev.map((d) => {
        if (d.id === id)
          return { ...d, status: "offline", lastPing: "재부팅 중..." };
        return d;
      }),
    );
    setTimeout(() => {
      setDevices((prev) =>
        prev.map((d) => {
          if (d.id === id)
            return { ...d, status: "online", lastPing: "방금 전", uptime: "0분", fps: 30 };
          return d;
        }),
      );
      toast.success(`기기 재부팅 완료: ${id}`);
    }, 3000);
  };

  const handleRebootConfirm = () => {
    if (passwordInput !== rebootPassword) {
      toast.error("비밀번호가 일치하지 않습니다.");
      return;
    }
    if (showRebootConfirm?.type === "single") {
      executeReboot(showRebootConfirm.deviceId);
    } else if (showRebootConfirm?.type === "all") {
      showRebootConfirm.selectedIds.forEach((id) => executeReboot(id));
      toast.info(`${showRebootConfirm.selectedIds.length}대 재부팅 명령 전송됨`);
    }
    setShowRebootConfirm(null);
    setPasswordInput("");
  };

  const handlePasswordSave = () => {
    if (isPasswordSet && currentPasswordInput !== rebootPassword) {
      toast.error("현재 비밀번호가 일치하지 않습니다.");
      return;
    }
    if (!newPassword) {
      toast.error("새 비밀번호를 입력해주세요.");
      return;
    }
    if (newPassword !== newPasswordConfirm) {
      toast.error("새 비밀번호가 일치하지 않습니다.");
      return;
    }
    if (newPassword.length < 4) {
      toast.error("비밀번호는 4자 이상이어야 합니다.");
      return;
    }
    localStorage.setItem("rebootPassword", newPassword);
    setRebootPassword(newPassword);
    toast.success(isPasswordSet ? "비밀번호가 변경되었습니다." : "비밀번호가 설정되었습니다.");
    setShowPasswordSetup(false);
    setNewPassword("");
    setNewPasswordConfirm("");
    setCurrentPasswordInput("");
  };

  const handleRunFaceTest = () => {
    setIsTestMode(true);
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

  const statusConfig = {
    online: {
      dot: "bg-primary",
      badge: "bg-primary/10 text-primary-dark",
      label: "온라인",
    },
    offline: {
      dot: "bg-rose-500",
      badge: "bg-rose-50 text-rose-700",
      label: "오프라인",
    },
    warning: {
      dot: "bg-amber-500",
      badge: "bg-amber-50 text-amber-700",
      label: "경고",
    },
  } as const;

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
          <h1 className="text-3xl font-bold text-zinc-900">
            장비 관리
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            실시간 연결 상태 모니터링 및 제어
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-4 px-4 py-2 bg-white rounded-xl border border-zinc-200 ">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary"></span>
              <span className="text-xs text-zinc-500">온라인</span>
              <span className="text-sm font-semibold text-zinc-900">
                {devices.filter((d) => d.status === "online").length}
              </span>
            </div>
            <div className="w-px h-4 bg-zinc-200"></div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500"></span>
              <span className="text-xs text-zinc-500">오프라인</span>
              <span className="text-sm font-semibold text-zinc-900">
                {devices.filter((d) => d.status === "offline").length}
              </span>
            </div>
            <div className="w-px h-4 bg-zinc-200"></div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              <span className="text-xs text-zinc-500">경고</span>
              <span className="text-sm font-semibold text-zinc-900">
                {devices.filter((d) => d.status === "warning").length}
              </span>
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
          <Search
            className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400"
            strokeWidth={1.5}
          />
          <input
            type="text"
            placeholder="강의실, IP, 기기 ID 검색..."
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
            onClick={handleRebootAllRequest}
            className="bg-rose-500 text-white text-sm font-medium px-5 py-2.5 rounded-xl hover:bg-rose-600 transition-colors flex items-center gap-2"
          >
            <Power className="w-4 h-4" strokeWidth={1.5} /> 전체 재부팅
          </button>
          <button
            onClick={() => { setShowPasswordSetup(true); setNewPassword(""); setNewPasswordConfirm(""); setCurrentPasswordInput(""); setShowNewPw(false); setShowNewPwConfirm(false); setShowCurrentPw(false); }}
            className="w-10 h-10 rounded-xl border border-zinc-200 bg-white flex items-center justify-center text-zinc-500 hover:bg-zinc-50 transition-colors"
            title={isPasswordSet ? "재부팅 비밀번호 변경" : "재부팅 비밀번호 설정"}
          >
            <Lock className="w-4 h-4" strokeWidth={1.5} />
          </button>
        </div>
      </motion.div>

      {/* Device Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        <AnimatePresence>
          {filteredDevices.map((device, index) => {
            const status =
              statusConfig[device.status as keyof typeof statusConfig] ||
              statusConfig.offline;
            return (
              <motion.div
                key={device.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ ...spring, delay: index * 0.05 }}
                className={`bg-white rounded-xl border overflow-hidden cursor-pointer transition-all hover:shadow-sm flex flex-col h-full ${
                  selectedDevice?.id === device.id
                    ? "border-primary shadow-sm"
                    : "border-zinc-200 "
                }`}
                onClick={() => setSelectedDevice(device)}
              >
                {/* Card Header */}
                <div className="px-5 py-3.5 border-b border-zinc-100 flex justify-between items-center">
                  <div className="flex items-center gap-2.5">
                    {device.status === "online" ? (
                      <Wifi
                        className="w-4 h-4 text-primary-dark"
                        strokeWidth={1.5}
                      />
                    ) : device.status === "warning" ? (
                      <AlertTriangle
                        className="w-4 h-4 text-amber-500"
                        strokeWidth={1.5}
                      />
                    ) : (
                      <WifiOff
                        className="w-4 h-4 text-rose-500"
                        strokeWidth={1.5}
                      />
                    )}
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${status.badge}`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${status.dot}`}
                      ></span>
                      {status.label}
                    </span>
                  </div>
                  <span className="text-xs text-zinc-400 font-mono">
                    {device.id}
                  </span>
                </div>

                {/* Card Body */}
                <div className="px-5 py-4 flex-1 flex flex-col gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-zinc-900 tracking-tight">
                      {device.room}
                    </h3>
                    <span className="text-xs text-zinc-400 font-mono mt-1 inline-block">
                      {device.ip}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mt-auto">
                    <div className="bg-zinc-50/80 rounded-xl px-3 py-2.5">
                      <span className="text-xs text-zinc-400 font-medium">
                        업타임
                      </span>
                      <p className="text-sm font-medium text-zinc-700 mt-0.5">
                        {device.uptime}
                      </p>
                    </div>
                    <div className="bg-zinc-50/80 rounded-xl px-3 py-2.5">
                      <span className="text-xs text-zinc-400 font-medium">
                        마지막 통신
                      </span>
                      <p className="text-sm font-medium text-zinc-700 mt-0.5">
                        {device.lastPing}
                      </p>
                    </div>
                    <div className="bg-zinc-50/80 rounded-xl px-3 py-2.5">
                      <span className="text-xs text-zinc-400 font-medium">
                        FPS
                      </span>
                      <p
                        className={`text-sm font-medium mt-0.5 ${device.fps < 15 && device.fps > 0 ? "text-rose-600" : "text-zinc-700"}`}
                      >
                        {device.fps > 0 ? `${device.fps} fps` : "N/A"}
                      </p>
                    </div>
                    <div className="bg-zinc-50/80 rounded-xl px-3 py-2.5">
                      <span className="text-xs text-zinc-400 font-medium">
                        버전
                      </span>
                      <p className="text-sm font-medium text-zinc-700 mt-0.5">
                        {device.version}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="flex border-t border-zinc-100">
                  <button
                    onClick={(e) => handleRebootRequest(e, device.id)}
                    className="flex-1 py-3 text-sm font-medium text-zinc-600 flex items-center justify-center gap-1.5 hover:bg-rose-50 hover:text-rose-600 transition-colors border-r border-zinc-100"
                  >
                    <RefreshCw className="w-4 h-4" strokeWidth={1.5} /> 재부팅
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedDevice(device);
                      handleRunFaceTest();
                    }}
                    disabled={device.status === "offline"}
                    className="flex-1 py-3 text-sm font-medium text-zinc-600 flex items-center justify-center gap-1.5 hover:bg-primary/10 hover:text-primary-dark transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
                  >
                    <Camera className="w-4 h-4" strokeWidth={1.5} /> 테스트
                  </button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {filteredDevices.length === 0 && (
        <div className="bg-white rounded-xl border border-zinc-200 p-16 text-center">
          <AlertTriangle
            className="w-10 h-10 text-zinc-300 mx-auto mb-3"
            strokeWidth={1.5}
          />
          <p className="text-sm text-zinc-400">검색된 장비가 없습니다</p>
        </div>
      )}

      {/* Password Setup/Change Modal */}
      <AnimatePresence>
        {showPasswordSetup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setShowPasswordSetup(false)}
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
                  <Lock className="w-4 h-4 text-zinc-500" strokeWidth={1.5} />
                  <h2 className="text-lg font-semibold text-zinc-900">
                    {isPasswordSet ? "재부팅 비밀번호 변경" : "재부팅 비밀번호 설정"}
                  </h2>
                </div>
                <button
                  onClick={() => setShowPasswordSetup(false)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center bg-zinc-50 text-zinc-500 hover:bg-zinc-100 transition-colors"
                >
                  <X className="w-4 h-4" strokeWidth={1.5} />
                </button>
              </div>
              <div className="p-6 space-y-4">
                {isPasswordSet && (
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-zinc-700">현재 비밀번호</label>
                    <div className="relative">
                      <input
                        type={showCurrentPw ? "text" : "password"}
                        value={currentPasswordInput}
                        onChange={(e) => setCurrentPasswordInput(e.target.value)}
                        placeholder="현재 비밀번호 입력"
                        className="w-full rounded-xl border border-zinc-200 bg-white p-3 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                      />
                      <button type="button" onClick={() => setShowCurrentPw(!showCurrentPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600">
                        {showCurrentPw ? <EyeOff className="w-4 h-4" strokeWidth={1.5} /> : <Eye className="w-4 h-4" strokeWidth={1.5} />}
                      </button>
                    </div>
                  </div>
                )}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-zinc-700">새 비밀번호</label>
                  <div className="relative">
                    <input
                      type={showNewPw ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="4자 이상 입력"
                      className="w-full rounded-xl border border-zinc-200 bg-white p-3 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                    />
                    <button type="button" onClick={() => setShowNewPw(!showNewPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600">
                      {showNewPw ? <EyeOff className="w-4 h-4" strokeWidth={1.5} /> : <Eye className="w-4 h-4" strokeWidth={1.5} />}
                    </button>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-zinc-700">새 비밀번호 확인</label>
                  <div className="relative">
                    <input
                      type={showNewPwConfirm ? "text" : "password"}
                      value={newPasswordConfirm}
                      onChange={(e) => setNewPasswordConfirm(e.target.value)}
                      placeholder="비밀번호 재입력"
                      className="w-full rounded-xl border border-zinc-200 bg-white p-3 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                    />
                    <button type="button" onClick={() => setShowNewPwConfirm(!showNewPwConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600">
                      {showNewPwConfirm ? <EyeOff className="w-4 h-4" strokeWidth={1.5} /> : <Eye className="w-4 h-4" strokeWidth={1.5} />}
                    </button>
                  </div>
                </div>
                <button
                  onClick={handlePasswordSave}
                  className="w-full bg-primary text-white text-sm font-medium px-5 py-2.5 rounded-xl hover:bg-primary-hover transition-colors mt-2"
                >
                  {isPasswordSet ? "변경하기" : "설정하기"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Device Select Modal (Step 1 of All Reboot) */}
      <AnimatePresence>
        {showDeviceSelect && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setShowDeviceSelect(false)}
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
                  <Power className="w-4 h-4 text-rose-500" strokeWidth={1.5} />
                  <h2 className="text-lg font-semibold text-zinc-900">재부팅 장비 선택</h2>
                </div>
                <button
                  onClick={() => setShowDeviceSelect(false)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center bg-zinc-50 text-zinc-500 hover:bg-zinc-100 transition-colors"
                >
                  <X className="w-4 h-4" strokeWidth={1.5} />
                </button>
              </div>
              <div className="p-4 space-y-1.5 max-h-80 overflow-y-auto">
                {devices.map((d) => {
                  const isOffline = d.status === "offline";
                  const isChecked = selectedRebootIds.includes(d.id);
                  return (
                    <label
                      key={d.id}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-colors ${
                        isChecked ? "bg-rose-50" : "hover:bg-zinc-50"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleRebootDevice(d.id)}
                        className="w-4 h-4 rounded border-zinc-300 text-rose-500 focus:ring-rose-300"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-zinc-900">{d.room}</p>
                        <p className="text-xs text-zinc-400 font-mono">{d.id}</p>
                      </div>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-lg ${
                        d.status === "online" ? "bg-primary/10 text-primary-dark"
                        : d.status === "warning" ? "bg-amber-50 text-amber-700"
                        : "bg-rose-50 text-rose-600"
                      }`}>
                        {d.status === "online" ? "온라인" : d.status === "warning" ? "경고" : "오프라인"}
                      </span>
                    </label>
                  );
                })}
              </div>
              <div className="px-6 py-4 border-t border-zinc-100 flex items-center justify-between">
                <span className="text-sm text-zinc-500">{selectedRebootIds.length}대 선택됨</span>
                <button
                  onClick={handleDeviceSelectConfirm}
                  className="bg-rose-500 text-white text-sm font-medium px-5 py-2.5 rounded-xl hover:bg-rose-600 transition-colors"
                >
                  다음
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reboot Confirm Modal (Password) */}
      <AnimatePresence>
        {showRebootConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setShowRebootConfirm(null)}
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
                  <AlertTriangle className="w-4 h-4 text-rose-500" strokeWidth={1.5} />
                  <h2 className="text-lg font-semibold text-zinc-900">
                    {showRebootConfirm.type === "all" ? "전체 재부팅 확인" : "재부팅 확인"}
                  </h2>
                </div>
                <button
                  onClick={() => setShowRebootConfirm(null)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center bg-zinc-50 text-zinc-500 hover:bg-zinc-100 transition-colors"
                >
                  <X className="w-4 h-4" strokeWidth={1.5} />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <p className="text-sm text-zinc-600">
                  {showRebootConfirm.type === "all"
                    ? `선택된 ${showRebootConfirm.selectedIds.length}대를 재부팅합니다.`
                    : `장비 ${showRebootConfirm.type === "single" ? showRebootConfirm.deviceId : ""}을(를) 재부팅합니다.`}
                </p>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-zinc-700">재부팅 비밀번호</label>
                  <div className="relative">
                  <input
                    type={showRebootPw ? "text" : "password"}
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleRebootConfirm()}
                    placeholder="비밀번호 입력"
                    autoFocus
                    className="w-full rounded-xl border border-zinc-200 bg-white p-3 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-400 transition-all"
                  />
                  <button type="button" onClick={() => setShowRebootPw(!showRebootPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600">
                    {showRebootPw ? <EyeOff className="w-4 h-4" strokeWidth={1.5} /> : <Eye className="w-4 h-4" strokeWidth={1.5} />}
                  </button>
                  </div>
                </div>
                <button
                  onClick={handleRebootConfirm}
                  className="w-full bg-rose-500 text-white text-sm font-medium px-5 py-2.5 rounded-xl hover:bg-rose-600 transition-colors mt-2"
                >
                  재부팅 실행
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Test Modal Overlay */}
      <AnimatePresence>
        {selectedDevice && isTestMode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => {
              setIsTestMode(false);
              setSelectedDevice(null);
            }}
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
                    <Terminal
                      className="w-4 h-4 text-primary-dark"
                      strokeWidth={1.5}
                    />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-zinc-900">
                      얼굴 인식 테스트
                    </h2>
                    <p className="text-xs text-zinc-400">
                      {selectedDevice.room} / {selectedDevice.ip}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setIsTestMode(false);
                    setSelectedDevice(null);
                  }}
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
                    <span className="text-sm font-medium text-zinc-700">
                      Live Feed
                    </span>
                    <span className="text-xs text-zinc-400 font-mono">
                      {selectedDevice.ip}
                    </span>
                  </div>

                  <div className="flex-1 bg-zinc-900 rounded-xl relative overflow-hidden flex items-center justify-center min-h-[300px]">
                    <Webcam
                      audio={false}
                      className={`w-full h-full object-cover rounded-xl ${testResult?.status === "scanning" ? "opacity-70" : "opacity-90"}`}
                    />

                    {/* Scanning Overlay */}
                    {testResult?.status === "scanning" && (
                      <div className="absolute inset-0 z-10 pointer-events-none rounded-xl">
                        <motion.div
                          animate={{ top: ["0%", "100%", "0%"] }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "linear",
                          }}
                          className="absolute left-0 right-0 h-0.5 bg-primary shadow-[0_0_8px_rgba(197,216,59,0.5)]"
                        />
                        <div className="absolute inset-0 bg-primary/5 flex items-center justify-center rounded-xl">
                          <span className="bg-zinc-900/80 text-primary-dark px-4 py-2 rounded-lg text-sm font-medium backdrop-blur-sm animate-pulse">
                            분석 중...
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Result Overlay */}
                    {testResult?.status === "success" && (
                      <div className="absolute inset-0 pointer-events-none p-4 rounded-xl">
                        <div className="absolute top-[20%] left-[30%] w-[100px] h-[100px] border-2 border-primary rounded-lg bg-primary/10 flex flex-col">
                          <span className="bg-primary text-white text-xs font-medium w-fit px-1.5 py-0.5 rounded-br-lg">
                            99%
                          </span>
                        </div>
                        <div className="absolute top-[40%] right-[20%] w-[120px] h-[120px] border-2 border-primary rounded-lg bg-primary/10 flex flex-col">
                          <span className="bg-primary text-white text-xs font-medium w-fit px-1.5 py-0.5 rounded-br-lg">
                            97%
                          </span>
                        </div>
                        <div className="absolute bottom-[10%] left-[40%] w-[110px] h-[110px] border-2 border-rose-400 rounded-lg bg-rose-400/10 flex flex-col">
                          <span className="bg-rose-500 text-white text-xs font-medium w-fit px-1.5 py-0.5 rounded-br-lg">
                            미등록
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: Controls & Logs */}
                <div className="w-full md:w-[300px] lg:w-[340px] shrink-0 flex flex-col">
                  <div className="px-5 py-4 border-b border-zinc-100">
                    <h3 className="text-sm font-semibold text-zinc-900 flex items-center gap-2">
                      <Settings
                        className="w-4 h-4 text-zinc-400"
                        strokeWidth={1.5}
                      />{" "}
                      테스트 제어
                    </h3>
                  </div>

                  <div className="p-5 space-y-4 flex-1">
                    <button
                      onClick={simulateFaceRecognition}
                      disabled={testResult?.status === "scanning"}
                      className="w-full bg-primary text-white text-sm font-medium px-5 py-2.5 rounded-xl hover:bg-primary-hover transition-colors disabled:opacity-50 flex justify-center items-center gap-2"
                    >
                      {testResult?.status === "scanning" ? (
                        <RefreshCw
                          className="w-4 h-4 animate-spin"
                          strokeWidth={1.5}
                        />
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
                          <ShieldCheck
                            className="w-4 h-4 text-primary-dark"
                            strokeWidth={1.5}
                          />
                          <span className="text-sm font-medium text-zinc-700">
                            테스트 결과
                          </span>
                        </div>
                        <div className="space-y-1.5 text-sm text-zinc-600">
                          <div className="flex justify-between">
                            <span>API 응답 시간</span>
                            <span className="font-medium text-zinc-900">
                              {testResult.latency}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>감지된 얼굴</span>
                            <span className="font-medium text-zinc-900">
                              {testResult.total}명
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>DB 매칭 성공</span>
                            <span className="font-medium text-zinc-900">
                              {testResult.matched}명
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>평균 신뢰도</span>
                            <span className="font-medium text-zinc-900">
                              {testResult.confidence}
                            </span>
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
                    <p className="text-xs font-medium text-zinc-400 mb-2.5">
                      디바이스 정보
                    </p>
                    <ul className="text-sm space-y-1.5">
                      <li className="flex justify-between">
                        <span className="text-zinc-500">모델</span>{" "}
                        <span className="font-medium text-zinc-700">
                          Raspberry Pi 4B
                        </span>
                      </li>
                      <li className="flex justify-between">
                        <span className="text-zinc-500">해상도</span>{" "}
                        <span className="font-medium text-zinc-700">
                          1920x1080
                        </span>
                      </li>
                      <li className="flex justify-between">
                        <span className="text-zinc-500">MAC</span>{" "}
                        <span className="font-medium text-zinc-700 font-mono text-xs">
                          {selectedDevice.mac}
                        </span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
