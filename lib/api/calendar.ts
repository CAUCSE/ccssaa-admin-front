import { api } from "../api"
import type {
  CalendarEvent,
  CalendarListParams,
  CalendarListResponse,
  CreateCalendarEventRequest,
  UpdateCalendarEventRequest,
} from "@/types/calendar"
import { mockCalendarApi } from "../mock/calendar"

// 환경 변수로 Mock 모드 제어
const USE_MOCK_API = process.env.NEXT_PUBLIC_USE_MOCK_API === "true"

// 실제 API 함수들
const realCalendarApi = {
  // 캘린더 일정 목록 조회
  getCalendarEvents: async (params: CalendarListParams): Promise<CalendarListResponse> => {
    const response = await api.get<CalendarListResponse>("/admin/calendar", { params })
    return response.data
  },

  // 캘린더 일정 상세 조회
  getCalendarEventDetail: async (eventId: number): Promise<CalendarEvent> => {
    const response = await api.get<CalendarEvent>(`/admin/calendar/${eventId}`)
    return response.data
  },

  // 일정 생성
  createCalendarEvent: async (data: CreateCalendarEventRequest): Promise<CalendarEvent> => {
    const response = await api.post<CalendarEvent>("/admin/calendar", data)
    return response.data
  },

  // 일정 수정
  updateCalendarEvent: async (
    eventId: number,
    data: UpdateCalendarEventRequest
  ): Promise<CalendarEvent> => {
    const response = await api.patch<CalendarEvent>(`/admin/calendar/${eventId}`, data)
    return response.data
  },

  // 일정 삭제
  deleteCalendarEvent: async (eventId: number): Promise<void> => {
    await api.delete(`/admin/calendar/${eventId}`)
  },

  // 사물함 기간 캘린더 동기화
  syncLockerPeriodToCalendar: async (startAt: string, endAt: string): Promise<CalendarEvent> => {
    const response = await api.post<CalendarEvent>("/admin/calendar/sync-locker-period", {
      startAt,
      endAt,
    })
    return response.data
  },
}

// Mock 모드에 따라 API 선택
export const calendarApi = USE_MOCK_API ? mockCalendarApi : realCalendarApi
