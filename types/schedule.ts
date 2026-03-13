export type ScheduleType = 
  | "ACADEMIC" 
  | "DEPARTMENT" 
  | "CCSSAA" 
  | "STUDENT_COUNCIL" 
  | "HOLIDAY"

export interface ScheduleEvent {
  id: string
  title: string
  type: ScheduleType
  start: string
  end: string
  postId?: string
}

export interface ScheduleListParams {
  types?: ScheduleType[]
  from?: string
  to?: string
}

export interface ScheduleListResponse {
  count: number
  data: ScheduleEvent[]
}

export interface CreateScheduleEventRequest {
  title: string
  type: ScheduleType
  start: string
  end: string
  postId?: string
}

export interface UpdateScheduleEventRequest {
  title: string
  type: ScheduleType
  start: string
  end: string
  postId?: string
}

export type CalendarType = ScheduleType
export type CalendarEvent = ScheduleEvent
export type CalendarListParams = ScheduleListParams
export type CalendarListResponse = ScheduleListResponse
export type CreateCalendarEventRequest = CreateScheduleEventRequest
export type UpdateCalendarEventRequest = UpdateScheduleEventRequest
