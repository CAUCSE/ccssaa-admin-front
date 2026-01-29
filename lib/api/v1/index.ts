/**
 * v1 API 진입점
 * v1 전용 요청/응답·에러 양식 적용 (v2 API는 lib/api/v2/ 에 별도 구현 예정)
 */

export { signInV1 } from "./auth"
export { parseV1Error } from "./error"
export type { V1ApiErrorResponse } from "@/types/v1"
