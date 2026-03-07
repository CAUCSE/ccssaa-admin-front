/** 사물함 정책 상태 */
export type LockerPolicyStatus = "ACTIVE" | "INACTIVE"

/** 사물함 정책 (목록/상세) */
export interface LockerPolicy {
  id: number
  version: string
  applyStartAt: string
  applyEndAt: string
  applyExpiredAt: string
  extendStartAt: string | null
  extendEndAt: string | null
  extendExpiredAt: string | null
  status: LockerPolicyStatus
  createdAt: string
}

/** 정책 생성/수정 요청 공통 필드 */
export interface LockerPolicyFormData {
  version: string
  applyStartAt: string
  applyEndAt: string
  applyExpiredAt: string
  extendStartAt: string | null
  extendEndAt: string | null
  extendExpiredAt: string | null
}

/** 정책 목록 응답 */
export interface LockerPolicyListResponse {
  content: LockerPolicy[]
  totalElements: number
  totalPages: number
  size: number
  number: number
}
