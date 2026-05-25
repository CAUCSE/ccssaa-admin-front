import type { AuthSession } from "@/types/auth"

const ACCESS_TOKEN_KEY = "accessToken"
const AUTH_SESSION_KEY = "authSession"
const REMEMBER_ME_KEY = "rememberMe"
const LEGACY_SESSION_KEYS = ["me", "userInfo", "user"]
const LEGACY_TOKEN_KEYS = ["refreshToken"]

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null
}

const isAuthSession = (value: unknown): value is AuthSession => {
  return (
    isRecord(value) &&
    typeof value.accessToken === "string" &&
    typeof value.name === "string" &&
    typeof value.email === "string" &&
    typeof value.onboardingStatus === "string" &&
    typeof value.academicStatus === "string"
  )
}

const removeLegacy = (storage: Storage): void => {
  storage.removeItem(ACCESS_TOKEN_KEY)
  storage.removeItem(AUTH_SESSION_KEY)
  LEGACY_SESSION_KEYS.forEach((key) => storage.removeItem(key))
  LEGACY_TOKEN_KEYS.forEach((key) => storage.removeItem(key))
}

const removeLegacyAuthKeys = (): void => {
  removeLegacy(localStorage)
  removeLegacy(sessionStorage)
}

const readLegacySessionFrom = (storage: Storage): AuthSession | null => {
  const accessToken = storage.getItem(ACCESS_TOKEN_KEY)
  if (!accessToken) return null

  for (const key of LEGACY_SESSION_KEYS) {
    const raw = storage.getItem(key)
    if (!raw) continue

    try {
      const parsed = JSON.parse(raw) as unknown

      if (isAuthSession(parsed)) return parsed

      if (
        isRecord(parsed) &&
        typeof parsed.name === "string" &&
        typeof parsed.email === "string" &&
        typeof parsed.onboardingStatus === "string" &&
        typeof parsed.academicStatus === "string"
      ) {
        return {
          accessToken,
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
  if (typeof window === "undefined") return true
  return localStorage.getItem(REMEMBER_ME_KEY) !== "false"
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

export const getAuthSession = (): AuthSession | null => {
  if (typeof window === "undefined") return null

  // Try active storage first
  const activeRaw = sessionStore().getItem(AUTH_SESSION_KEY)
  if (activeRaw) {
    try {
      const parsed = JSON.parse(activeRaw) as unknown
      if (isAuthSession(parsed)) return parsed
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
      if (isAuthSession(parsed)) {
        // Migrate to active storage
        setAuthSession(parsed)
        return parsed
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
  storage.setItem(ACCESS_TOKEN_KEY, session.accessToken)
  storage.setItem(AUTH_SESSION_KEY, JSON.stringify(session))
  // Clear the other storage to avoid stale tokens
  const other = getRememberMe() ? sessionStorage : localStorage
  other.removeItem(ACCESS_TOKEN_KEY)
  other.removeItem(AUTH_SESSION_KEY)
}

export const removeTokens = (): void => {
  if (typeof window === "undefined") return
  removeLegacyAuthKeys()
}

export const isAuthenticated = (): boolean => {
  return getAccessToken() !== null
}
