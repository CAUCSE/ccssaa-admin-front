import axios from "axios"
import { applyAuthInterceptors } from "@/lib/api/interceptors"

const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080"

// v1 API 클라이언트
export const apiV1 = axios.create({
  baseURL: baseURL + "/api/v1",
  withCredentials: false,
})

applyAuthInterceptors(apiV1, {
  // token/update, sign-out 는 body로 토큰 전달하므로 Authorization 헤더 제외
  skipAuthUrls: ["token/update", "sign-out"],
  // token/update, sign-out 자체가 401이면 refresh 없이 바로 로그아웃
  immediateLogoutUrls: ["token/update", "sign-out"],
  // sign-in 401 = 잘못된 비밀번호 → 호출부(로그인 페이지)에서 토스트 처리
  passThrough401Urls: ["sign-in"],
})

// v2 API 클라이언트
export const apiV2 = axios.create({
  baseURL: baseURL + "/api/v2",
  withCredentials: false,
})

applyAuthInterceptors(apiV2)

// 하위 호환성을 위한 alias (v1 사용)
export const api = apiV1
