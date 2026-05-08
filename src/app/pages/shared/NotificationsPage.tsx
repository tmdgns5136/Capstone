import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Bell, Check, Trash2, ArrowLeft, Info, AlertTriangle, CheckCircle2, Loader2 } from "lucide-react";
import { useNavigate } from "react-router";
import { getNotifications, markNotificationRead, type NotificationData } from "../../api/notification";
import { Notification } from "../../components/NotificationBell";

const spring = { type: "spring", stiffness: 100, damping: 20 } as const;

/** 🌟 1. API 타입별 UI 제목 및 경로 설정 함수 (역할별 구분) */
function getNotificationUIConfig(type: string, role: "student" | "professor") {
  const isProfessor = role === "professor";

  switch (type) {
    case "ABSENCE_OFFICIAL":
      return {
        title: "공결 신청",
        uiType: "info" as const,
        link: isProfessor ? "/professor/appeal-management" : "/student/absence-request"
      };
    case "ABSENCE_OBJECTION":
      return {
        title: "이의 신청",
        uiType: "warning" as const,
        link: isProfessor ? "/professor/absence-management" : "/student/absence-objection"
      };
    case "ANSWER":
      return {
        title: "답변 등록",
        uiType: "success" as const,
        link: isProfessor ? "/professor/appeal-management" : "/student"
      };
    default:
      return {
        title: "시스템 알림",
        uiType: "info" as const,
        link: `/${role}`
      };
  }
}

/** 🌟 2. 백엔드 데이터를 UI 객체로 변환 (ID 매핑 및 Link 추가) */
function toNotification(n: NotificationData, role: "student" | "professor"): Notification {
  const config = getNotificationUIConfig(n.type, role);

  return {
    id: String(n.notificationId), // 백엔드 필드명(notificationId) 매핑
    title: config.title,
    message: n.message,
    isRead: n.isRead,
    createdAt: n.createdAt,
    type: config.uiType,
    link: config.link, // handleNotificationClick에서 사용
  };
}

