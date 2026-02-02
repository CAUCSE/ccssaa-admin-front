import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { eventApi } from "@/lib/api/events"
import type { EventListParams, ApproveEventRequest } from "@/types/event"
import { toast } from "sonner"
import { useApiErrorDialog } from "@/components/ApiErrorDialog"

// 경조사 리스트 조회
export function useEvents(params: EventListParams) {
  return useQuery({
    queryKey: ["admin-events", params],
    queryFn: () => eventApi.getEvents(params),
  })
}

// 경조사 상세 조회
export function useEventDetail(eventId: number) {
  return useQuery({
    queryKey: ["admin-event", eventId],
    queryFn: () => eventApi.getEventDetail(eventId),
    enabled: !!eventId,
  })
}

// 경조사 승인/거부
export function useApproveEvent() {
  const queryClient = useQueryClient()
  const showError = useApiErrorDialog()

  return useMutation({
    mutationFn: ({ eventId, data }: { eventId: number; data: ApproveEventRequest }) =>
      eventApi.approveEvent(eventId, data),
    onSuccess: (_, { eventId }) => {
      queryClient.invalidateQueries({ queryKey: ["admin-events"] })
      queryClient.invalidateQueries({ queryKey: ["admin-event", eventId] })
      toast.success("경조사 처리 완료되었습니다.")
    },
    onError: (error) => {
      showError?.(error)
    },
  })
}

