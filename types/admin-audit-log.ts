export type AdminAuditLogCategory = "USER" | "LOCKER" | "ACADEMIC"

export type AdminAuditLogActionType =
  | "DROP"
  | "RESTORE"
  | "ROLE_CHANGE"
  | "ASSIGN"
  | "EXTEND"
  | "RELEASE"
  | "ENABLE"
  | "DISABLE"
  | "RELEASE_EXPIRED"
  | "ADMISSION_ACCEPT"
  | "ADMISSION_REJECT"
  | "ACADEMIC_RECORD_ACCEPT"
  | "ACADEMIC_RECORD_REJECT"

export interface AdminAuditLogActor {
  userId: string
  email: string
  name: string | null
  studentId: string | null
}

export interface AdminAuditLogTarget {
  type: "USER" | "LOCKER" | string
  id: string
  email: string | null
  name: string | null
  studentId: string | null
}

export interface AdminAuditLogMetadata {
  beforeState?: string | null
  afterState?: string | null
  beforeRoles?: string[] | string | null
  afterRoles?: string[] | string | null
  reason?: string | null
  lockerId?: string | null
  lockerNumber?: number | string | null
  lockerLocationName?: string | null
  expireDate?: string | null
  expiredAt?: string | null
  releasedUserId?: string | null
  admissionId?: string | null
  requestedAcademicStatus?: string | null
  requestedStudentId?: string | null
  requestedAdmissionYear?: number | string | null
  requestedDepartment?: string | null
  requestedGraduationYear?: number | string | null
  rejectReason?: string | null
  applicationId?: string | null
  beforeAcademicStatus?: string | null
  targetAcademicStatus?: string | null
  note?: string | null
  [key: string]: string | number | boolean | string[] | null | undefined
}

export interface AdminAuditLog {
  id: string
  category: AdminAuditLogCategory
  actionType: AdminAuditLogActionType | string
  actionDescription: string
  actor: AdminAuditLogActor
  target: AdminAuditLogTarget
  summary: string
  metadata: AdminAuditLogMetadata
  createdAt: string | null
}

export interface AdminAuditLogListParams {
  from?: string
  to?: string
  category?: AdminAuditLogCategory
  actionType?: AdminAuditLogActionType | ""
  keyword?: string
  page?: number
  size?: number
}

export interface AdminAuditLogListPayload {
  content: AdminAuditLog[]
  currentPage: number
  size: number
  totalPages: number
  totalElements: number
  hasNext: boolean
  hasPrev: boolean
}
