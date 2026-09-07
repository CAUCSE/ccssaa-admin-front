import axios from "axios"
import {
  getAccessToken,
  getRefreshToken,
  assertAdminSession,
  setAuthSession,
  removeTokens,
} from "@/lib/auth"
import { mockAuthApi } from "@/lib/mock/auth"
import { unwrapV2 } from "./v2/response"
import type { ApiResponse } from "@/types/api-v2"
import type { AuthSession } from "@/types/auth"

const USE_MOCK_API = process.env.NEXT_PUBLIC_USE_MOCK_API === "true"
const backendOrigin = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080"
const apiOrigin = typeof window === "undefined" ? backendOrigin : ""

const authClient = axios.create({
  baseURL: apiOrigin + "/api/v2",
  withCredentials: true,
})

export interface LoginParams {
  email: string
  password: string
}

export type LoginResponse = AuthSession
export type RefreshResponse = AuthSession

const realAuthApi = {
  signIn: async (params: LoginParams): Promise<AuthSession> => {
    const response = await authClient.post<ApiResponse<AuthSession>>(
      "/auth/login",
      params
    )
    return unwrapV2(response)
  },
  refresh: async (): Promise<AuthSession> => {
    const refreshToken = getRefreshToken()
    if (!refreshToken) {
      throw new Error("refreshToken이 없습니다.")
    }

    const response = await authClient.post<ApiResponse<AuthSession>>(
      "/auth/refresh",
      undefined,
      {
        headers: {
          Authorization: "Bearer t",
          "Refresh-Authorization": `Bearer ${refreshToken}`,
        },
      }
    )

    return unwrapV2(response)
  },
  signOut: async (): Promise<void> => {
    const accessToken = getAccessToken()
    const refreshToken = getRefreshToken()
    if (!accessToken && !refreshToken) return

    await authClient.post("/auth/logout", undefined, {
      headers: {
        ...(accessToken
          ? { Authorization: `Bearer ${accessToken}` }
          : {}),
        ...(refreshToken
          ? { "Refresh-Authorization": `Bearer ${refreshToken}` }
          : {}),
      },
    })
  },
}

const authApi = USE_MOCK_API ? mockAuthApi : realAuthApi

export async function login(
  params: LoginParams,
  rememberMe: boolean
): Promise<AuthSession> {
  const res = await authApi.signIn(params)
  const adminSession = assertAdminSession(res)
  setAuthSession(adminSession, rememberMe)
  return adminSession
}

export async function refreshTokens(): Promise<AuthSession | null> {
  try {
    const res = await authApi.refresh()
    const adminSession = assertAdminSession(res)
    setAuthSession(adminSession)
    return adminSession
  } catch {
    return null
  }
}

export async function signOut(): Promise<void> {
  try {
    await authApi.signOut()
  } finally {
    removeTokens()
  }
}
