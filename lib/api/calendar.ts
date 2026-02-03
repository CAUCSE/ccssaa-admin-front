import { apiV2 } from "../api"
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
    const response = await apiV2.get<{ data: CalendarListResponse }>("/schedules", { params })
    return response.data.data
  },

  // 캘린더 일정 상세 조회
  getCalendarEventDetail: async (eventId: string): Promise<CalendarEvent> => {
    const response = await apiV2.get<{ data: CalendarEvent }>(`/schedules/${eventId}`)
    return response.data.data
  },

  // 일정 생성
  createCalendarEvent: async (data: CreateCalendarEventRequest): Promise<CalendarEvent> => {
    const response = await apiV2.post<{ data: CalendarEvent }>("/admin/schedules", data)
    return response.data.data
  },

  // 일정 수정
  updateCalendarEvent: async (
    eventId: string,
    data: UpdateCalendarEventRequest
  ): Promise<CalendarEvent> => {
    const response = await apiV2.put<{ data: CalendarEvent }>(`/admin/schedules/${eventId}`, data)
    return response.data.data
  },

  // 일정 삭제
  deleteCalendarEvent: async (eventId: string): Promise<void> => {
    await apiV2.delete(`/admin/schedules/${eventId}`)
  },
}

// Mock 모드에 따라 API 선택
export const calendarApi = USE_MOCK_API ? mockCalendarApi : realCalendarApi
