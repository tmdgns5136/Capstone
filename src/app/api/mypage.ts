import { api } from "./client";

// 1-5. 마이페이지 프로필 조회
export interface ProfileImage {
  orientation: string;
  url: string;
}

export interface ProfileData {
  userName: string;
  userNum: string;
  major?: string;
  userEmail: string;
  phoneNum?: string;
  faceRegistrationsStatus: "PENDING" | "APPROVED" | "REJECTED";
  profileImages: ProfileImage[];
}

export async function getProfile() {
  return api<{ data: ProfileData }>("/api/mypage", {
    method: "GET",
  });
}

// 1-5-1. 프로필 수정
export async function updateProfile(phoneNum: string) {
  return api("/api/mypage/info-change", {
    method: "PATCH",
    body: JSON.stringify({ phoneNum }),
  });
}

// 1-5-2. 비밀번호 변경 (마이페이지)
export async function changePasswordMypage(
  newPassword: string,
) {
  return api("/api/mypage/password-change", {
    method: "PATCH",
    body: JSON.stringify({ newPassword }),
  });
}

// 1-5-3. 프로필 사진 변경 요청
export async function requestPhotoChange(
  leftImage: File,
  centerImage: File,
  rightImage: File,
) {
  const formData = new FormData();
  formData.append("leftImage", leftImage);
  formData.append("centerImage", centerImage);
  formData.append("rightImage", rightImage);

  return api("/api/mypage/profileimg-request", {
    method: "PATCH",
    body: formData,
  });
}

// 1-5-4. 사진 변경 요청 내역 조회
export interface PhotoRequestItem {
  requestId: string;
  requestDate: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  profileImages: ProfileImage[];
  rejectReason?: string;
}

export async function getPhotoRequests() {
  return api<{ data: PhotoRequestItem[] }>("/api/mypage/profileimg-requests-list", {
    method: "GET",
  });
}

// 1-7. 회원 탈퇴
export async function withdraw() {
  return api("/api/mypage/withdraw", {
    method: "POST",
  });
}
