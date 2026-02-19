import type { UserStatus, AcademicStatus, Department } from "./user"

// ============ 인증 신청 목록 항목 ============

export interface AdmissionSummary {
  id: string
  userName: string
  userEmail: string
  requestedDepartment: Department
  requestedAdmissionYear: number
  requestedStudentId: string
  requestedAcademicStatus: AcademicStatus
  userState: UserStatus
  createdAt: string
}

// ============ 인증 신청 상세 ============

export interface AdmissionDetail extends AdmissionSummary {
  description: string
  attachImageUrls: string[]
  updatedAt: string
}

// ============ 목록 조회 파라미터 ============

export interface AdmissionListParams {
  keyword?: string
  userState?: UserStatus
  page?: number
  size?: number
  sort?: string
}

// ============ 거절 요청 ============

export interface RejectAdmissionRequest {
  rejectReason: string
}

// ============ 목록 조회 응답 (페이지네이션) ============

export interface AdmissionListResponse {
  content: AdmissionSummary[]
  totalElements: number
  totalPages: number
  size: number
  number: number
}
