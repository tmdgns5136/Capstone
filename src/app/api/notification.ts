import { api } from "./client";

export interface NotificationData {
  id: number;
  notificationId?: number;
  type: string;           // ABSENCE_REQUEST, APPEAL_REQUEST, ANSWER_REGISTER, PHOTO_RESULT
  message: string;
  lectureName?: string | null;
  relatedId: number | string;
  read: boolean;
  isRead?: boolean;
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