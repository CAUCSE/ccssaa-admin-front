import { apiV2 } from "./v2/client"
import { unwrapV2 } from "./v2/response"
import type { ApiResponse } from "@/types/api-v2"
import type {
  CeremonyDetail,
  EventListParams,
  EventListResponse,
} from "@/types/event"
import { mockEventApi } from "../mock/events"

// 환경 변수로 Mock 모드 제어
const USE_MOCK_API = process.env.NEXT_PUBLIC_USE_MOCK_API === "true"

// 실제 API 함수들
const realEventApi = {
  // 경조사 리스트 조회
  getEvents: async (params: EventListParams): Promise<EventListResponse> => {
    const query: Record<string, string | number | undefined> = {}
    if (params.page != null) query.page = params.page
    if (params.size != null) query.size = params.size
    if (params.fromDate) query.fromDate = params.fromDate
    if (params.toDate) query.toDate = params.toDate
    if (params.state) query.state = params.state

    const response = await apiV2.get<ApiResponse<EventListResponse>>(
      "/admin/ceremonies",
      {
        params: query,
      }
    )
    return unwrapV2(response)
  },

  // 경조사 상세 조회
  getEventDetail: async (eventId: string): Promise<CeremonyDetail> => {
    const response = await apiV2.get<ApiResponse<CeremonyDetail>>(
      `/admin/ceremonies/${encodeURIComponent(eventId)}`
    )
    return unwrapV2(response)
  },

  // 경조사 승인
  approveEvent: async (eventId: string): Promise<void> => {
    await apiV2.post(`/admin/ceremonies/${encodeURIComponent(eventId)}/approve`)
  },

  // 경조사 거절
  rejectEvent: async ({
    eventId,
    rejectReason,
  }: {
    eventId: string
    rejectReason: string
  }): Promise<void> => {
    await apiV2.post(`/admin/ceremonies/${encodeURIComponent(eventId)}/reject`, {
      rejectReason,
    })
  },
}

// Mock 모드에 따라 API 선택
export const eventApi = USE_MOCK_API ? mockEventApi : realEventApi

