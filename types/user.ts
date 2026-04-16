// ============ Types ============

export type UserStatus = "AWAIT" | "ACTIVE" | "DROP" | "REJECT" | "GUEST"
export type UserRole =
  | "ADMIN"
  | "PRESIDENT"
  | "VICE_PRESIDENT"
  | "COUNCIL"
  | "LEADER_1"
  | "LEADER_2"
  | "LEADER_3"
  | "LEADER_4"
  | "LEADER_ALUMNI"
  | "ALUMNI_MANAGER"
  | "COMMON"
  | "NONE"
export type AcademicStatus = "ENROLLED" | "GRADUATED" | "UNDETERMINED"
export type Department = "DEPT_OF_AI" | "SCHOOL_OF_SW" | "SCHOOL_OF_CSE" | "DEPT_OF_CSE" | "DEPT_OF_CS"
export type UserListSortBy =
  | "CREATED_AT_DESC"
  | "CREATED_AT_ASC"
  | "NAME_ASC"
  | "NAME_DSC"
  | "STUDENT_ID_ASC"
export type DeletedUserListSortBy =
  | "DELETED_AT_DESC"
  | "DELETED_AT_ASC"
  | "NAME_ASC"

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
    className: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
  },
  GUEST: {
    label: "게스트",
    className: "bg-gray-200 text-white dark:bg-gray-700 dark:text-white",
  },
  REJECT: {
    label: "거부",
    className: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  },
} as const

export const USER_ROLE_CONFIG = {
  ADMIN: "관리자",
  PRESIDENT: "학생회장",
  VICE_PRESIDENT: "부학생회장",
  COUNCIL: "학생회",
  LEADER_1: "1학년 대표",
  LEADER_2: "2학년 대표",
  LEADER_3: "3학년 대표",
  LEADER_4: "4학년 대표",
  LEADER_ALUMNI: "동문회장",
  ALUMNI_MANAGER: "크자회 운영자",
  COMMON: "일반",
  NONE: "없음",
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
  return typeof value === "string" && ["AWAIT", "ACTIVE", "DROP", "REJECT", "GUEST"].includes(value)
}

export function isAcademicStatus(value: unknown): value is AcademicStatus {
  return typeof value === "string" && ["ENROLLED", "GRADUATED", "UNDETERMINED"].includes(value)
}

// ============ Interfaces ============

export interface UserSummary {
  id: string
  studentNo: string
  name: string
  email: string
  admissionYear: number
  department: Department
  status: UserStatus
  academicStatus: AcademicStatus
  createdAt: string
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

export interface UserRoleUpdateResult {
  id: string
  roles: UserRole[]
}

export interface UserRestoreResult {
  id: string
  state: UserStatus
  roles: UserRole[]
}

export interface UserDropResult {
  id: string
  state: UserStatus
  roles: UserRole[]
  dropReason: string
}

export interface UserListParams {
  page?: number
  size?: number
  keyword?: string
  states?: UserStatus[]
  department?: Department
  academicStatus?: AcademicStatus | "ALL"
  admissionYearFrom?: number
  admissionYearTo?: number
  sortBy?: UserListSortBy
}

export interface UserListResponse {
  content: UserSummary[]
  totalElements: number
  totalPages: number
  size: number
  currentPage: number
  hasNext: boolean
  hasPrev: boolean
}

export interface DeletedUserSummary {
  id: string
  name: string
  email: string
  studentNo: string
  admissionYear: number
  department: Department
  userState: UserStatus
  academicStatus: AcademicStatus
  deletedAt: string
  dropReason: string | null
}

export interface DeletedUserListParams {
  page?: number
  size?: number
  keyword?: string
  department?: Department
  academicStatus?: AcademicStatus | "ALL"
  admissionYearFrom?: number
  admissionYearTo?: number
  sortBy?: DeletedUserListSortBy
}

export interface DeletedUserListResponse {
  content: DeletedUserSummary[]
  totalElements: number
  totalPages: number
  size: number
  currentPage: number
  hasNext: boolean
  hasPrev: boolean
}

/** 관리자 유저 ID (UUID 문자열) */
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
