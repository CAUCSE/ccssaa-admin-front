export type EventStatus = "PENDING" | "APPROVED" | "REJECTED"
export type EventType = "MARRIAGE" | "FUNERAL" | "BIRTH" | "OTHER"

export interface Event {
  id: number
  applicantId: number
  applicantName: string
  applicantStudentNo: string
  type: EventType
  eventDate: string
  description?: string
  accountNumber?: string
  accountBank?: string
  accountHolder?: string
  evidenceFiles?: string[]
  status: EventStatus
  rejectionReason?: string
  createdAt: string
  updatedAt: string
}

export interface EventListParams {
  page?: number
  size?: number
  startDate?: string
  endDate?: string
  status?: EventStatus
}

export interface EventListResponse {
  content: Event[]
  totalElements: number
  totalPages: number
  size: number
  number: number
}

export interface ApproveEventRequest {
  approved: boolean
  rejectionReason?: string
}

