/**
 * v2 API 공통 응답 언래핑
 * ApiResponse<T> → data 필드만 반환, 실패 시 throw
 */

import type { AxiosResponse } from "axios"
import type { ApiResponse as ApiResponseType } from "@/types/api-v2"
import { V2_SUCCESS_CODE } from "@/types/api-v2"

/**
 * v2 응답에서 data만 꺼냄. code가 있으면 성공 여부 검사, 아니면 throw.
 * @param res axios 응답 (response.data가 ApiResponse<T> 또는 NON_NULL로 일부만 옴)
 * @returns data (T)
 */
export function unwrapV2<T>(
  res: AxiosResponse<ApiResponseType<T> | T>
): T {
  const body = res.data as ApiResponseType<T>

  if (!body || typeof body !== "object") {
    return body as unknown as T
  }

  const wrapped = body as Record<string, unknown>
  if ("code" in wrapped && wrapped.code != null && wrapped.code !== V2_SUCCESS_CODE) {
    throw new Error(
      (wrapped.message as string) ?? `API Error (${wrapped.code})`
    )
  }

  if ("data" in wrapped) {
    return wrapped.data as T
  }

  return body as unknown as T
}
