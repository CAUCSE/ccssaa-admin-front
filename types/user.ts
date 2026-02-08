// ============ Types ============

export type UserStatus = "AWAIT" | "ACTIVE" | "DROP" | "INACTIVE" | "REJECT"
export type UserRole = "USER" | "ADMIN" | "MASTER"
export type AcademicStatus = "ENROLLED" | "GRADUATED" | "UNDETERMINED"
export type Department = "DEPT_OF_AI" | "SCHOOL_OF_SW" | "SCHOOL_OF_CSE" | "DEPT_OF_CSE" | "DEPT_OF_CS"

// ============ Configuration & Constants ============

export const DEPARTMENTS = {
  DEPT_OF_AI: "AI학과",
  SCHOOL_OF_SW: "소프트웨어학부",
  SCHOOL_OF_CSE: "컴퓨터공학부",
  DEPT_OF_CSE: "컴퓨터공학과",
  DEPT_OF_CS: "전자계산학과",
} as const

export const USER_STATUS_CONFIG = {
  AWAIT: {
    label: "대기",
    className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  },
  ACTIVE: {
    label: "활성",
    className: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  },
  DROP: {
    label: "추방",
    className: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  },
  INACTIVE: {
    label: "탈퇴",
    className: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
  },
  REJECT: {
    label: "거부",
    className: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  },
} as const

export const USER_ROLE_CONFIG = {
  USER: "일반 회원",
  ADMIN: "관리자",
  MASTER: "마스터",
} as const

export const ACADEMIC_STATUS_CONFIG = {
  ENROLLED: "재적",
  GRADUATED: "졸업",
  UNDETERMINED: "미정",
} as const

export const DEPARTMENT_CONFIG = {
  DEPT_OF_AI: "AI학과",
  SCHOOL_OF_SW: "소프트웨어학부",
  SCHOOL_OF_CSE: "컴퓨터공학부",
  DEPT_OF_CSE: "컴퓨터공학과",
  DEPT_OF_CS: "전자계산학과",
} as const

// ============ Type Guards ============

export function isUserStatus(value: unknown): value is UserStatus {
  return typeof value === "string" && ["AWAIT", "ACTIVE", "DROP", "INACTIVE", "REJECT"].includes(value)
}

export function isAcademicStatus(value: unknown): value is AcademicStatus {
  return typeof value === "string" && ["ENROLLED", "GRADUATED", "UNDETERMINED"].includes(value)
}

// ============ Interfaces ============

export interface UserSummary {
  id: string
  studentNo: string
  name: string
  department: Department
  status: UserStatus
  academicStatus: AcademicStatus
  joinedAt: string
}

export interface UserDetail {
  id: string
  email: string
  name: string
  studentId: string
  roles: string[]
  profileImageUrl: string | null
  state: UserStatus
  nickname: string
  major: string
  department: Department
  academicStatus: AcademicStatus
  phoneNumber: string
  rejectionOrDropReason: string | null
  createdAt: string
}

export interface UserListParams {
  page?: number
  size?: number
  keyword?: string
  department?: Department
  status?: UserStatus | "ALL"
  academicStatus?: AcademicStatus | "ALL"
}

export interface UserListResponse {
  content: UserSummary[]
  totalElements: number
  totalPages: number
  size: number
  number: number
}

/** v2 API 관리자 유저 ID (UUID 문자열). v1 UserSummary/UserDetail의 id(number)와 구분. */
export type UserIdV2 = string

/** GET /api/v2/admin/users/search 검색 파라미터 (query) */
export interface AdminUsersSearchParamsV2 {
  userState?: UserStatus
  userRole?: UserRole
  keyword?: string
}

/** GET /api/v2/admin/users/search 응답 항목 (관리자 지정 모달 검색용) */
export interface AdminUserItemV2 {
  id: UserIdV2
  adminName: string
  adminEmail?: string
}

/** GET /api/v2/admin/users/search 응답 data 페이로드 */
export interface AdminUsersListPayloadV2 {
  users: AdminUserItemV2[]
}
