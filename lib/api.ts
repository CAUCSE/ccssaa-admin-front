import axios, { type InternalAxiosRequestConfig } from "axios"
import { getAccessToken, removeTokens } from "@/lib/auth"
import { refreshTokens } from "@/lib/api/auth"

const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080"

// v1 API 클라이언트
export const apiV1 = axios.create({
  baseURL: baseURL + "/api/v1",
  withCredentials: false,
})

// 하위 호환성을 위한 기본 export (v1 사용)
export const api = apiV1

// 토큰 재발급 중인지 여부 (동시 401 시 한 번만 refresh 호출)
let isRefreshing = false
// 재발급 완료를 기다리는 요청들의 재시도 콜백 큐
let refreshSubscribers: Array<(accessToken: string) => void> = []

const onRefreshed = (accessToken: string) => {
  refreshSubscribers.forEach((cb) => cb(accessToken))
  refreshSubscribers = []
}

const addRefreshSubscriber = (cb: (accessToken: string) => void) => {
  refreshSubscribers.push(cb)
}

// Request interceptor: 모든 요청에 Authorization: Bearer {accessToken} 추가
// 예외: token/update(PUT), sign-out(POST) 는 body로 토큰 전달하므로 Authorization 제외
const requestInterceptor = (config: InternalAxiosRequestConfig) => {
  const url = config.url ?? ""
  if (url.includes("token/update") || url.includes("sign-out")) {
    return config
  }
  const token = typeof window !== "undefined" ? getAccessToken() : null
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
}

apiV1.interceptors.request.use(requestInterceptor, (error) => Promise.reject(error))

// Response interceptor: 401 시 토큰 재발급 시도 → 성공 시 재시도, 실패 시 로그아웃
const responseInterceptor = async (error: any) => {
  const originalRequest = error.config

  if (error.response?.status !== 401) {
    return Promise.reject(error)
  }

  // sign-in 401 = 잘못된 비밀번호 등 → 리다이렉트/refresh 하지 않고 그대로 reject (로그인 페이지에서 토스트 처리)
  if (originalRequest.url?.includes("sign-in")) {
    return Promise.reject(error)
  }

  // token/update 또는 sign-out 자체가 401이면 재시도하지 않고 로그아웃
  if (
    originalRequest.url?.includes("token/update") ||
    originalRequest.url?.includes("sign-out")
  ) {
    if (typeof window !== "undefined") {
      removeTokens()
      window.location.href = "/login"
    }
    return Promise.reject(error)
  }

  if (!originalRequest._retry) {
    if (isRefreshing) {
      // 이미 재발급 중이면 완료 후 새 accessToken으로 재시도
      return new Promise((resolve) => {
        addRefreshSubscriber((accessToken: string) => {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`
          resolve(apiV1(originalRequest))
        })
      })
    }

    originalRequest._retry = true
    isRefreshing = true

    try {
      const res = await refreshTokens()
      if (res?.accessToken) {
        onRefreshed(res.accessToken)
        originalRequest.headers.Authorization = `Bearer ${res.accessToken}`
        return apiV1(originalRequest)
      }
    } catch {
      // refresh 실패 시 무시하고 아래에서 로그아웃
    } finally {
      isRefreshing = false
    }
  }

  if (typeof window !== "undefined") {
    removeTokens()
    window.location.href = "/login"
  }
  return Promise.reject(error)
}

apiV1.interceptors.response.use((response) => response, responseInterceptor)