import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { lockerApi } from "@/lib/api/lockers"
import {
  getLockersV2,
  mapLockerItemV2ToLocker,
  assignLockerV2,
  extendLockerV2,
  releaseLockerV2,
  enableLockerV2,
  disableLockerV2,
  releaseAllExpiredLockersV2,
} from "@/lib/api/v2/lockers"
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
        userKeyword: params.userKeyword?.trim() || undefined,
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

// 수동 배정 (v2: POST /api/v2/admin/lockers/{id}/assign)
export function useAssignLocker() {
  const queryClient = useQueryClient()
  const showError = useApiErrorDialog()

  return useMutation({
    mutationFn: ({
      lockerId,
      data,
    }: {
      lockerId: number | string
      data: AssignLockerRequest
    }) => assignLockerV2(lockerId, data),
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

// 만료일 연장 (v2: POST /api/v2/admin/lockers/{id}/extend)
export function useExtendLocker() {
  const queryClient = useQueryClient()
  const showError = useApiErrorDialog()

  return useMutation({
    mutationFn: ({
      lockerId,
      data,
    }: {
      lockerId: number | string
      data: ExtendLockerRequest
    }) => extendLockerV2(lockerId, data),
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

// 개별 회수 (v2: POST /api/v2/admin/lockers/{id}/release)
export function useReleaseLocker() {
  const queryClient = useQueryClient()
  const showError = useApiErrorDialog()

  return useMutation({
    mutationFn: (lockerId: number | string) => releaseLockerV2(lockerId),
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

// 활성화 (v2: POST /api/v2/admin/lockers/{id}/enable)
export function useEnableLocker() {
  const queryClient = useQueryClient()
  const showError = useApiErrorDialog()

  return useMutation({
    mutationFn: (lockerId: number | string) => enableLockerV2(lockerId),
    onSuccess: (_, lockerId) => {
      queryClient.invalidateQueries({ queryKey: ["admin-lockers"] })
      queryClient.invalidateQueries({ queryKey: ["admin-locker", lockerId] })
      toast.success("사물함이 활성화되었습니다.")
    },
    onError: (error) => {
      showError?.(error)
    },
  })
}

// 비활성화 (v2: POST /api/v2/admin/lockers/{id}/disable, 사용 중이면 함께 해제)
export function useDisableLocker() {
  const queryClient = useQueryClient()
  const showError = useApiErrorDialog()

  return useMutation({
    mutationFn: (lockerId: number | string) => disableLockerV2(lockerId),
    onSuccess: (_, lockerId) => {
      queryClient.invalidateQueries({ queryKey: ["admin-lockers"] })
      queryClient.invalidateQueries({ queryKey: ["admin-locker", lockerId] })
      toast.success("사물함이 비활성화되었습니다.")
    },
    onError: (error) => {
      showError?.(error)
    },
  })
}

// 만료 사물함 일괄 회수 (v2: POST /api/v2/admin/lockers/release-all-expired)
export function useReleaseAllExpiredLockers() {
  const queryClient = useQueryClient()
  const showError = useApiErrorDialog()

  return useMutation({
    mutationFn: () => releaseAllExpiredLockersV2(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-lockers"] })
      toast.success("만료된 사물함 일괄 회수가 완료되었습니다.")
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
