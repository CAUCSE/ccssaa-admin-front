import type {
  EventListParams,
} from "@/types/event"
import { mockEventApi } from "../mock/events"
import {
  approveEventV2,
  getEventDetailV2,
  getEventsV2,
  rejectEventV2,
} from "./v2/events"

// 환경 변수로 Mock 모드 제어
const USE_MOCK_API = process.env.NEXT_PUBLIC_USE_MOCK_API === "true"

// 실제 API 함수들
const realEventApi = {
  // 경조사 리스트 조회
  getEvents: (params: EventListParams) => getEventsV2(params),

  // 경조사 상세 조회
  getEventDetail: (eventId: string) => getEventDetailV2(eventId),

  // 경조사 승인
  approveEvent: (eventId: string) => approveEventV2(eventId),

  // 경조사 거절
  rejectEvent: (params: { eventId: string; rejectReason: string }) =>
    rejectEventV2(params),
}

// Mock 모드에 따라 API 선택
export const eventApi = USE_MOCK_API ? mockEventApi : realEventApi

