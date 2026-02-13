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

/** v2 목록 항목의 사용자 정보 */
export interface LockerUserV2 {
  id?: number
  name?: string
  studentNo?: string
}

/** v2 사물함 목록 항목 (GET /api/v2/admin/lockers 응답 content 항목) */
export interface LockerListItemV2 {
  /** 층 설명 (예: "3층") */
  location: string
  /** 사물함 번호 */
  lockerNumber: number
  /** 사용 상태 */
  status: LockerStatus
  /** 배정된 사용자 (없으면 null) */
  user: LockerUserV2 | null
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
  /** v2 목록에서는 없을 수 있음 (row key는 id ?? `${location}-${number}` 사용) */
  id?: number
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

export interface AssignLockerRequest {
  userId: number
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

// 로그 액션 타입
export type LockerLogAction =
  | "ASSIGN"
  | "EXTEND"
  | "REVOKE"

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
  action?: LockerLogAction | "ALL"
  userName?: string
  lockerNumber?: string
  from?: string
  to?: string
}

export interface LockerLogListResponse {
  content: LockerLog[]
  totalElements: number
  totalPages: number
  size: number
  number: number
}
