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