export default function NotificationsPage({ role }: { role: "student" | "professor" }) {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  // 🌟 3. 데이터 로딩 로직 (role 전달)
  useEffect(() => {
    setLoading(true);
    getNotifications()
      .then((res) => {
        const list = Array.isArray(res.data) ? res.data : (res.data as any)?.data || [];
        setNotifications(list.map((n: NotificationData) => toNotification(n, role)));
      })
      .catch(() => setNotifications([]))
      .finally(() => setLoading(false));
  }, [role]);

  const markAsRead = (id: string) => {
    markNotificationRead(Number(id))
      .then(() => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
      })
      .catch(() => {});
  };

  const markAllAsRead = () => {
    notifications.filter(n => !n.isRead).forEach(n => {
      markNotificationRead(Number(n.id)).catch(() => {});
    });
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const handleNotificationClick = (id: string, link?: string) => {
    console.log("이동하려는 주소:", link);
    markAsRead(id);
    if (link) {
      navigate(link); // 👈 이제 알림 클릭 시 해당 관리/조회 페이지로 이동합니다.
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const typeConfig = {
    info: { icon: Info, bg: "bg-sky-50", text: "text-sky-600", border: "border-l-sky-400" },
    warning: { icon: AlertTriangle, bg: "bg-amber-50", text: "text-amber-600", border: "border-l-amber-400" },
    success: { icon: CheckCircle2, bg: "bg-primary/10", text: "text-primary-dark", border: "border-l-primary" },
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-6 h-6 animate-spin text-zinc-400" />
      </div>
    );
  }

  // 이 아래 렌더링(JSX) 부분은 기존 디자인을 그대로 유지합니다.
  return (
    <div className="max-w-3xl mx-auto pb-12 px-3 sm:px-4">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={spring}
        className="mb-6"
      >
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-600 transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" strokeWidth={1.5} /> 돌아가기
        </button>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-2.5 rounded-xl">
              <Bell className="w-6 h-6 text-primary-dark" strokeWidth={1.5} />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900">전체 알림</h1>
              <p className="text-sm text-zinc-400">시스템의 모든 알림 내역을 확인하세요.</p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={markAllAsRead}
              className="flex items-center gap-1.5 text-sm font-medium text-zinc-500 bg-white border border-zinc-200 px-4 py-2 rounded-xl hover:bg-zinc-50 transition-colors shadow-[0_2px_8px_-2px_rgba(0,0,0,0.04)]"
            >
              <Check className="w-4 h-4" strokeWidth={1.5} /> 모두 읽음
            </button>
            <button
              onClick={clearAll}
              className="flex items-center gap-1.5 text-sm font-medium text-rose-500 bg-white border border-zinc-200 px-4 py-2 rounded-xl hover:bg-rose-50 transition-colors shadow-[0_2px_8px_-2px_rgba(0,0,0,0.04)]"
            >
              <Trash2 className="w-4 h-4" strokeWidth={1.5} /> 전체 삭제
            </button>
          </div>
        </div>
      </motion.div>

      {/* Notifications Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...spring, delay: 0.05 }}
        className="bg-white rounded-xl border border-zinc-200  overflow-hidden"
      >
        {/* Card Header */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-zinc-100 flex justify-between items-center">
          <h2 className="text-sm font-semibold text-zinc-700">알림 히스토리</h2>
          {unreadCount > 0 && (
            <span className="text-xs font-medium text-primary-dark bg-primary/10 px-2.5 py-1 rounded-full">
              {unreadCount}개 읽지 않음
            </span>
          )}
        </div>

        {/* Notification List */}
        <div className="min-h-[400px]">
          <AnimatePresence>
            {notifications.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-24 text-zinc-300"
              >
                <Bell className="w-12 h-12 mb-3" strokeWidth={1} />
                <p className="text-sm text-zinc-400">수신된 알림이 없습니다.</p>
              </motion.div>
            ) : (
              notifications.map((notification, index) => {
                const config = typeConfig[notification.type as keyof typeof typeConfig] || typeConfig.info;
                const IconComp = config.icon;

                return (
                  <motion.div
                    key={notification.id}
                    layout
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -40 }}
                    transition={{ ...spring, delay: index * 0.04 }}
                    onClick={() => handleNotificationClick(notification.id, notification.link)}
                    className={`relative px-4 sm:px-6 py-3 sm:py-4 cursor-pointer group transition-colors border-l-[3px] ${config.border} ${
                      notification.isRead
                        ? "bg-white hover:bg-zinc-50/80 opacity-70"
                        : "bg-zinc-50/40 hover:bg-zinc-50"
                    } ${index < notifications.length - 1 ? "border-b border-zinc-100" : ""}`}
                  >
                    <div className="flex gap-3 sm:gap-4 items-start">
                      {/* Icon */}
                      <div className={`flex-shrink-0 p-2 rounded-lg ${config.bg}`}>
                        <IconComp className={`w-5 h-5 ${config.text}`} strokeWidth={1.5} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <h3 className="text-sm font-semibold text-zinc-800 truncate">{notification.title}</h3>
                          {!notification.isRead && (
                            <span className="flex-shrink-0 w-2 h-2 bg-primary rounded-full" />
                          )}
                        </div>
                        <p className="text-sm text-zinc-500 leading-relaxed">{notification.message}</p>
                        <span className="text-xs text-zinc-300 mt-1 block">{notification.createdAt}</span>
                      </div>

                      {/* Delete Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNotification(notification.id);
                        }}
                        className="flex-shrink-0 sm:opacity-0 sm:group-hover:opacity-100 p-1.5 rounded-lg text-zinc-300 hover:text-rose-500 hover:bg-rose-50 transition-all"
                      >
                        <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                      </button>
                    </div>
                  </motion.div>
                );
              })
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}