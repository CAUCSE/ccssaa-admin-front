import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { eventApi } from "@/lib/api/events"
import type { EventListParams } from "@/types/event"
import { toast } from "sonner"

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

// 경조사 승인
export function useApproveEvent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (eventId: string) => eventApi.approveEvent(eventId),
    onSuccess: (_, eventId) => {
      queryClient.invalidateQueries({ queryKey: ["admin-events"] })
      queryClient.invalidateQueries({ queryKey: ["admin-event", eventId] })
      toast.success("경조사 승인 처리되었습니다.")
    },
    onError: () => {
      toast.error("경조사 승인 처리에 실패했습니다.")
    },
  })
}

// 경조사 거절
export function useRejectEvent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (variables: { eventId: string; rejectReason: string }) =>
      eventApi.rejectEvent(variables),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin-events"] })
      queryClient.invalidateQueries({ queryKey: ["admin-event", variables.eventId] })
      toast.success("경조사 거절 처리되었습니다.")
    },
    onError: () => {
      toast.error("경조사 거절 처리에 실패했습니다.")
    },
  })
}

