export type ReportStatus = "UNRESOLVED" | "RESOLVED"
export type ReportTargetType = "POST" | "COMMENT" | "USER"
export type ReportAction = "REJECT" | "APPROVE"

export interface Report {
  id: number
  targetType: ReportTargetType
  targetId: number
  targetTitle?: string
  targetContent?: string
  targetAuthor?: string
  targetDeleted?: boolean // 삭제된 글인지 여부
  reason: string
  reporter: string
  reporterId?: number
  createdAt: string
  status: ReportStatus
  resolvedAt?: string
  resolvedBy?: string
  action?: ReportAction // 처리 액션 (반려/승인)
}

export interface ReportListParams {
  page?: number
  size?: number
  targetType?: ReportTargetType | "ALL"
  status?: ReportStatus | "ALL"
}

export interface ReportListResponse {
  content: Report[]
  totalElements: number
  totalPages: number
  size: number
  number: number
}

export interface ReportActionParams {
  reportId: number
  action: ReportAction
  targetId?: number // 제재 대상 ID (유저 ID 등)
}

