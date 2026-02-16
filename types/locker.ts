/** 사물함 상태 (서버 enum) */
export type LockerStatus = "AVAILABLE" | "IN_USE" | "DISABLED"

// 화면에서 사용하는 사물함 사용 상태
// - EMPTY: 배정 없음
// - IN_USE: 사용중 (만료 전)
// - EXPIRED: 만료됨
export type LockerUsageStatus = "EMPTY" | "IN_USE" | "EXPIRED"

/** v2 API 위치 필터 (GET /api/v2/admin/lockers) */
export type LockerNameV2 = "SECOND" | "THIRD" | "FOURTH"

/** v2 사물함 목록 요청 쿼리 */
export interface LockerListRequestV2 {
  /** 사용자 검색 (이름, 이메일, 학번 등) */
  userKeyword?: string
  /** 위치 필터 */
  location?: LockerNameV2
  /** 활성 상태 필터 */
  isActive?: boolean
  /** 사용중 여부 필터 */
  isOccupied?: boolean
  /** 페이지 번호 (0부터 시작) */
  page: number
  /** 페이지 크기 */
  size: number
}

/** v2 목록 항목의 사용자 정보 (객체 형태일 때) */
export interface LockerUserV2 {
  id?: number
  name?: string
  studentNo?: string
}

/** v2 사물함 목록 항목 (GET /api/v2/admin/lockers 응답 content 항목) */
export interface LockerListItemV2 {
  /** 사물함 ID (UUID 문자열, 배정/연장/회수 API에 사용) */
  id?: number | string
  /** 층 설명 (예: "2층") */
  location: string
  /** 사물함 번호 */
  lockerNumber: number
  /** 사용 상태 */
  status: LockerStatus
  /** 배정된 사용자 — "이름(학번)" 문자열 또는 null (비어있을 때) */
  user: string | LockerUserV2 | null
  /** 만료일자 (ISO 또는 YYYY-MM-DD) */
  expireDate: string | null
}

/** v2 사물함 목록 응답 data 페이로드 */
export interface LockerListPayloadV2 {
  content: LockerListItemV2[]
  currentPage: number
  size: number
  totalPages: number
  totalElements: number
  hasNext: boolean
  hasPrev: boolean
}

export interface Locker {
  /** v2 목록에서 반환 (number | string). 배정/연장/회수 API에 사용 */
  id?: number | string
  number: number
  status: LockerStatus
  /** 위치(열/층 등 표시용) */
  location?: string
  currentUserId?: number
  currentUserName?: string
  currentUserStudentNo?: string
  currentUserPhone?: string
  assignedAt?: string
  /** 배정 만료일시 */
  expiredAt?: string | null
  previousUserId?: number
  previousUserName?: string
  previousUserStudentNo?: string
  releasedAt?: string
}

/** v2 사용 시 LockerListRequestV2 사용. 기존 mock/fallback용 */
export interface LockerListParams {
  page?: number
  size?: number
  number?: string
  /** 서버 상태 필터 (기존 API 호환용) */
  status?: LockerStatus | "ALL"
  userKeyword?: string
  /** 위치 필터 (v2: LockerNameV2) */
  location?: string
  /** 사용 상태 필터 (비어있음/사용중/만료) */
  usageStatus?: LockerUsageStatus | "ALL"
  /** 만료 임박 필터 (며칠 이내 만료) */
  expireWithinDays?: number
  /** v2: 위치 enum */
  locationV2?: LockerNameV2
  /** v2: 활성 상태 필터 */
  isActive?: boolean
  /** v2: 사용중 여부 필터 */
  isOccupied?: boolean
}

export interface LockerListResponse {
  content: Locker[]
  totalElements: number
  totalPages: number
  size: number
  number: number
}

/** v2 배정 요청 — POST /api/v2/admin/lockers/{id}/assign */
export interface AssignLockerRequest {
  /** 사용자 UUID */
  userId: string
  /** 만료일시 (ISO 8601) */
  expiredAt: string
}

// 연장 요청
export interface ExtendLockerRequest {
  /** 연장 후 만료일시 (ISO 문자열) */
  expiredAt: string
}

export interface LockerApplicationPeriod {
  startAt: string
  endAt: string
}

// 로그 액션 타입 (v1 호환)
export type LockerLogAction =
  | "ASSIGN"
  | "EXTEND"
  | "REVOKE"

/** v2 사물함 로그 요청 — GET /api/v2/admin/lockers/logs */
export interface LockerLogListRequestV2 {
  userKeyword?: string
  action?: string
  lockerLocationName?: LockerNameV2
  lockerNumber?: number
  page: number
  size: number
}

/** v2 사물함 로그 항목 */
export interface LockerLogItemV2 {
  id: string
  lockerNumber: number
  lockerLocationName: string
  userEmail: string
  userName: string
  action: string
  message: string
  createdAt: string
}

/** v2 사물함 로그 응답 data */
export interface LockerLogListPayloadV2 {
  content: LockerLogItemV2[]
  currentPage: number
  size: number
  totalPages: number
  totalElements: number
  hasNext: boolean
  hasPrev: boolean
}

export interface LockerLog {
  id: number
  createdAt: string
  action: LockerLogAction
  userName: string
  lockerNumber: number
  message: string
}

export interface LockerLogListParams {
  page?: number
  size?: number
  action?: string
  userKeyword?: string
  lockerLocationName?: LockerNameV2
  /** 사물함 번호 (쿼리/입력은 문자열로 올 수 있음) */
  lockerNumber?: number | string
}

export interface LockerLogListResponse {
  content: LockerLogItemV2[]
  totalElements: number
  totalPages: number
  size: number
  number: number
}

// ----- v2 사물함 정책 (GET /api/v2/admin/lockers/policy) -----

/** v2 사물함 정책 응답 (단일) */
export interface LockerPolicyV2 {
  expiredAt: string
  registerStartAt: string
  registerEndAt: string
  extendStartAt: string
  extendEndAt: string
  nextExpiredAt: string
  isLockerAccessEnabled: boolean
  isLockerExtendEnabled: boolean
}

/** PUT register-period 요청 (신청 기간 + 만료일) */
export interface LockerPolicyRegisterPeriodRequest {
  registerStartAt: string
  registerEndAt: string
  expiredAt: string
}

/** PUT extend-period 요청 */
export interface LockerPolicyExtendPeriodRequest {
  extendStartAt: string
  extendEndAt: string
  nextExpiredAt: string
}

/** PUT register-status 요청 (사물함 신청 가능 여부) */
export interface LockerPolicyStatusRequest {
  status: boolean
}
