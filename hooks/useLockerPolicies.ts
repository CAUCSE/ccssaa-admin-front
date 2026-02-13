import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { lockerPolicyApi } from "@/lib/api/locker-policies"
import type { LockerPolicyFormData } from "@/types/locker-policy"
import { toast } from "sonner"
import { useApiErrorDialog } from "@/components/ApiErrorDialog"

const QUERY_KEY = "admin-locker-policies"

export function useLockerPolicies() {
  return useQuery({
    queryKey: [QUERY_KEY],
    queryFn: () => lockerPolicyApi.getList(),
  })
}

export function useLockerPolicy(id: number | null) {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => (id != null ? lockerPolicyApi.getById(id) : Promise.resolve(null)),
    enabled: id != null,
  })
}

export function useCreateLockerPolicy() {
  const queryClient = useQueryClient()
  const showError = useApiErrorDialog()

  return useMutation({
    mutationFn: (data: LockerPolicyFormData) => lockerPolicyApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] })
      toast.success("정책이 등록되었습니다.")
    },
    onError: (error) => {
      showError?.(error)
    },
  })
}

export function useUpdateLockerPolicy() {
  const queryClient = useQueryClient()
  const showError = useApiErrorDialog()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: LockerPolicyFormData }) =>
      lockerPolicyApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] })
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, id] })
      toast.success("정책이 수정되었습니다.")
    },
    onError: (error) => {
      showError?.(error)
    },
  })
}

export function useActivateLockerPolicy() {
  const queryClient = useQueryClient()
  const showError = useApiErrorDialog()

  return useMutation({
    mutationFn: (id: number) => lockerPolicyApi.activate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] })
      toast.success("해당 정책이 활성화되었습니다.")
    },
    onError: (error) => {
      showError?.(error)
    },
  })
}
