import type { AxiosInstance, InternalAxiosRequestConfig } from "axios"
import { getAccessToken, removeTokens } from "@/lib/auth"
import { refreshTokens } from "@/lib/api/auth"

interface InterceptorOptions {
  // 요청 시 Authorization 헤더를 주입하지 않을 URL 패턴 (body로 토큰 전달하는 경우)
  skipAuthUrls?: string[]
  // 401 응답 시 refresh 없이 즉시 로그아웃할 URL 패턴
  immediateLogoutUrls?: string[]
  // 401 응답 시 리다이렉트/refresh 없이 그대로 reject할 URL 패턴 (예: sign-in)
  passThrough401Urls?: string[]
}

/**
 * Axios 인스턴스에 Bearer 토큰 주입 + 401 refresh-and-retry 인터셉터를 적용합니다.
 * isRefreshing/refreshSubscribers 상태는 인스턴스별 클로저로 격리됩니다.
 */
export function applyAuthInterceptors(
  instance: AxiosInstance,
  options: InterceptorOptions = {}
): void {
  const {
    skipAuthUrls = [],
    immediateLogoutUrls = [],
    passThrough401Urls = [],
  } = options

  // 인스턴스별 refresh 상태 (클로저로 격리)
  let isRefreshing = false
  let refreshSubscribers: Array<(accessToken: string) => void> = []

  const onRefreshed = (accessToken: string) => {
    refreshSubscribers.forEach((cb) => cb(accessToken))
    refreshSubscribers = []
  }

  const addRefreshSubscriber = (cb: (accessToken: string) => void) => {
    refreshSubscribers.push(cb)
  }

  // Request interceptor: Authorization: Bearer {token} 주입
  instance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      const url = config.url ?? ""
      const shouldSkip = skipAuthUrls.some((pattern) => url.includes(pattern))
      if (!shouldSkip) {
        const token = typeof window !== "undefined" ? getAccessToken() : null
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
      }
      return config
    },
    (error) => Promise.reject(error)
  )

  // Response interceptor: 401 → refresh → retry / 실패 시 로그아웃
  instance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config

      if (error.response?.status !== 401) {
        return Promise.reject(error)
      }

      const url = originalRequest.url ?? ""

      // 그대로 reject (리다이렉트 없이 호출부에서 처리)
      if (passThrough401Urls.some((pattern) => url.includes(pattern))) {
        return Promise.reject(error)
      }

      // 즉시 로그아웃 (refresh 없이)
      if (immediateLogoutUrls.some((pattern) => url.includes(pattern))) {
        if (typeof window !== "undefined") {
          removeTokens()
          window.location.href = "/login"
        }
        return Promise.reject(error)
      }

      if (!originalRequest._retry) {
        if (isRefreshing) {
          // 이미 재발급 중이면 완료 후 새 토큰으로 재시도
          return new Promise((resolve) => {
            addRefreshSubscriber((accessToken: string) => {
              originalRequest.headers.Authorization = `Bearer ${accessToken}`
              resolve(instance(originalRequest))
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
            return instance(originalRequest)
          }
        } catch {
          // refresh 실패 시 아래에서 로그아웃
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
  )
}
