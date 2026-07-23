import type { AuthSession } from "@/types/auth"

const ACCESS_TOKEN_KEY = "accessToken"
const REFRESH_TOKEN_KEY = "refreshToken"
const AUTH_SESSION_KEY = "authSession"
const REMEMBER_ME_KEY = "rememberMe"
const LEGACY_SESSION_KEYS = ["me", "userInfo", "user"]

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null
}

type StoredAuthProfile = Omit<AuthSession, "accessToken" | "refreshToken">

const isStoredAuthProfile = (value: unknown): value is StoredAuthProfile => {
  return (
    isRecord(value) &&
    typeof value.name === "string" &&
    typeof value.email === "string" &&
    typeof value.onboardingStatus === "string" &&
    typeof value.academicStatus === "string"
  )
}

const removeLegacy = (storage: Storage): void => {
  storage.removeItem(ACCESS_TOKEN_KEY)
  storage.removeItem(REFRESH_TOKEN_KEY)
  storage.removeItem(AUTH_SESSION_KEY)
  LEGACY_SESSION_KEYS.forEach((key) => storage.removeItem(key))
}

const removeLegacyAuthKeys = (): void => {
  removeLegacy(localStorage)
  removeLegacy(sessionStorage)
}

const readLegacySessionFrom = (storage: Storage): AuthSession | null => {
  const accessToken = storage.getItem(ACCESS_TOKEN_KEY)
  const refreshToken = storage.getItem(REFRESH_TOKEN_KEY)
  if (!accessToken || !refreshToken) return null

  for (const key of LEGACY_SESSION_KEYS) {
    const raw = storage.getItem(key)
    if (!raw) continue

    try {
      const parsed = JSON.parse(raw) as unknown

      if (isStoredAuthProfile(parsed)) {
        return {
          accessToken,
          refreshToken,
          name: parsed.name,
          email: parsed.email,
          profileImage: isRecord(parsed.profileImage)
            ? {
                profileImageType:
                  typeof parsed.profileImage.profileImageType === "string"
                    ? parsed.profileImage.profileImageType
                    : "",
                profileImageUrl:
                  typeof parsed.profileImage.profileImageUrl === "string"
                    ? parsed.profileImage.profileImageUrl
                    : "",
              }
            : null,
          onboardingStatus: parsed.onboardingStatus,
          academicStatus: parsed.academicStatus,
        }
      }
    } catch {
      storage.removeItem(key)
    }
  }

  return null
}

export const getRememberMe = (): boolean => {
  if (typeof window === "undefined") return false
  return localStorage.getItem(REMEMBER_ME_KEY) === "true"
}

export const setRememberMe = (value: boolean): void => {
  if (typeof window === "undefined") return
  localStorage.setItem(REMEMBER_ME_KEY, value ? "true" : "false")
}

const sessionStore = (): Storage =>
  getRememberMe() ? localStorage : sessionStorage

const readFromStorage = (storage: Storage, key: string): string | null => {
  return storage.getItem(key)
}

export const getAccessToken = (): string | null => {
  if (typeof window === "undefined") return null
  // Check active storage first, then fallback to the other
  const active = sessionStore().getItem(ACCESS_TOKEN_KEY)
  if (active) return active
  const fallback =
    (getRememberMe() ? sessionStorage : localStorage).getItem(ACCESS_TOKEN_KEY)
  return fallback || null
}

export const getRefreshToken = (): string | null => {
  if (typeof window === "undefined") return null
  const active = sessionStore().getItem(REFRESH_TOKEN_KEY)
  if (active) return active
  return (getRememberMe() ? sessionStorage : localStorage).getItem(
    REFRESH_TOKEN_KEY
  )
}

export const getAuthSession = (): AuthSession | null => {
  if (typeof window === "undefined") return null
  const accessToken = getAccessToken()
  const refreshToken = getRefreshToken()
  if (!accessToken || !refreshToken) return null

  const hydrateSession = (value: unknown): AuthSession | null =>
    isStoredAuthProfile(value)
      ? { ...value, accessToken, refreshToken }
      : null

  // Try active storage first
  const activeRaw = sessionStore().getItem(AUTH_SESSION_KEY)
  if (activeRaw) {
    try {
      const parsed = JSON.parse(activeRaw) as unknown
      const session = hydrateSession(parsed)
      if (session) return session
    } catch {
      // fall through
    }
  }

  // Fallback to the other storage
  const fallbackStorage = getRememberMe() ? sessionStorage : localStorage
  const fallbackRaw = fallbackStorage.getItem(AUTH_SESSION_KEY)
  if (fallbackRaw) {
    try {
      const parsed = JSON.parse(fallbackRaw) as unknown
      const session = hydrateSession(parsed)
      if (session) {
        // Migrate to active storage
        setAuthSession(session)
        return session
      }
    } catch {
      // fall through
    }
  }

  // Legacy session check
  const legacy = readLegacySessionFrom(localStorage)
  if (legacy) return legacy
  const legacySs = readLegacySessionFrom(sessionStorage)
  if (legacySs) return legacySs

  removeLegacyAuthKeys()
  return null
}

export const setAuthSession = (session: AuthSession): void => {
  if (typeof window === "undefined") return
  const storage = sessionStore()
  const { accessToken, refreshToken, ...profile } = session
  storage.setItem(ACCESS_TOKEN_KEY, accessToken)
  storage.setItem(REFRESH_TOKEN_KEY, refreshToken)
  storage.setItem(AUTH_SESSION_KEY, JSON.stringify(profile))
  // Clear the other storage to avoid stale tokens
  const other = getRememberMe() ? sessionStorage : localStorage
  other.removeItem(ACCESS_TOKEN_KEY)
  other.removeItem(REFRESH_TOKEN_KEY)
  other.removeItem(AUTH_SESSION_KEY)
}

export const removeTokens = (): void => {
  if (typeof window === "undefined") return
  removeLegacyAuthKeys()
}

export const isAuthenticated = (): boolean => {
  return getAccessToken() !== null && getRefreshToken() !== null
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
