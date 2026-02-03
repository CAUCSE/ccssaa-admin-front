export type CalendarType = 
  | "ACADEMIC" 
  | "DEPARTMENT" 
  | "CCSSAA" 
  | "STUDENT_COUNCIL" 
  | "COMPETITION" 
  | "HOLIDAY"

export interface CalendarEvent {
  id: string
  title: string
  type: CalendarType
  start: string
  end: string
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
}

export interface UpdateCalendarEventRequest {
  title: string
  type: CalendarType
  start: string
  end: string
}
