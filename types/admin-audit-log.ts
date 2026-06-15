export type AdminAuditLogCategory = "USER"

export type AdminAuditLogActionType = "DROP" | "RESTORE" | "ROLE_CHANGE"

export interface AdminAuditLogActor {
  userId: string
  email: string
}

export interface AdminAuditLogTarget {
  type: "USER" | string
  id: string
  email: string
}

export interface AdminAuditLogMetadata {
  beforeState?: string | null
  afterState?: string | null
  beforeRoles?: string | null
  afterRoles?: string | null
  reason?: string | null
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

