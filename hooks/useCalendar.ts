import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { calendarApi } from "@/lib/api/calendar"
import type {
  CalendarListParams,
  CreateCalendarEventRequest,
  UpdateCalendarEventRequest,
} from "@/types/calendar"
import { toast } from "sonner"
import { useApiErrorDialog } from "@/components/ApiErrorDialog"

// 캘린더 일정 리스트 조회
export function useCalendarEvents(params: CalendarListParams) {
  return useQuery({
    queryKey: ["admin-calendar", params],
    queryFn: () => calendarApi.getCalendarEvents(params),
  })
}

// 캘린더 일정 상세 조회
export function useCalendarEventDetail(eventId: string) {
  return useQuery({
    queryKey: ["admin-calendar-event", eventId],
    queryFn: () => calendarApi.getCalendarEventDetail(eventId),
    enabled: !!eventId,
  })
}

// 일정 생성
export function useCreateCalendarEvent() {
  const queryClient = useQueryClient()
  const showError = useApiErrorDialog()

  return useMutation({
    mutationFn: (data: CreateCalendarEventRequest) =>
      calendarApi.createCalendarEvent(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-calendar"] })
      toast.success("일정이 생성되었습니다.")
    },
    onError: (error) => {
      showError?.(error)
    },
  })
}

// 일정 수정
export function useUpdateCalendarEvent() {
  const queryClient = useQueryClient()
  const showError = useApiErrorDialog()

  return useMutation({
    mutationFn: ({ eventId, data }: { eventId: string; data: UpdateCalendarEventRequest }) =>
      calendarApi.updateCalendarEvent(eventId, data),
    onSuccess: (_, { eventId }) => {
      queryClient.invalidateQueries({ queryKey: ["admin-calendar"] })
      queryClient.invalidateQueries({ queryKey: ["admin-calendar-event", eventId] })
      toast.success("일정이 수정되었습니다.")
    },
    onError: (error) => {
      showError?.(error)
    },
  })
}

// 일정 삭제
export function useDeleteCalendarEvent() {
  const queryClient = useQueryClient()
  const showError = useApiErrorDialog()

  return useMutation({
    mutationFn: (eventId: string) => calendarApi.deleteCalendarEvent(eventId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-calendar"] })
      toast.success("일정이 삭제되었습니다.")
    },
    onError: (error) => {
      showError?.(error)
    },
  })
}

// 사물함 신청 기간을 캘린더에 동기화 (일정 생성)
export function useSyncLockerPeriodToCalendar() {
  const queryClient = useQueryClient()
  const showError = useApiErrorDialog()

  return useMutation({
    mutationFn: (data: { startAt: string; endAt: string }) =>
      calendarApi.createCalendarEvent({
        title: "사물함 신청 기간",
        type: "ACADEMIC",
        start: data.startAt,
        end: data.endAt,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-calendar"] })
      toast.success("캘린더에 사물함 신청 기간이 반영되었습니다.")
    },
    onError: (error) => {
      showError?.(error)
    },
  })
}
