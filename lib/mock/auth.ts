// Mock 인증 API

import type { AuthSession } from "@/types/auth"

export interface LoginParams {
  email: string
  password: string
}

const mockToken = () =>
  "mock-jwt-" + Math.random().toString(36).slice(2) + "-" + Date.now()

const MOCK_SESSION_BASE: Omit<AuthSession, "accessToken"> = {
  email: "admin@example.com",
  name: "관리자",
  profileImage: null,
  onboardingStatus: "COMPLETED",
  academicStatus: "UNDETERMINED",
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
      ...MOCK_SESSION_BASE,
      email,
    }
  },

  refresh: async (): Promise<AuthSession> => {
    await new Promise((resolve) => setTimeout(resolve, 300))

    return {
      accessToken: mockToken(),
      ...MOCK_SESSION_BASE,
    }
  },

  signOut: async (): Promise<void> => {
    await new Promise((resolve) => setTimeout(resolve, 200))
  },
}
