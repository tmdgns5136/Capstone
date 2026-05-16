import { api } from "./client";

export type CameraStatus = "OK" | "DISCONNECTED" | "CAPTURE_FAIL";
export type NetworkStatus = "ONLINE" | "OFFLINE" | "UNSTABLE";

export interface AdminDeviceErrorLog {
  id: number;
  errorCode: string;
  message: string;
  createdAt: string;
}

export interface AdminDevice {
  deviceId: string;
  classroom: string;
  deviceName: string;
  deviceSecret: string;
  deviceStatus?: string;
  loggedIn: boolean;
  isLoggedIn: boolean;
  uptime: string;
  lastHeartbeat: string;
  cameraStatus: CameraStatus;
  networkStatus: NetworkStatus;
  config: {
    active: boolean;
    captureIntervalSec: number;
    heartbeatIntervalSec: number;
    commandPollIntervalSec?: number;
    imageWidth: number;
    imageHeight: number;
    imageQuality: number;
    maxUploadSizeMb: number;
    allowedImageTypes?: string;
    offlineStorageLimit?: number;
    timezone?: string;
  };
  errorLogs: AdminDeviceErrorLog[];
}

function normalizeDevice(device: Omit<AdminDevice, "isLoggedIn"> & { isLoggedIn?: boolean; loggedIn?: boolean }): AdminDevice {
  return {
    ...device,
    isLoggedIn: Boolean(device.isLoggedIn ?? device.loggedIn),
    loggedIn: Boolean(device.loggedIn ?? device.isLoggedIn),
    cameraStatus: device.cameraStatus ?? "DISCONNECTED",
    networkStatus: device.networkStatus ?? "OFFLINE",
    errorLogs: device.errorLogs ?? [],
  };
}

export async function getAdminDevices() {
  const response = await api<{ data: AdminDevice[] }>("/api/admin/devices");
  return (response.data ?? []).map(normalizeDevice);
}

export async function registerAdminDevice(deviceId: string, classroom: string, deviceName: string) {
  const response = await api<{ data: { deviceId: string; classroom: string; deviceSecret: string; deviceStatus: string } }>(
    "/api/admin/devices",
    {
      method: "POST",
      body: JSON.stringify({ deviceId, classroom, deviceName }),
    },
  );

  return response.data;
}

export async function checkAdminPassword(currentPassword: string) {
  return api("/api/admin/password-check", {
    method: "POST",
    body: JSON.stringify({ currentPassword }),
  });
}
