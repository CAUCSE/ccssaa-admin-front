// 인증 관련 유틸리티 함수

export const getToken = (): string | null => {
  if (typeof window === "undefined") return null
  return localStorage.getItem("token")
}

export const setToken = (token: string): void => {
  if (typeof window === "undefined") return
  localStorage.setItem("token", token)
}

export const removeToken = (): void => {
  if (typeof window === "undefined") return
  localStorage.removeItem("token")
}

export const isAuthenticated = (): boolean => {
  return getToken() !== null
}

