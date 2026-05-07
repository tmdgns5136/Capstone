import { api } from "./client";

export interface ApiResponse<T> {
  success: boolean;
  status: number;
  data: T;
  message?: string;
}

export interface NotificationData {
  id: number;
  type: string;
  message: string;
  relatedId: number;
  isRead?: boolean;
  read?: boolean;
  createdAt: string;
}

export interface NotificationRead {
  isRead: boolean;
  redirectUrl: string;
}

export async function getNotifications() {
  return api<ApiResponse<NotificationData[]>>(
    `/api/notifications`,
    { method: "GET" },
  );
}

export async function markNotificationRead(notificationId: number) {
  return api<ApiResponse<NotificationRead>>(
    `/api/notifications/${notificationId}/read`,
    { method: "PATCH" },
  );
}
