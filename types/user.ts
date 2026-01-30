export type UserStatus = "PENDING" | "ACTIVE" | "BANNED"
export type UserRole = "USER" | "ADMIN" | "MASTER"

export interface UserSummary {
  id: number
  studentNo: string
  name: string
  department: string
  status: UserStatus
  joinedAt: string
}

export interface UserDetail {
  id: number
  studentNo: string
  name: string
  department: string
  phone: string
  email: string
  joinedAt: string
  status: UserStatus
  role: UserRole
}

export interface UserListParams {
  page?: number
  size?: number
  keyword?: string
  department?: string
  status?: UserStatus | "ALL"
}

export interface UserListResponse {
  content: UserSummary[]
  totalElements: number
  totalPages: number
  size: number
  number: number
}

/** GET /api/v2/admin/users 검색 파라미터 (query) */
export interface AdminUsersSearchParamsV2 {
  userState?: UserStatus
  userRole?: UserRole
  keyword?: string
}

/** GET /api/v2/admin/users 응답 항목 (관리자 지정 모달 검색용) */
export interface AdminUserItemV2 {
  id: string
  adminName: string
  adminEmail?: string
}

/** GET /api/v2/admin/users 응답 data 페이로드 */
export interface AdminUsersListPayloadV2 {
  users: AdminUserItemV2[]
}

