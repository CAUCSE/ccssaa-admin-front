import { api } from "../api"
import type {
  Event,
  EventListParams,
  EventListResponse,
  ApproveEventRequest,
} from "@/types/event"
import { mockEventApi } from "../mock/events"
import { withMock } from "@/lib/mock"

// 실제 API 함수들
const realEventApi = {
  // 경조사 리스트 조회
  getEvents: async (params: EventListParams): Promise<EventListResponse> => {
    const response = await api.get<EventListResponse>("/admin/events", { params })
    return response.data
  },

  // 경조사 상세 조회
  getEventDetail: async (eventId: number): Promise<Event> => {
    const response = await api.get<Event>(`/admin/events/${eventId}`)
    return response.data
  },

  // 경조사 승인/거부
  approveEvent: async (eventId: number, data: ApproveEventRequest): Promise<void> => {
    await api.patch(`/admin/events/${eventId}/approve`, data)
  },
}

// Mock 모드에 따라 API 선택
export const eventApi = withMock(realEventApi, mockEventApi)

