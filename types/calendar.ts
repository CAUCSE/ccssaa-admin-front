export type CalendarType = 
  | "ACADEMIC" 
  | "DEPARTMENT" 
  | "CCSSAA" 
  | "COMPETITION"
  | "STUDENT_COUNCIL" 
  | "HOLIDAY"

export interface CalendarEvent {
  id: string
  title: string
  type: CalendarType
  start: string
  end: string
  targetPostId?: string
}

export interface CalendarListParams {
  types?: CalendarType[]
  from?: string
  to?: string
}

export interface CalendarListResponse {
  count: number
  data: CalendarEvent[]
}

export interface CreateCalendarEventRequest {
  title: string
  type: CalendarType
  start: string
  end: string
  targetPostId?: string
}

export interface UpdateCalendarEventRequest {
  title: string
  type: CalendarType
  start: string
  end: string
  targetPostId?: string
}
