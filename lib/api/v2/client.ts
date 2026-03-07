/**
 * v2 API 전용 axios 클라이언트
 * baseURL: .../api/v2, Bearer 토큰 + 401 시 재발급·재시도
 */

import axios, { type InternalAxiosRequestConfig } from "axios"
import { getAccessToken, removeTokens } from "@/lib/auth"
import { refreshTokens } from "@/lib/api/auth"

export const apiV2 = axios.create({
  baseURL:
    (process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080") +
    "/api/v2",
  withCredentials: false,
})

let isRefreshing = false
let refreshSubscribers: Array<(accessToken: string) => void> = []

const onRefreshed = (accessToken: string) => {
  refreshSubscribers.forEach((cb) => cb(accessToken))
  refreshSubscribers = []
}

const addRefreshSubscriber = (cb: (accessToken: string) => void) => {
  refreshSubscribers.push(cb)
}

apiV2.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = typeof window !== "undefined" ? getAccessToken() : null
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

apiV2.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status !== 401) {
      return Promise.reject(error)
    }

    if (!originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve) => {
          addRefreshSubscriber((accessToken: string) => {
            originalRequest.headers.Authorization = `Bearer ${accessToken}`
            resolve(apiV2(originalRequest))
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
          return apiV2(originalRequest)
        }
      } catch {
        // ignore
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
