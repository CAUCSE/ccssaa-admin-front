/**
 * v2 API 공통 응답 타입
 * 백엔드 ApiResponse<T> @JsonInclude(NON_NULL) 에 맞춤 — 필드 생략 가능
 */
export interface ApiResponse<T> {
  /** 응답 코드 (예: S000) */
  code?: string
  /** 응답 메시지 (예: 요청 처리 성공) */
  message?: string
  /** 실제 응답 데이터(페이로드) */
  data?: T
}

/** 성공 시 사용하는 응답 코드 */
export const V2_SUCCESS_CODE = "S000"
