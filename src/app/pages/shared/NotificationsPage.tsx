import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Bell, Check, Trash2, ArrowLeft, Info, AlertTriangle, CheckCircle2, Loader2 } from "lucide-react";
import { useNavigate } from "react-router";
import { getNotifications, markNotificationRead, type NotificationData } from "../../api/notification";
import { Notification } from "../../components/NotificationBell";
import { toast } from "sonner"; // 🌟 토스트 알림 추가

const spring = { type: "spring", stiffness: 100, damping: 20 }as const;

// 🌟 [수정 1] 백엔드 실제 ENUM DB 코드 규격과 완벽하게 매칭하여 타이틀 정의
function mapTypeToUI(type: string): { title: string; uiType: "info" | "warning" | "success" } {
  switch (type) {
    case "ABSENCE_OFFICIAL":
      return { title: "공결 신청", uiType: "info" };
    case "ABSENCE_OBJECTION":
      return { title: "출결 이의신청", uiType: "warning" };
    case "NOTICE":
      return { title: "공지사항", uiType: "info" };
    case "ANSWER":
      return { title: "답변 등록", uiType: "success" };
    case "PHOTO_RESULT":
      return { title: "사진 변경 요청", uiType: "info" };
    default:
      return { title: "시스템 알림", uiType: "info" };
  }
}

function toNotification(n: NotificationData): Notification {
  const { title, uiType } = mapTypeToUI(n.type);
  const notifId = n.id ?? n.notificationId ?? 0;
  const isRead = n.isRead ?? n.read ?? false;

  return {
    id: String(notifId),
    title: title,
    message: n.message,
    isRead: isRead,
    createdAt: n.createdAt,
    type: uiType,
  };
}

export default function NotificationsPage({ role }: { role: "student" | "professor" | "admin" }) {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getNotifications()
      .then((res) => {
        const list = Array.isArray(res.data) ? res.data : (res.data as any)?.data || [];
        
        // 🌟 [수정 2] 새로고침(F5) 시 이미 읽은 알림은 히스토리창에 다시 안 나오도록 필터링 처리
        const unreadList = list
          .map(toNotification)
          .filter((n: Notification) => !n.isRead);
          
        setNotifications(unreadList);
      })
      .catch(() => setNotifications([]))
      .finally(() => setLoading(false));
  }, [role]);

  const markAsRead = (id: string) => {
    markNotificationRead(Number(id))
      .then(() => {
        // 읽은 알림은 목록에서 즉시 지워줍니다.
        setNotifications(prev => prev.filter(n => n.id !== id));
      })
      .catch(() => { });
  };

  // 🌟 [수정 3] 모두 읽음 버튼 클릭 시 백엔드 DB 상태도 전부 업데이트
  const markAllAsRead = () => {
    if (notifications.length === 0) return;
    
    notifications.forEach(n => {
      markNotificationRead(Number(n.id)).catch(() => { });
    });
    setNotifications([]);
    toast.success("모든 알림을 읽음 처리했습니다.");
  };

  // 🌟 [수정 4] 단일 삭제(휴지통) 버튼 클릭 시 백엔드 DB 상태도 '읽음'으로 동기화하여 F5 버그 차단
  const deleteNotification = (id: string) => {
    markNotificationRead(Number(id))
      .then(() => {
        setNotifications(prev => prev.filter(n => n.id !== id));
      })
      .catch(() => {
        // API 에러가 나더라도 화면에서는 우선 삭제 처리
        setNotifications(prev => prev.filter(n => n.id !== id));
      });
  };

  // 🌟 [수정 5] 전체 삭제 버튼 클릭 시 백엔드 DB 상태 전체 연동
  const clearAll = () => {
    if (notifications.length === 0) return;

    notifications.forEach(n => {
      markNotificationRead(Number(n.id)).catch(() => { });
    });
    setNotifications([]);
    toast.success("알림 히스토리를 모두 비웠습니다.");
  };

  // 🌟 [수정 6] 백엔드가 리다이렉트해 준 깔끔한 프론트엔드용 주소를 그대로 통과시킵니다.
  const mapRedirectUrl = (url: string): string | null => {
    if (!url) return null;
    
    if (url.startsWith("/professor") || url.startsWith("/student") || url.startsWith("/master") || url.startsWith("/admin")) {
      return url;
    }

    const lectureMatch = url.match(/mylecture\/(\d+)/);
    const lectureId = lectureMatch ? lectureMatch[1] : null;
    if (url.includes("/notices/") && lectureId) return `/${role}/courses/${lectureId}`;
    if (url.includes("/questions/") && lectureId) return `/${role}/courses/${lectureId}`;
    if (url.includes("/official-requests/")) return `/${role}/absence-request`;
    if (url.includes("/objection-requests/")) return `/${role}/stats`;
    if (url.includes("mypage")) return `/${role}/profile`;
    return null;
  };

  const handleNotificationClick = (id: string) => {
    markNotificationRead(Number(id))
      .then((res) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
        const url = res.data?.redirectUrl;
        const frontRoute = url ? mapRedirectUrl(url) : null;
        if (frontRoute) {
          navigate(frontRoute);
        }
      })
      .catch(() => {});
  };

  const unreadCount = notifications.length;

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
                <p className="text-sm text-zinc-400">새로운 알림이 없습니다.</p>
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
                    onClick={() => handleNotificationClick(notification.id)}
                    className={`relative px-4 sm:px-6 py-3 sm:py-4 cursor-pointer group transition-colors border-l-[3px] ${config.border} bg-white hover:bg-zinc-50/80 ${
                      index < notifications.length - 1 ? "border-b border-zinc-100" : ""
                    }`}
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
                          <span className="flex-shrink-0 w-2 h-2 bg-primary rounded-full" />
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