import {
  getAccessToken,
  getRefreshToken,
  setTokens,
  removeTokens,
} from "@/lib/auth"
import { api } from "../api"
import { mockAuthApi } from "@/lib/mock/auth"
import { signInV1 } from "./v1/auth"
import type { MeResponse, SignInResponse } from "@/types/auth"

const USE_MOCK_API = process.env.NEXT_PUBLIC_USE_MOCK_API === "true"

export interface LoginParams {
  email: string
  password: string
}

export type { SignInResponse }

/** v1 토큰 재발급 응답: PUT /api/v1/users/token/update */
export interface TokenUpdateResponse {
  accessToken: string
  refreshToken: string
}

/** @deprecated use SignInResponse */
export type LoginResponse = SignInResponse

export type { MeResponse }

const realAuthApi = {
  /** v1 API: 실패 시 서버 v1 에러 응답(message) throw */
  signIn: (params: LoginParams): Promise<SignInResponse> =>
    signInV1(params),
  tokenUpdate: async (refreshToken: string): Promise<TokenUpdateResponse> => {
    const { data } = await api.put<TokenUpdateResponse>("/users/token/update", {
      refreshToken,
    })
    return data
  },
  getMe: async (): Promise<MeResponse> => {
    const { data } = await api.get<MeResponse>("/users/me")
    return data
  },
  signOut: async (params: {
    refreshToken: string
    accessToken: string
    fcmToken: string | null
  }): Promise<void> => {
    await api.post("/users/sign-out", params)
  },
}

const authApi = USE_MOCK_API ? mockAuthApi : realAuthApi

/** 로그인 (v1: POST /users/sign-in). 성공 시 accessToken/refreshToken 저장. */
export async function login(params: LoginParams): Promise<SignInResponse> {
  const res = await authApi.signIn(params)
  if (res.accessToken && res.refreshToken) {
    setTokens(res.accessToken, res.refreshToken)
  }
  return res
}

/** 토큰 재발급 (v1: PUT /users/token/update). 성공 시 새 토큰 저장 후 반환. */
export async function refreshTokens(): Promise<TokenUpdateResponse | null> {
  const refresh = getRefreshToken()
  if (!refresh) return null
  try {
    const res = await authApi.tokenUpdate(refresh)
    if (res.accessToken && res.refreshToken) {
      setTokens(res.accessToken, res.refreshToken)
      return res
    }
    return null
  } catch {
    return null
  }
}

/** 본인 조회 (v1: GET /users/me). Authorization: Bearer 필요. */
export async function getMe(): Promise<MeResponse> {
  return authApi.getMe()
}

/** 로그아웃 (v1: POST /users/sign-out). body에 refreshToken, accessToken, fcmToken(null) 전송 후 토큰 제거. */
export async function signOut(): Promise<void> {
  const accessToken = getAccessToken()
  const refreshToken = getRefreshToken()
  try {
    if (accessToken && refreshToken) {
      await authApi.signOut({
        refreshToken,
        accessToken,
        fcmToken: null,
      })
    }
  } finally {
    removeTokens()
  }
}
