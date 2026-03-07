/**
 * v1 API - 로그인(sign-in) 전용
 * v1 에러 응답 형식(errorCode, message, timeStamp) 적용.
 * v2 API 연결 시 별도 요청/응답 양식으로 lib/api/v2/ 에 구현 예정.
 */

import { api } from "@/lib/api"
import { parseV1Error } from "./error"
import type { SignInResponse } from "@/types/auth"

export interface V1LoginParams {
  email: string
  password: string
}

/** v1 sign-in: 실패 시 서버의 v1 에러 응답 message를 담은 Error throw */
export async function signInV1(
  params: V1LoginParams
): Promise<SignInResponse> {
  try {
    const { data } = await api.post<SignInResponse>("/users/sign-in", params)
    return data
  } catch (error) {
    const v1Message = parseV1Error(error)
    if (v1Message) {
      throw new Error(v1Message)
    }
    throw error
  }
}
