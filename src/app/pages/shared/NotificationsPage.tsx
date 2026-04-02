import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Bell, Check, Trash2, ArrowLeft, Info, AlertTriangle, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router";
import { Notification } from "../../components/NotificationBell";

const spring = { type: "spring", stiffness: 100, damping: 20 };

export default function NotificationsPage({ role }: { role: "student" | "professor" }) {
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    // Shared mock data fetching (In real app, this would be an API call)
    if (role === "student") {
      setNotifications([
        {
          id: "1",
          title: "출결 상태 변경",
          message: "데이터베이스 심화 과목의 출결 상태가 '지각'으로 변경되었습니다.",
          isRead: false,
          createdAt: "10분 전",
          type: "warning",
          link: "/student/stats/데이터베이스"
        },
        {
          id: "2",
          title: "공결 신청 승인",
          message: "운영체제 과목의 공결 신청이 승인되었습니다.",
          isRead: false,
          createdAt: "1시간 전",
          type: "success",
          link: "/student/absence-request"
        },
        {
          id: "3",
          title: "시스템 알림",
          message: "서버 점검이 예정되어 있습니다. (02:00 - 04:00)",
          isRead: true,
          createdAt: "1일 전",
          type: "info",
          link: "/student"
        },
        {
          id: "4",
          title: "새로운 과제",
          message: "네트워크 프로그래밍 과목에 새로운 과제가 등록되었습니다.",
          isRead: true,
          createdAt: "2일 전",
          type: "info",
          link: "/student/courses"
        },
      ]);
    } else {
      setNotifications([
        {
          id: "1",
          title: "새로운 공결 신청",
          message: "김철수 학생이 알고리즘 과목에 공결을 신청했습니다.",
          isRead: false,
          createdAt: "5분 전",
          type: "info",
          link: "/professor/absence-management"
        },
        {
          id: "2",
          title: "출결 시스템 경고",
          message: "405호 라즈베리파이 센서 연결이 불안정합니다.",
          isRead: false,
          createdAt: "30분 전",
          type: "warning",
          link: "/professor/class-control"
        },
        {
          id: "3",
          title: "데이터 동기화 완료",
          message: "어제 강의의 출결 데이터 분석이 완료되었습니다.",
          isRead: true,
          createdAt: "2시간 전",
          type: "success",
          link: "/professor/monitoring"
        },
        {
          id: "4",
          title: "학생 등록",
          message: "이영희 학생이 새로운 강의에 수강 신청했습니다.",
          isRead: true,
          createdAt: "1일 전",
          type: "info",
          link: "/professor/courses"
        },
      ]);
    }
  }, [role]);

  const markAsRead = (id: string) => {
    setNotifications(notifications.map(n =>
      n.id === id ? { ...n, isRead: true } : n
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, isRead: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const handleNotificationClick = (id: string, link?: string) => {
    markAsRead(id);
    if (link) {
      navigate(link);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const typeConfig = {
    info: { icon: Info, bg: "bg-sky-50", text: "text-sky-600", border: "border-l-sky-400" },
    warning: { icon: AlertTriangle, bg: "bg-amber-50", text: "text-amber-600", border: "border-l-amber-400" },
    success: { icon: CheckCircle2, bg: "bg-primary/10", text: "text-primary-dark", border: "border-l-primary" },
  };

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
