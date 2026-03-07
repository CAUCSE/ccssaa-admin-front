import { useQuery } from "@tanstack/react-query"
import { eventApi } from "@/lib/api/events"
import type { EventListParams } from "@/types/event"

// 경조사 리스트 조회
export function useEvents(params: EventListParams) {
  return useQuery({
    queryKey: ["admin-events", params],
    queryFn: () => eventApi.getEvents(params),
  })
}

// 경조사 상세 조회
export function useEventDetail(eventId: string | undefined) {
  return useQuery({
    queryKey: ["admin-event", eventId],
    queryFn: () => eventApi.getEventDetail(eventId!),
    enabled: !!eventId,
  })
}

