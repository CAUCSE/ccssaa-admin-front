// Mock 인증 API

import type { AuthSession } from "@/types/auth"

export interface LoginParams {
  email: string
  password: string
}

const mockToken = () => {
  const payload = btoa(
    JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 60 * 60 })
  )
  return `mock.${payload}.signature`
}

const MOCK_SESSION_BASE: Omit<AuthSession, "accessToken" | "refreshToken"> = {
  email: "admin@example.com",
  name: "관리자",
  profileImage: null,
  onboardingStatus: "COMPLETED",
  academicStatus: "UNDETERMINED",
  roles: ["SYSTEM_ADMIN"],
}

export const mockAuthApi = {
  signIn: async (params: LoginParams): Promise<AuthSession> => {
    await new Promise((resolve) => setTimeout(resolve, 400))

    const { email, password } = params
    if (!email?.trim() || !password?.trim()) {
      throw new Error("이메일과 비밀번호를 입력해주세요.")
    }

    return {
      accessToken: mockToken(),
      refreshToken: mockToken(),
      ...MOCK_SESSION_BASE,
      email,
    }
  },

  refresh: async (): Promise<AuthSession> => {
    await new Promise((resolve) => setTimeout(resolve, 300))

    return {
      accessToken: mockToken(),
      refreshToken: mockToken(),
      ...MOCK_SESSION_BASE,
    }
  },

  signOut: async (): Promise<void> => {
    await new Promise((resolve) => setTimeout(resolve, 200))
  },
}
