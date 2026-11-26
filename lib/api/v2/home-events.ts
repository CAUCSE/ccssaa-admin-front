/**
 * v2 홈 화면 이벤트 API
 * GET    /api/v2/admin/events             (전체 조회, 비활성 포함, displayOrder 오름차순)
 * POST   /api/v2/admin/events             (등록, 노출 순서는 마지막으로 자동 지정)
 * PUT    /api/v2/admin/events/{eventId}   (제목·링크·노출 여부 수정)
 * PATCH  /api/v2/admin/events/orders      (노출 순서 변경, body: { eventIds })
 * DELETE /api/v2/admin/events/{eventId}   (삭제)
 */

import { apiV2 } from "./client"
import { unwrapV2 } from "./response"
import { mockHomeEventApi } from "@/lib/mock/home-events"
import type { ApiResponse } from "@/types/api-v2"
import type { HomeEvent, HomeEventRequest } from "@/types/home-event"

const USE_MOCK_API = process.env.NEXT_PUBLIC_USE_MOCK_API === "true"

export async function getHomeEvents(): Promise<HomeEvent[]> {
  if (USE_MOCK_API) return mockHomeEventApi.getAll()
  const res = await apiV2.get<ApiResponse<HomeEvent[]>>("/admin/events")
  return unwrapV2(res) ?? []
}

export async function createHomeEvent(data: HomeEventRequest): Promise<HomeEvent> {
  if (USE_MOCK_API) return mockHomeEventApi.create(data)
  const res = await apiV2.post<ApiResponse<HomeEvent>>("/admin/events", data)
  return unwrapV2(res)
}

export async function updateHomeEvent(id: string, data: HomeEventRequest): Promise<HomeEvent> {
  if (USE_MOCK_API) return mockHomeEventApi.update(id, data)
  const res = await apiV2.put<ApiResponse<HomeEvent>>(
    `/admin/events/${encodeURIComponent(id)}`,
    data
  )
  return unwrapV2(res)
}

/** 전체 이벤트 ID를 노출 순서대로 전달해야 함 (일부만 보내면 순서가 꼬일 수 있음) */
export async function updateHomeEventOrders(eventIds: string[]): Promise<void> {
  if (USE_MOCK_API) return mockHomeEventApi.updateOrders(eventIds)
  const res = await apiV2.patch<ApiResponse<void>>("/admin/events/orders", { eventIds })
  unwrapV2(res)
}

export async function deleteHomeEvent(id: string): Promise<void> {
  if (USE_MOCK_API) return mockHomeEventApi.remove(id)
  const res = await apiV2.delete<ApiResponse<void>>(`/admin/events/${encodeURIComponent(id)}`)
  unwrapV2(res)
}
