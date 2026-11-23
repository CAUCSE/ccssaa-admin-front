import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { useApiErrorDialog } from "@/components/ApiErrorDialog"
import {
  createHomeEvent,
  deleteHomeEvent,
  getHomeEvents,
  updateHomeEvent,
  updateHomeEventOrders,
} from "@/lib/api/v2/home-events"
import type { HomeEventRequest } from "@/types/home-event"

const homeEventsKey = ["admin-home-events"]

export function useHomeEvents() {
  const showError = useApiErrorDialog()
  return useQuery({
    queryKey: homeEventsKey,
    queryFn: async () => {
      try {
        const events = await getHomeEvents()
        return [...events].sort((a, b) => a.displayOrder - b.displayOrder)
      } catch (error) {
        showError?.(error)
        throw error
      }
    },
  })
}

function useHomeEventMutation<T>(
  mutationFn: (variables: T) => Promise<unknown>,
  successMessage: string | ((variables: T) => string)
) {
  const queryClient = useQueryClient()
  const showError = useApiErrorDialog()
  return useMutation({
    mutationFn,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: homeEventsKey })
      toast.success(
        typeof successMessage === "function" ? successMessage(variables) : successMessage
      )
    },
    onError: (error) => showError?.(error),
  })
}

export function useCreateHomeEvent() {
  return useHomeEventMutation<HomeEventRequest>(createHomeEvent, "이벤트가 등록되었습니다.")
}

export function useUpdateHomeEvent() {
  return useHomeEventMutation<{ id: string; data: HomeEventRequest; message?: string }>(
    ({ id, data }) => updateHomeEvent(id, data),
    ({ message }) => message ?? "이벤트가 수정되었습니다."
  )
}

export function useUpdateHomeEventOrders() {
  return useHomeEventMutation<string[]>(updateHomeEventOrders, "노출 순서가 저장되었습니다.")
}

export function useDeleteHomeEvent() {
  return useHomeEventMutation<string>(deleteHomeEvent, "이벤트가 삭제되었습니다.")
}
