// Mock 인증 API (v1 스펙 호환: sign-in, token/update, me, sign-out)

import type { MeResponse } from "@/types/auth"

export interface LoginParams {
  email: string
  password: string
}

export interface SignInResponse {
  accessToken: string
  refreshToken: string
}

export interface TokenUpdateResponse {
  accessToken: string
  refreshToken: string
}

const mockToken = () =>
  "mock-jwt-" + Math.random().toString(36).slice(2) + "-" + Date.now()

const MOCK_ME: MeResponse = {
  id: "mock-user-id",
  email: "admin@example.com",
  name: "관리자",
  studentId: "202099123",
  admissionYear: 2020,
  roles: ["COMMON"],
  profileImageUrl: null,
  state: "ACTIVE",
  circleIdIfLeader: null,
  circleNameIfLeader: null,
  nickname: "관리자",
  major: "소프트웨어학부",
  department: null,
  academicStatus: "UNDETERMINED",
  currentCompletedSemester: null,
  graduationYear: null,
  graduationType: null,
  phoneNumber: "010-0000-0000",
  rejectionOrDropReason: null,
  createdAt: "2025-03-04T19:01:49.829129",
  updatedAt: "2025-03-04T19:01:49.829129",
  isV2: true,
}

export const mockAuthApi = {
  signIn: async (params: LoginParams): Promise<SignInResponse> => {
    await new Promise((resolve) => setTimeout(resolve, 400))

    const { email, password } = params
    if (!email?.trim() || !password?.trim()) {
      throw new Error("이메일과 비밀번호를 입력해주세요.")
    }

    return {
      accessToken: mockToken(),
      refreshToken: mockToken(),
    }
  },

  tokenUpdate: async (refreshToken: string): Promise<TokenUpdateResponse> => {
    await new Promise((resolve) => setTimeout(resolve, 300))

    if (!refreshToken?.trim()) {
      throw new Error("refreshToken이 없습니다.")
    }

    return {
      accessToken: mockToken(),
      refreshToken: mockToken(),
    }
  },

  getMe: async (): Promise<MeResponse> => {
    await new Promise((resolve) => setTimeout(resolve, 300))
    return { ...MOCK_ME }
  },

  signOut: async (_params: {
    refreshToken: string
    accessToken: string
    fcmToken: string | null
  }): Promise<void> => {
    await new Promise((resolve) => setTimeout(resolve, 200))
  },
}
