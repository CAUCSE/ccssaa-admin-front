import axios, { type InternalAxiosRequestConfig } from "axios"
import { getAccessToken, removeTokens } from "@/lib/auth"
import { refreshTokens } from "@/lib/api/auth"

const backendOrigin = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080"
const apiOrigin = typeof window === "undefined" ? backendOrigin : ""

export const api = axios.create({
  baseURL: apiOrigin + "/api/v2",
  withCredentials: true,
})

// 토큰 재발급 중인지 여부 (동시 401 시 한 번만 refresh 호출)
let isRefreshing = false
// 재발급 완료를 기다리는 요청들의 재시도 콜백 큐
let refreshSubscribers: Array<{
  resolve: (accessToken: string) => void
  reject: (error: unknown) => void
}> = []

const onRefreshed = (accessToken: string) => {
  refreshSubscribers.forEach(({ resolve }) => resolve(accessToken))
  refreshSubscribers = []
}

const onRefreshFailed = (error: unknown) => {
  refreshSubscribers.forEach(({ reject }) => reject(error))
  refreshSubscribers = []
}

const addRefreshSubscriber = (
  resolve: (accessToken: string) => void,
  reject: (error: unknown) => void
) => {
  refreshSubscribers.push({ resolve, reject })
}

const requestInterceptor = (config: InternalAxiosRequestConfig) => {
  const token = typeof window !== "undefined" ? getAccessToken() : null
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
}

api.interceptors.request.use(requestInterceptor, (error) => Promise.reject(error))

const responseInterceptor = async (error: any) => {
  const originalRequest = error.config

  if (error.response?.status !== 401) {
    return Promise.reject(error)
  }

  if (!originalRequest._retry) {
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        addRefreshSubscriber(
          (accessToken: string) => {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`
          resolve(api(originalRequest))
          },
          reject
        )
      })
    }

    originalRequest._retry = true
    isRefreshing = true

    try {
      const res = await refreshTokens()
      if (res?.accessToken) {
        onRefreshed(res.accessToken)
        originalRequest.headers.Authorization = `Bearer ${res.accessToken}`
        return api(originalRequest)
      }
      onRefreshFailed(error)
    } catch (refreshError) {
      onRefreshFailed(refreshError)
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

api.interceptors.response.use((response) => response, responseInterceptor)
