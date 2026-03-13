import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { scheduleApi } from "@/lib/api/schedule"
import type {
  ScheduleListParams,
  CreateScheduleEventRequest,
  UpdateScheduleEventRequest,
} from "@/types/schedule"
import { toast } from "sonner"
import { useApiErrorDialog } from "@/components/ApiErrorDialog"

// 스케줄 일정 리스트 조회
export function useScheduleEvents(params: ScheduleListParams) {
  return useQuery({
    queryKey: ["admin-schedule", params],
    queryFn: () => scheduleApi.getScheduleEvents(params),
    retry: false,
  })
}

// 스케줄 일정 상세 조회
export function useScheduleEventDetail(eventId: string) {
  return useQuery({
    queryKey: ["admin-schedule-event", eventId],
    queryFn: () => scheduleApi.getScheduleEventDetail(eventId),
    enabled: !!eventId,
    retry: false,
  })
}

// 일정 생성
export function useCreateScheduleEvent() {
  const queryClient = useQueryClient()
  const showError = useApiErrorDialog()

  return useMutation({
    mutationFn: (data: CreateScheduleEventRequest) =>
      scheduleApi.createScheduleEvent(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-schedule"] })
      toast.success("일정이 생성되었습니다.")
    },
    onError: (error) => {
      showError?.(error)
    },
  })
}

// 일정 수정
export function useUpdateScheduleEvent() {
  const queryClient = useQueryClient()
  const showError = useApiErrorDialog()

  return useMutation({
    mutationFn: ({ eventId, data }: { eventId: string; data: UpdateScheduleEventRequest }) =>
      scheduleApi.updateScheduleEvent(eventId, data),
    onSuccess: (_, { eventId }) => {
      queryClient.invalidateQueries({ queryKey: ["admin-schedule"] })
      queryClient.invalidateQueries({ queryKey: ["admin-schedule-event", eventId] })
      toast.success("일정이 수정되었습니다.")
    },
    onError: (error) => {
      showError?.(error)
    },
  })
}

// 일정 삭제
export function useDeleteScheduleEvent() {
  const queryClient = useQueryClient()
  const showError = useApiErrorDialog()

  return useMutation({
    mutationFn: (eventId: string) => scheduleApi.deleteScheduleEvent(eventId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-schedule"] })
      toast.success("일정이 삭제되었습니다.")
    },
    onError: (error) => {
      showError?.(error)
    },
  })
}

// 사물함 신청 기간을 스케줄에 동기화 (일정 생성)
export function useSyncLockerPeriodToSchedule() {
  const queryClient = useQueryClient()
  const showError = useApiErrorDialog()

  return useMutation({
    mutationFn: (data: { startAt: string; endAt: string }) =>
      scheduleApi.createScheduleEvent({
        title: "사물함 신청 기간",
        type: "ACADEMIC",
        start: data.startAt,
        end: data.endAt,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-schedule"] })
      toast.success("스케줄에 사물함 신청 기간이 반영되었습니다.")
    },
    onError: (error) => {
      showError?.(error)
    },
  })
}

export const useCalendarEvents = useScheduleEvents
export const useCalendarEventDetail = useScheduleEventDetail
export const useCreateCalendarEvent = useCreateScheduleEvent
export const useUpdateCalendarEvent = useUpdateScheduleEvent
export const useDeleteCalendarEvent = useDeleteScheduleEvent
export const useSyncLockerPeriodToCalendar = useSyncLockerPeriodToSchedule
