import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { lockerApi } from "@/lib/api/lockers"
import { getLockersV2, mapLockerItemV2ToLocker } from "@/lib/api/v2/lockers"
import type {
  LockerListParams,
  AssignLockerRequest,
  LockerApplicationPeriod,
  ExtendLockerRequest,
  LockerNameV2,
} from "@/types/locker"
import { toast } from "sonner"
import { useApiErrorDialog } from "@/components/ApiErrorDialog"

// 사물함 리스트 조회 (v2 API: GET /api/v2/admin/lockers)
export function useLockers(params: LockerListParams) {
  return useQuery({
    queryKey: ["admin-lockers", params],
    queryFn: async () => {
      const page = params.page ?? 0
      const size = params.size ?? 10
      const payload = await getLockersV2({
        location: params.locationV2 as LockerNameV2 | undefined,
        isActive: params.isActive,
        isOccupied: params.isOccupied,
        page,
        size,
      })
      return {
        content: payload.content.map(mapLockerItemV2ToLocker),
        totalElements: payload.totalElements,
        totalPages: payload.totalPages,
        size: payload.size,
        number: payload.currentPage,
      }
    },
  })
}

// 사물함 상세 조회
export function useLockerDetail(lockerId: number) {
  return useQuery({
    queryKey: ["admin-locker", lockerId],
    queryFn: () => lockerApi.getLockerDetail(lockerId),
    enabled: !!lockerId,
  })
}

// 신청 기간 조회
export function useLockerApplicationPeriod() {
  return useQuery({
    queryKey: ["admin-locker-application-period"],
    queryFn: () => lockerApi.getLockerApplicationPeriod(),
  })
}

// 수동 배정
export function useAssignLocker() {
  const queryClient = useQueryClient()
  const showError = useApiErrorDialog()

  return useMutation({
    mutationFn: ({ lockerId, data }: { lockerId: number; data: AssignLockerRequest }) =>
      lockerApi.assignLocker(lockerId, data),
    onSuccess: (_, { lockerId }) => {
      queryClient.invalidateQueries({ queryKey: ["admin-lockers"] })
      queryClient.invalidateQueries({ queryKey: ["admin-locker", lockerId] })
      toast.success("사물함 배정이 완료되었습니다.")
    },
    onError: (error) => {
      showError?.(error)
    },
  })
}

// 만료일 연장
export function useExtendLocker() {
  const queryClient = useQueryClient()
  const showError = useApiErrorDialog()

  return useMutation({
    mutationFn: ({ lockerId, data }: { lockerId: number; data: ExtendLockerRequest }) =>
      lockerApi.extendLocker(lockerId, data),
    onSuccess: (_, { lockerId }) => {
      queryClient.invalidateQueries({ queryKey: ["admin-lockers"] })
      queryClient.invalidateQueries({ queryKey: ["admin-locker", lockerId] })
      toast.success("사물함 만료일이 연장되었습니다.")
    },
    onError: (error) => {
      showError?.(error)
    },
  })
}

// 개별 회수
export function useReleaseLocker() {
  const queryClient = useQueryClient()
  const showError = useApiErrorDialog()

  return useMutation({
    mutationFn: (lockerId: number) => lockerApi.releaseLocker(lockerId),
    onSuccess: (_, lockerId) => {
      queryClient.invalidateQueries({ queryKey: ["admin-lockers"] })
      queryClient.invalidateQueries({ queryKey: ["admin-locker", lockerId] })
      toast.success("사물함 회수가 완료되었습니다.")
    },
    onError: (error) => {
      showError?.(error)
    },
  })
}

// 일괄 회수
export function useReleaseAllLockers() {
  const queryClient = useQueryClient()
  const showError = useApiErrorDialog()

  return useMutation({
    mutationFn: () => lockerApi.releaseAllLockers(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-lockers"] })
      toast.success("모든 사물함 회수가 완료되었습니다.")
    },
    onError: (error) => {
      showError?.(error)
    },
  })
}

// 신청 기간 설정
export function useSetLockerApplicationPeriod() {
  const queryClient = useQueryClient()
  const showError = useApiErrorDialog()

  return useMutation({
    mutationFn: (data: LockerApplicationPeriod) =>
      lockerApi.setLockerApplicationPeriod(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-locker-application-period"] })
      toast.success("신청 기간이 설정되었습니다.")
    },
    onError: (error) => {
      showError?.(error)
    },
  })
}
