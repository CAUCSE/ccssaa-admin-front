/**
 * API 에러에서 응답 message 추출
 * v2: { code, message }, v1: { errorCode, message }, Axios response.data
 */

import type { AxiosError } from "axios"

function hasMessage(data: unknown): data is { message: string } {
  return (
    typeof data === "object" &&
    data !== null &&
    "message" in data &&
    typeof (data as { message: unknown }).message === "string"
  )
}

/** API 에러 객체에서 표시할 메시지 문자열 반환 */
export function getApiErrorMessage(error: unknown): string {
  const axiosError = error as AxiosError<unknown>
  const data = axiosError.response?.data
  if (hasMessage(data)) return data.message

  if (axiosError.code === "ERR_NETWORK") {
    return "네트워크 오류가 발생했습니다. 프록시 또는 서버 연결 상태를 확인해주세요."
  }

  if (error instanceof Error && error.message) return error.message

  return "요청을 처리하지 못했습니다."
}
