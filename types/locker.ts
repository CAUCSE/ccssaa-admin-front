export type LockerStatus = "AVAILABLE" | "OCCUPIED"

export interface Locker {
  id: number
  number: number
  status: LockerStatus
  currentUserId?: number
  currentUserName?: string
  currentUserStudentNo?: string
  currentUserPhone?: string
  assignedAt?: string
  previousUserId?: number
  previousUserName?: string
  previousUserStudentNo?: string
  releasedAt?: string
}

export interface LockerListParams {
  page?: number
  size?: number
  number?: string
  status?: LockerStatus | "ALL"
  userKeyword?: string
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

export interface LockerApplicationPeriod {
  startAt: string
  endAt: string
}
