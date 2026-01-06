import axios from "axios"

export const api = axios.create({
  baseURL: (process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080") + "/api/v1",
  withCredentials: true,
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // JWT 토큰이 있다면 헤더에 추가
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // 인증 실패 시 로그인 페이지로 리다이렉트
      if (typeof window !== "undefined") {
        localStorage.removeItem("token")
        window.location.href = "/login"
      }
    }
    return Promise.reject(error)
  }
)

