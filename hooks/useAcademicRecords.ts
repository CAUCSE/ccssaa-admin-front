import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  getApplications,
  getApplicationDetail,
  approveApplication,
  rejectApplication,
} from "@/lib/api/academic-records"
import type { AcademicRecordListParams } from "@/types/academic-record"
import { useApiErrorDialog } from "@/components/ApiErrorDialog"
import { toast } from "sonner"

/** 학적 상태 변경 요청 목록 조회 */
export function useAcademicRecordApplications(params?: AcademicRecordListParams) {
  const showError = useApiErrorDialog()

  return useQuery({
    queryKey: ["academic-record-applications", params],
    queryFn: async () => {
      try {
        return await getApplications(params)
      } catch (error) {
        showError?.(error)
        throw error
      }
    },
  })
}

/** 학적 상태 변경 요청 상세 조회 */
export function useAcademicRecordApplicationDetail(applicationId: string | undefined) {
  const showError = useApiErrorDialog()

  return useQuery({
    queryKey: ["academic-record-application", applicationId],
    queryFn: async () => {
      try {
        return await getApplicationDetail(applicationId!)
      } catch (error) {
        showError?.(error)
        throw error
      }
    },
    enabled: !!applicationId,
  })
}

/** 학적 상태 변경 요청 승인 */
export function useApproveAcademicRecord() {
  const queryClient = useQueryClient()
  const showError = useApiErrorDialog()

  return useMutation({
    mutationFn: (applicationId: string) =>
      approveApplication(applicationId),
    onSuccess: (_, applicationId) => {
      queryClient.invalidateQueries({ queryKey: ["academic-record-applications"] })
      queryClient.invalidateQueries({ queryKey: ["academic-record-application", applicationId] })
      toast.success("학적 상태 변경 요청이 승인되었습니다.")
    },
    onError: (error) => {
      showError?.(error)
    },
  })
}

/** 학적 상태 변경 요청 거절 */
export function useRejectAcademicRecord() {
  const queryClient = useQueryClient()
  const showError = useApiErrorDialog()

  return useMutation({
    mutationFn: ({ applicationId, rejectReason }: { applicationId: string; rejectReason: string }) =>
      rejectApplication(applicationId, rejectReason),
    onSuccess: (_, { applicationId }) => {
      queryClient.invalidateQueries({ queryKey: ["academic-record-applications"] })
      queryClient.invalidateQueries({ queryKey: ["academic-record-application", applicationId] })
      toast.success("학적 상태 변경 요청이 거절되었습니다.")
    },
    onError: (error) => {
      showError?.(error)
    },
  })
}
