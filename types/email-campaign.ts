export type EmailCampaignStatus =
  | "DRAFT"
  | "QUEUED"
  | "SENDING"
  | "COMPLETED"
  | "PARTIALLY_FAILED"
  | "FAILED"

export type EmailCampaignRecipientStatus = "PENDING" | "SENDING" | "SENT" | "FAILED" | "SKIPPED"
export type EmailCampaignDepartment = "DEPT_OF_AI" | "SCHOOL_OF_SW" | "SCHOOL_OF_CSE" | "DEPT_OF_CSE" | "DEPT_OF_CS"
export type EmailCampaignAcademicStatus = "ENROLLED" | "GRADUATED" | "UNDETERMINED" | "LEAVE_OF_ABSENCE" | "DROPPED_OUT" | "SUSPEND" | "EXPEL" | "PROFESSOR"

export interface EmailCampaignFilter {
  admissionYears?: number[] | null
  departments?: EmailCampaignDepartment[] | null
  academicStatuses?: EmailCampaignAcademicStatus[] | null
}

export interface EmailCampaignTargetPreview {
  recipientCount: number
  admissionYearDistribution: Record<string, number>
  departmentDistribution: Record<string, number>
  academicStatusDistribution: Record<string, number>
}

export interface EmailCampaign {
  id: string
  subject: string
  sanitizedHtml: string | null
  filterJson: string | null
  status: EmailCampaignStatus
  recipientCount: number
  pendingCount: number
  sentCount: number
  failedCount: number
  skippedCount: number
  createdAt: string
  completedAt: string | null
}

export interface EmailCampaignRecipient {
  id: number
  maskedEmail: string
  status: EmailCampaignRecipientStatus
  attemptCount: number
  lastAttemptAt: string | null
  sentAt: string | null
  lastErrorCode: string | null
}

export interface PageResponse<T> {
  content: T[]
  currentPage: number
  size: number
  totalPages: number
  totalElements: number
  hasNext: boolean
  hasPrev: boolean
}

export interface EmailCampaignListParams {
  status?: EmailCampaignStatus
  from?: string
  to?: string
  page?: number
  size?: number
}

export interface EmailCampaignRecipientListParams {
  status?: EmailCampaignRecipientStatus
  page?: number
  size?: number
}

export interface CreateEmailCampaignRequest {
  subject: string
  html: string
  filter: EmailCampaignFilter
  recipientEmails?: string[] | null
}

export type UpdateEmailCampaignRequest = CreateEmailCampaignRequest

export interface EmailCampaignTargetRequest {
  filter: EmailCampaignFilter
  recipientEmails?: string[] | null
}

export interface SendEmailCampaignRequest {
  confirmedSubject: string
  confirmedRecipientCount: number
}
