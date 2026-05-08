import { api } from "./client";

export interface NotificationData {
  notificationId: number; // 🌟 백엔드 필드명 일치
  type: string;           // ABSENCE_REQUEST, APPEAL_REQUEST, ANSWER_REGISTER
  message: string;
  relatedId: number;
  isRead: boolean;
  createdAt: string;      // "yyyy-MM-dd HH:mm"
}

export async function getNotifications() {
  return api<{ data: NotificationData[] }>("/api/notifications", {
    method: "GET",
  });
}

export async function markNotificationRead(notificationId: number) {
  return api(`/api/notifications/${notificationId}/read`, {
    method: "PATCH",
  });
}