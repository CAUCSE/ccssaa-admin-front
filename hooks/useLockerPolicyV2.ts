import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  getLockerPolicyV2,
  updateLockerPolicyRegisterPeriodV2,
  updateLockerPolicyExtendPeriodV2,
  updateLockerPolicyRegisterStatusV2,
  updateLockerPolicyExtendStatusV2,
} from "@/lib/api/v2/locker-policy"
import type {
  LockerPolicyRegisterPeriodRequest,
  LockerPolicyExtendPeriodRequest,
  LockerPolicyStatusRequest,
} from "@/types/locker"
import { toast } from "sonner"
import { useApiErrorDialog } from "@/components/ApiErrorDialog"

const QUERY_KEY = "admin-locker-policy-v2"

export function useLockerPolicyV2() {
  return useQuery({
    queryKey: [QUERY_KEY],
    queryFn: getLockerPolicyV2,
  })
}

export function useUpdateLockerPolicyRegisterPeriodV2() {
  const queryClient = useQueryClient()
  const showError = useApiErrorDialog()

  return useMutation({
    mutationFn: (data: LockerPolicyRegisterPeriodRequest) =>
      updateLockerPolicyRegisterPeriodV2(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] })
      toast.success("신청 기간·만료일이 저장되었습니다.")
    },
    onError: (error) => {
      showError?.(error)
    },
  })
}

export function useUpdateLockerPolicyExtendPeriodV2() {
  const queryClient = useQueryClient()
  const showError = useApiErrorDialog()

  return useMutation({
    mutationFn: (data: LockerPolicyExtendPeriodRequest) =>
      updateLockerPolicyExtendPeriodV2(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] })
      toast.success("연장 기간이 저장되었습니다.")
    },
    onError: (error) => {
      showError?.(error)
    },
  })
}

export function useUpdateLockerPolicyRegisterStatusV2() {
  const queryClient = useQueryClient()
  const showError = useApiErrorDialog()

  return useMutation({
    mutationFn: (data: LockerPolicyStatusRequest) =>
      updateLockerPolicyRegisterStatusV2(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] })
      toast.success("사물함 신청 가능 상태가 변경되었습니다.")
    },
    onError: (error) => {
      showError?.(error)
    },
  })
}

export function useUpdateLockerPolicyExtendStatusV2() {
  const queryClient = useQueryClient()
  const showError = useApiErrorDialog()

  return useMutation({
    mutationFn: (data: LockerPolicyStatusRequest) =>
      updateLockerPolicyExtendStatusV2(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] })
      toast.success("사물함 연장 가능 상태가 변경되었습니다.")
    },
    onError: (error) => {
      showError?.(error)
    },
  })
}
