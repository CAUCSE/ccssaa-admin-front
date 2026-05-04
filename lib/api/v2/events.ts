import { apiV2 } from "./client"
import { unwrapV2 } from "./response"
import type { ApiResponse } from "@/types/api-v2"
import type {
  CeremonyDetail,
  EventListParams,
  EventListResponse,
} from "@/types/event"

/** 경조사 목록 조회 */
export async function getEventsV2(
  params: EventListParams
): Promise<EventListResponse> {
  const query: Record<string, string | number | undefined> = {}
  if (params.page != null) query.page = params.page
  if (params.size != null) query.size = params.size
  if (params.fromDate) query.fromDate = params.fromDate
  if (params.toDate) query.toDate = params.toDate
  if (params.state) query.state = params.state

  const res = await apiV2.get<ApiResponse<EventListResponse>>(
    "/admin/ceremonies",
    { params: query }
  )
  return unwrapV2(res)
}

/** 경조사 상세 조회 */
export async function getEventDetailV2(
  eventId: string
): Promise<CeremonyDetail> {
  const res = await apiV2.get<ApiResponse<CeremonyDetail>>(
    `/admin/ceremonies/${encodeURIComponent(eventId)}`
  )
  return unwrapV2(res)
}

/** 경조사 승인 */
export async function approveEventV2(eventId: string): Promise<void> {
  const res = await apiV2.post<ApiResponse<Record<string, never>>>(
    `/admin/ceremonies/${encodeURIComponent(eventId)}/approve`
  )
  unwrapV2(res)
}

/** 경조사 거절 */
export async function rejectEventV2({
  eventId,
  rejectReason,
}: {
  eventId: string
  rejectReason: string
}): Promise<void> {
  const res = await apiV2.post<ApiResponse<Record<string, never>>>(
    `/admin/ceremonies/${encodeURIComponent(eventId)}/reject`,
    { rejectReason }
  )
  unwrapV2(res)
}

