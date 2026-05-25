const BASE_URL = "/api/home";

interface ApiOptions extends RequestInit {
  skipAuth?: boolean;
}

// 토큰 저장/조회
export function getAccessToken(): string | null {
  return localStorage.getItem("ACCESS_TOKEN");
}

export function setAccessToken(accessToken: string) {
  localStorage.setItem("ACCESS_TOKEN", accessToken);
}

export function clearTokens() {
  localStorage.removeItem("ACCESS_TOKEN");
}

// 토큰 재발급 (refreshToken은 httpOnly 쿠키로 자동 전송)
async function refreshAccessToken(): Promise<string | null> {
  try {
    const res = await fetch(`${BASE_URL}/refresh`, {
      method: "POST",
      credentials: "include",
    });

    if (!res.ok) return null;

    const data = await res.json();
    if (data.success && data.data) {
      setAccessToken(data.data.accessToken);
      return data.data.accessToken;
    }
    return null;
  } catch {
    return null;
  }
}

// 공통 API 호출
export async function api<T = any>(
  endpoint: string,
  options: ApiOptions = {},
): Promise<T> {
  const { skipAuth = false, headers: customHeaders, ...rest } = options;

  const headers = new Headers(customHeaders);

  if (!skipAuth) {
    const token = getAccessToken();
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }

  // FormData일 경우 Content-Type을 설정하지 않음 (브라우저가 자동 설정)
  if (!(rest.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const url = endpoint.startsWith("/api/") ? endpoint : `${BASE_URL}${endpoint}`;
  let res = await fetch(url, { ...rest, headers, credentials: "include" });

  // 401이면 토큰 재발급 후 재시도
  if (res.status === 401 && !skipAuth) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      headers.set("Authorization", `Bearer ${newToken}`);
      res = await fetch(url, { ...rest, headers, credentials: "include" });
    }
  }

  const data = await res.json();

  if (!res.ok || !data.success) {
    throw new Error(data.message || "요청에 실패했습니다.");
  }

  return data;
}
