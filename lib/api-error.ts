/**
 * API 에러에서 응답 message 추출
 * 서버 응답 형태와 무관하게 message를 우선 추출한다.
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

function hasCode(data: unknown): data is { code: string } {
  return typeof data === "object" && data !== null && "code" in data && typeof (data as { code: unknown }).code === "string"
}

/** API 에러 객체에서 표시할 메시지 문자열 반환 */
export function getApiErrorMessage(error: unknown): string {
  const axiosError = error as AxiosError<unknown>
  const data = axiosError.response?.data
  if (hasCode(data) && data.code === "EMAIL_CAMPAIGN_400_006") {
    return "등록된 활성 회원이 아닌 이메일이 포함되어 있습니다. 이메일 목록 전체를 확인해 주세요."
  }
  if (hasMessage(data)) return data.message

  if (error instanceof Error && error.message) return error.message

  return "요청을 처리하지 못했습니다."
}

export function getApiErrorStatus(error: unknown): number | undefined {
  return (error as AxiosError<unknown>).response?.status
}
