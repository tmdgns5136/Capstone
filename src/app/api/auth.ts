import { api } from "./client";

// 로그인
export interface LoginData {
  userName: string;
  role: string;
  accessToken: string;
  major?: string;
}

export async function login(userNum: string, password: string) {
  return api<{ data: LoginData }>("/login", {
    method: "POST",
    skipAuth: true,
    body: JSON.stringify({ userNum, password }),
  });
}

// 로그아웃
export async function logout() {
  return api("/logout", { method: "POST" });
}

// 학생 회원가입 (multipart: 이미지 3장 포함)
export async function signupStudent(
  userNum: string,
  userName: string,
  userEmail: string,
  password: string,
  phoneNum: string,
  leftImage: File,
  centerImage: File,
  rightImage: File,
) {
  const formData = new FormData();
  formData.append(
    "joinRequest",
    new Blob([JSON.stringify({ userNum, userName, userEmail, password, phoneNum: phoneNum.replace(/\D/g, "") })], {
      type: "application/json",
    }),
  );
  formData.append("leftImage", leftImage);
  formData.append("centerImage", centerImage);
  formData.append("rightImage", rightImage);

  return api("/signup/student", {
    method: "POST",
    skipAuth: true,
    body: formData,
  });
}

// 교수 회원가입
export async function signupProfessor(
  userNum: string,
  userName: string,
  userEmail: string,
  password: string,
  phoneNum: string,
  major: string
) {
  return api("/signup/professor", {
    method: "POST",
    skipAuth: true,
    body: JSON.stringify({ userNum, userName, userEmail, password, phoneNum: phoneNum.replace(/\D/g, ""), major }),
  });
}

// 이메일 인증번호 발송 (회원가입용)
export async function sendEmailCode(email: string) {
  return api("/email-send", {
    method: "POST",
    skipAuth: true,
    body: JSON.stringify({ email }),
  });
}

// 이메일 인증번호 발송 (비밀번호 찾기용)
export async function sendPasswordEmailCode(email: string) {
  return api("/password-email-send", {
    method: "POST",
    skipAuth: true,
    body: JSON.stringify({ email }),
  });
}

// 이메일 인증번호 확인
export async function verifyEmailCode(email: string, code: string) {
  return api("/email-check", {
    method: "POST",
    skipAuth: true,
    body: JSON.stringify({ email, code }),
  });
}

// 1-4. 비밀번호 찾기 변경
export async function changePassword(
  newPassword: string,
  userEmail: string,
) {
  return api("/password-change", {
    method: "PATCH",
    skipAuth: true,
    body: JSON.stringify({ newPassword, userEmail }),
  });
}

// 1-6. 비밀번호 확인
export async function checkPassword(currentPassword: string) {
  return api("/password-check", {
    method: "POST",
    body: JSON.stringify({ currentPassword }),
  });
}
