import type { Department, AcademicStatus } from "./user"

// ============ Types ============

/** 학적 상태 변경 요청 처리 상태 */
export type AcademicRequestStatus = "ACCEPT" | "REJECT" | "AWAIT" | "CLOSE"

// ============ Configuration & Constants ============

export const ACADEMIC_REQUEST_STATUS_CONFIG = {
  ACCEPT: {
    label: "승인",
    variant: "success" as const,
  },
  REJECT: {
    label: "거절",
    variant: "danger" as const,
  },
  AWAIT: {
    label: "대기",
    variant: "warning" as const,
  },
  CLOSE: {
    label: "종료",
    variant: "neutral" as const,
  },
} as const

// ============ Interfaces ============

/** 학적 상태 변경 요청 목록 항목 */
export interface AcademicRecordApplication {
  applicationId: string
  userId: string
  userName: string
  studentId: string
  department: Department
  currentAcademicStatus: AcademicStatus
  targetAcademicStatus: AcademicStatus
  requestStatus: AcademicRequestStatus
  createdAt: string
}

/** 학적 상태 변경 요청 상세 */
export interface AcademicRecordApplicationDetail {
  applicationId: string
  userId: string
  userName: string
  studentId: string
  department: Department
  currentAcademicStatus: AcademicStatus
  targetAcademicStatus: AcademicStatus
  requestStatus: AcademicRequestStatus
  note: string
  rejectMessage: string
  attachImageUrls: string[]
  createdAt: string
  updatedAt: string
}

/** 목록 조회 API 응답 data 페이로드 (Spring Page) */
export interface AcademicRecordApplicationListPayload {
  totalElements: number
  totalPages: number
  size: number
  content: AcademicRecordApplication[]
  number: number
  sort: {
    empty: boolean
    unsorted: boolean
    sorted: boolean
  }
  pageable: {
    offset: number
    sort: {
      empty: boolean
      unsorted: boolean
      sorted: boolean
    }
    pageNumber: number
    pageSize: number
    paged: boolean
    unpaged: boolean
  }
  numberOfElements: number
  first: boolean
  last: boolean
  empty: boolean
}

/** 목록 조회 파라미터 */
export interface AcademicRecordListParams {
  page?: number
  size?: number
  requestStatus?: AcademicRequestStatus | "ALL"
  department?: Department | "ALL"
  /** 이름 또는 학번 검색 */
  keyword?: string
}
