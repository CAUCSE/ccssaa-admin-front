/**
 * v1 API 전용 타입 (v2 API는 별도 요청/응답 양식 사용 예정)
 */

/** v1 API 에러 응답 (예: 로그인 실패 시) */
export interface V1ApiErrorResponse {
  errorCode: number
  message: string
  timeStamp: string
}
