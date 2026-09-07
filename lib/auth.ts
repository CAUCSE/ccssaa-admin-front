import type { AuthSession, Role } from "@/types/auth"

const AUTH_SESSION_KEY = "ccssaaAdminSession"
const LEGACY_AUTH_KEYS = [
  "accessToken",
  "refreshToken",
  "authSession",
  "rememberMe",
  "me",
  "userInfo",
  "user",
]

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null
}

const ROLES: readonly Role[] = [
  "SYSTEM_ADMIN",
  "ADMIN",
  "PRESIDENT",
  "VICE_PRESIDENT",
  "COUNCIL",
  "LEADER_1",
  "LEADER_2",
  "LEADER_3",
  "LEADER_4",
  "LEADER_ALUMNI",
  "ALUMNI_MANAGER",
  "COMMON",
  "NONE",
  "LEADER_CIRCLE",
  "PROFESSOR",
]

const isRole = (value: unknown): value is Role =>
  typeof value === "string" && ROLES.includes(value as Role)

export const hasAdminAccess = (roles: readonly Role[]): boolean =>
  roles.includes("ADMIN") || roles.includes("SYSTEM_ADMIN")

export const isSystemAdmin = (roles: readonly Role[]): boolean =>
  roles.includes("SYSTEM_ADMIN")

export const assertAdminSession = (session: AuthSession): AuthSession => {
  if (!hasAdminAccess(session.roles)) {
    throw new Error("관리자 권한이 없습니다.")
  }
  return session
}

const isAuthSession = (value: unknown): value is AuthSession => {
  return (
    isRecord(value) &&
    typeof value.accessToken === "string" &&
    typeof value.refreshToken === "string" &&
    typeof value.name === "string" &&
    typeof value.email === "string" &&
    typeof value.onboardingStatus === "string" &&
    typeof value.academicStatus === "string" &&
    Array.isArray(value.roles) &&
    value.roles.every(isRole)
  )
}

const readSessionFrom = (storage: Storage): AuthSession | null => {
  const raw = storage.getItem(AUTH_SESSION_KEY)
  if (!raw) return null

  try {
    const parsed = JSON.parse(raw) as unknown
    if (isAuthSession(parsed)) return parsed
  } catch {
    // Invalid session data is cleared below.
  }

  storage.removeItem(AUTH_SESSION_KEY)
  return null
}

const removeLegacyAuthKeys = (): void => {
  LEGACY_AUTH_KEYS.forEach((key) => {
    localStorage.removeItem(key)
    sessionStorage.removeItem(key)
  })
}

export const getAuthSession = (): AuthSession | null => {
  if (typeof window === "undefined") return null
  return readSessionFrom(localStorage) ?? readSessionFrom(sessionStorage)
}

export const getAccessToken = (): string | null => {
  return getAuthSession()?.accessToken ?? null
}

export const getRefreshToken = (): string | null => {
  return getAuthSession()?.refreshToken ?? null
}

export const setAuthSession = (
  session: AuthSession,
  persist?: boolean
): void => {
  if (typeof window === "undefined") return

  const shouldPersist =
    persist ?? localStorage.getItem(AUTH_SESSION_KEY) !== null
  const storage = shouldPersist ? localStorage : sessionStorage
  const other = shouldPersist ? sessionStorage : localStorage

  storage.setItem(AUTH_SESSION_KEY, JSON.stringify(session))
  other.removeItem(AUTH_SESSION_KEY)
  removeLegacyAuthKeys()
}

export const removeTokens = (): void => {
  if (typeof window === "undefined") return
  localStorage.removeItem(AUTH_SESSION_KEY)
  sessionStorage.removeItem(AUTH_SESSION_KEY)
  removeLegacyAuthKeys()
}

export const isAuthenticated = (): boolean => {
  return getAuthSession() !== null
}

const getJwtExpiration = (token: string): number | null => {
  const payload = token.split(".")[1]
  if (!payload) return null

  try {
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/")
    const normalized = base64.padEnd(
      base64.length + ((4 - (base64.length % 4)) % 4),
      "="
    )
    const decoded = JSON.parse(atob(normalized)) as unknown
    return isRecord(decoded) && typeof decoded.exp === "number"
      ? decoded.exp
      : null
  } catch {
    return null
  }
}

export const isAccessTokenValid = (): boolean => {
  const accessToken = getAccessToken()
  if (!accessToken) return false

  const expiresAt = getJwtExpiration(accessToken)
  return expiresAt !== null && expiresAt * 1000 > Date.now()
}
