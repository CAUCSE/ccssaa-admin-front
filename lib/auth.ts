import type { AuthSession } from "@/types/auth"

const ACCESS_TOKEN_KEY = "accessToken"
const AUTH_SESSION_KEY = "authSession"
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

const removeLegacyAuthKeys = (): void => {
  localStorage.removeItem(ACCESS_TOKEN_KEY)
  localStorage.removeItem(AUTH_SESSION_KEY)
  LEGACY_SESSION_KEYS.forEach((key) => localStorage.removeItem(key))
  LEGACY_TOKEN_KEYS.forEach((key) => localStorage.removeItem(key))
}

const readLegacySession = (): AuthSession | null => {
  const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY)
  if (!accessToken) {
    return null
  }

  for (const key of LEGACY_SESSION_KEYS) {
    const raw = localStorage.getItem(key)
    if (!raw) {
      continue
    }

    try {
      const parsed = JSON.parse(raw) as unknown

      if (isAuthSession(parsed)) {
        return parsed
      }

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
      localStorage.removeItem(key)
    }
  }

  return null
}

export const getAccessToken = (): string | null => {
  if (typeof window === "undefined") return null
  return localStorage.getItem(ACCESS_TOKEN_KEY)
}

export const getAuthSession = (): AuthSession | null => {
  if (typeof window === "undefined") return null
  const raw = localStorage.getItem(AUTH_SESSION_KEY)
  if (!raw) {
    const legacySession = readLegacySession()
    if (legacySession) {
      setAuthSession(legacySession)
      return legacySession
    }

    removeLegacyAuthKeys()
    return null
  }

  try {
    const parsed = JSON.parse(raw) as unknown

    if (!isAuthSession(parsed)) {
      removeLegacyAuthKeys()
      return null
    }

    return parsed
  } catch {
    removeLegacyAuthKeys()
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
  removeLegacyAuthKeys()
}

export const isAuthenticated = (): boolean => {
  return getAccessToken() !== null
}
