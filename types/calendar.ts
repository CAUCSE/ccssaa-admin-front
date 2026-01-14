export type CalendarScope = "ALL" | "STUDENT" | "ALUMNI"
export type CalendarActionType = "Notice" | "Service" | "Link"

export interface CalendarEvent {
  id: number
  title: string
  description?: string
  date: string
  scope: CalendarScope
  actionType: CalendarActionType
  serviceLink?: string
  externalLink?: string
  notificationEnabled: boolean
  createdAt: string
  updatedAt: string
}

export interface CalendarListParams {
  page?: number
  size?: number
  startDate?: string
  endDate?: string
  scope?: CalendarScope | "ALL"
  actionType?: CalendarActionType | "ALL"
  keyword?: string
}

export interface CalendarListResponse {
  content: CalendarEvent[]
  totalElements: number
  totalPages: number
  size: number
  number: number
}

export interface CreateCalendarEventRequest {
  title: string
  description?: string
  date: string
  scope: CalendarScope
  actionType: CalendarActionType
  serviceLink?: string
  externalLink?: string
  notificationEnabled: boolean
}

export interface UpdateCalendarEventRequest extends CreateCalendarEventRequest {}
