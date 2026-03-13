import { apiV2 } from "./v2/client"
import type {
  ScheduleEvent,
  ScheduleListParams,
  ScheduleListResponse,
  CreateScheduleEventRequest,
  UpdateScheduleEventRequest,
} from "@/types/schedule"
import { mockScheduleApi } from "../mock/schedule"

// 환경 변수로 Mock 모드 제어
const USE_MOCK_API = process.env.NEXT_PUBLIC_USE_MOCK_API === "true"

// 실제 API 함수들
const realScheduleApi = {
  // 스케줄 일정 목록 조회
  getScheduleEvents: async (params: ScheduleListParams): Promise<ScheduleListResponse> => {
    // types 배열을 쉼표로 구분된 문자열로 변환
    const queryParams: Record<string, any> = {}
    if (params.from) queryParams.from = `${params.from}T00:00:00`
    if (params.to) queryParams.to = `${params.to}T23:59:59`
    if (params.types && params.types.length > 0) {
      queryParams.types = params.types.join(',')
    }

    const response = await apiV2.get<{ data: ScheduleListResponse }>("/admin/schedules", {
      params: queryParams 
    })
    return response.data.data
  },

  // 스케줄 일정 상세 조회
  getScheduleEventDetail: async (eventId: string): Promise<ScheduleEvent> => {
    const response = await apiV2.get<{ data: ScheduleEvent }>(`/admin/schedules/${eventId}`)
    return response.data.data
  },

  // 일정 생성
  createScheduleEvent: async (data: CreateScheduleEventRequest): Promise<ScheduleEvent> => {
    const response = await apiV2.post<{ data: ScheduleEvent }>("/admin/schedules", data)
    return response.data.data
  },

  // 일정 수정
  updateScheduleEvent: async (
    eventId: string,
    data: UpdateScheduleEventRequest
  ): Promise<ScheduleEvent> => {
    const response = await apiV2.put<{ data: ScheduleEvent }>(`/admin/schedules/${eventId}`, data)
    return response.data.data
  },

  // 일정 삭제
  deleteScheduleEvent: async (eventId: string): Promise<void> => {
    await apiV2.delete(`/admin/schedules/${eventId}`)
  },
}

const scheduleApiWithAliases = {
  ...realScheduleApi,
  getCalendarEvents: realScheduleApi.getScheduleEvents,
  getCalendarEventDetail: realScheduleApi.getScheduleEventDetail,
  createCalendarEvent: realScheduleApi.createScheduleEvent,
  updateCalendarEvent: realScheduleApi.updateScheduleEvent,
  deleteCalendarEvent: realScheduleApi.deleteScheduleEvent,
}

// Mock 모드에 따라 API 선택
export const scheduleApi = USE_MOCK_API ? mockScheduleApi : scheduleApiWithAliases
export const calendarApi = scheduleApi
