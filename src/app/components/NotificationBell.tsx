import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Bell, Check, Trash2, ArrowRight, Info, AlertTriangle, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router";
import { getNotifications, markNotificationRead, type NotificationData } from "../api/notification";

export interface Notification {
  id: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  type: "info" | "warning" | "success";
  link?: string;
}

interface NotificationBellProps {
  role: "student" | "professor";
}

function mapTypeToUI(type: string): "info" | "warning" | "success" {
  const lower = type.toLowerCase();
  if (lower.includes("warn") || lower.includes("alert")) return "warning";
  if (lower.includes("success") || lower.includes("approv")) return "success";
  return "info";
}

function toNotification(n: NotificationData, role: string): Notification {
  return {
    id: String(n.id),
    title: n.type,
    message: n.message,
    isRead: n.isRead,
    createdAt: n.createdAt,
    type: mapTypeToUI(n.type),
  };
}

const spring = { type: "spring" as const, stiffness: 200, damping: 24 };

export function NotificationBell({ role }: NotificationBellProps) {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const fetchNotifications = useCallback(() => {
    getNotifications()
      .then((res) => {
        const list = res.data ?? [];
        setNotifications(list.map((n) => toNotification(n, role)));
      })
      .catch(() => {});
  }, [role]);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

  const clearAll = () => {
    setNotifications([]);
  };

  const handleNotificationClick = (id: string, link?: string) => {
    markAsRead(id);
    setIsOpen(false);
    if (link) {
      navigate(link);
    }
  };

  const viewAll = () => {
    setIsOpen(false);
    navigate(`/${role}/notifications`);
  };

  const typeIcon = (type: Notification["type"]) => {
    switch (type) {
      case "info":
        return (
          <div className="w-8 h-8 rounded-lg bg-sky-50 flex items-center justify-center shrink-0">
            <Info className="w-4 h-4 text-sky-500" strokeWidth={1.5} />
          </div>
        );
      case "warning":
        return (
          <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-4 h-4 text-amber-500" strokeWidth={1.5} />
          </div>
        );
      case "success":
        return (
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-4 h-4 text-primary-dark" strokeWidth={1.5} />
          </div>
        );
    }
  };

  return (
    <div className="relative z-50" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative w-9 h-9 rounded-lg hover:bg-zinc-100 flex items-center justify-center transition-colors"
      >
        <Bell className="w-[18px] h-[18px] text-zinc-500" strokeWidth={1.5} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 flex items-center justify-center bg-rose-500 text-white text-xs font-semibold rounded-full ring-2 ring-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={spring}
            className="fixed right-2 left-2 sm:left-auto sm:absolute sm:right-0 mt-2 sm:w-96 bg-white rounded-xl border border-zinc-200 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.1)] overflow-hidden origin-top-right"
          >
            {/* Header */}
            <div className="px-5 py-3.5 border-b border-zinc-100 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-zinc-800">알림</h3>
              <div className="flex items-center gap-1">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="w-7 h-7 rounded-lg hover:bg-zinc-100 flex items-center justify-center transition-colors"
                    title="모두 읽음"
                  >
                    <Check className="w-3.5 h-3.5 text-zinc-400" strokeWidth={1.5} />
                  </button>
                )}
                <button
                  onClick={clearAll}
                  className="w-7 h-7 rounded-lg hover:bg-zinc-100 flex items-center justify-center transition-colors"
                  title="모두 지우기"
                >
                  <Trash2 className="w-3.5 h-3.5 text-zinc-400" strokeWidth={1.5} />
                </button>
              </div>
            </div>

            {/* List */}
            <div className="max-h-[360px] overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="py-12 flex flex-col items-center justify-center">
                  <Bell className="w-8 h-8 text-zinc-200 mb-2" strokeWidth={1.5} />
                  <p className="text-sm text-zinc-400">새로운 알림이 없습니다</p>
                </div>
              ) : (
                <div className="divide-y divide-zinc-100">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      onClick={() => handleNotificationClick(notification.id, notification.link)}
                      className={`px-5 py-3.5 cursor-pointer transition-colors hover:bg-zinc-50/80 ${
                        notification.isRead ? "opacity-50" : ""
                      }`}
                    >
                      <div className="flex gap-3">
                        {typeIcon(notification.type)}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-0.5">
                            <h4 className="text-sm font-medium text-zinc-800 truncate">{notification.title}</h4>
                            <span className="text-[11px] text-zinc-400 shrink-0">{notification.createdAt}</span>
                          </div>
                          <p className="text-xs text-zinc-500 leading-relaxed line-clamp-2">
                            {notification.message}
                          </p>
                        </div>
                        {!notification.isRead && (
                          <div className="w-2 h-2 rounded-full bg-primary self-center shrink-0" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <button
              onClick={viewAll}
              className="w-full px-5 py-3 border-t border-zinc-100 text-sm font-medium text-primary-dark hover:bg-primary/5 transition-colors flex items-center justify-center gap-1.5 group"
            >
              전체 알림 보기
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" strokeWidth={1.5} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
