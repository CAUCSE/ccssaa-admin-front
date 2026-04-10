import type { AuthSession } from "@/types/auth"

const ACCESS_TOKEN_KEY = "accessToken"
const AUTH_SESSION_KEY = "authSession"

export const getAccessToken = (): string | null => {
  if (typeof window === "undefined") return null
  return localStorage.getItem(ACCESS_TOKEN_KEY)
}

export const getAuthSession = (): AuthSession | null => {
  if (typeof window === "undefined") return null
  const raw = localStorage.getItem(AUTH_SESSION_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as AuthSession
  } catch {
    return null
  }
}

export const setAuthSession = (session: AuthSession): void => {
  if (typeof window === "undefined") return
  localStorage.setItem(ACCESS_TOKEN_KEY, session.accessToken)
  localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(session))
}

export const removeTokens = (): void => {
  if (typeof window === "undefined") return
  localStorage.removeItem(ACCESS_TOKEN_KEY)
  localStorage.removeItem(AUTH_SESSION_KEY)
}

export const isAuthenticated = (): boolean => {
  return getAccessToken() !== null
}
