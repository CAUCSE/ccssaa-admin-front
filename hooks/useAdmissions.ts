import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { admissionApi } from "@/lib/api/admissions"
import type { AdmissionListParams, RejectAdmissionRequest } from "@/types/admission"
import { toast } from "sonner"
import { useApiErrorDialog } from "@/components/ApiErrorDialog"

export function useAdmissions(params: AdmissionListParams) {
  return useQuery({
    queryKey: ["admissions", params],
    queryFn: () => admissionApi.getAdmissions(params),
  })
}

export function useAdmissionDetail(admissionId: string) {
  return useQuery({
    queryKey: ["admission", admissionId],
    queryFn: () => admissionApi.getAdmissionDetail(admissionId),
    enabled: !!admissionId,
  })
}

export function useApproveAdmission() {
  const queryClient = useQueryClient()
  const showError = useApiErrorDialog()

  return useMutation({
    mutationFn: (admissionId: string) =>
      admissionApi.approveAdmission(admissionId),
    onSuccess: (_, admissionId) => {
      queryClient.invalidateQueries({ queryKey: ["admissions"] })
      queryClient.invalidateQueries({ queryKey: ["admission", admissionId] })
      toast.success("인증 신청이 승인되었습니다.")
    },
    onError: (error) => {
      showError?.(error)
    },
  })
}

export function useRejectAdmission() {
  const queryClient = useQueryClient()
  const showError = useApiErrorDialog()

  return useMutation({
    mutationFn: ({
      admissionId,
      data,
    }: {
      admissionId: string
      data: RejectAdmissionRequest
    }) => admissionApi.rejectAdmission(admissionId, data),
    onSuccess: (_, { admissionId }) => {
      queryClient.invalidateQueries({ queryKey: ["admissions"] })
      queryClient.invalidateQueries({ queryKey: ["admission", admissionId] })
      toast.success("인증 신청이 거절되었습니다.")
    },
    onError: (error) => {
      showError?.(error)
    },
  })
}
