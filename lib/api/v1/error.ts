/**
 * v1 API 에러 응답 파싱 (로그인 등 v1 전용)
 */

import type { AxiosError } from "axios"
import type { V1ApiErrorResponse } from "@/types/v1"

function isV1ApiErrorResponse(
  data: unknown
): data is V1ApiErrorResponse {
  return (
    typeof data === "object" &&
    data !== null &&
    "errorCode" in data &&
    "message" in data &&
    typeof (data as V1ApiErrorResponse).message === "string"
  )
}

/** v1 에러 응답이면 message 반환, 아니면 null */
export function parseV1Error(error: unknown): string | null {
  const axiosError = error as AxiosError<unknown>
  const data = axiosError.response?.data
  if (isV1ApiErrorResponse(data)) {
    return data.message
  }
  return null
}
