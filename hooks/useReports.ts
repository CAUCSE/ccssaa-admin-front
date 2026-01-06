import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { reportApi } from "@/lib/api/reports"
import type { ReportListParams, ReportAction } from "@/types/report"
import { toast } from "sonner"

// 신고 리스트 조회
export function useReports(params: ReportListParams) {
  return useQuery({
    queryKey: ["admin-reports", params],
    queryFn: () => reportApi.getReports(params),
  })
}

// 신고 상세 조회
export function useReportDetail(reportId: number) {
  return useQuery({
    queryKey: ["admin-report", reportId],
    queryFn: () => reportApi.getReportDetail(reportId),
    enabled: !!reportId,
  })
}

// 신고 처리 (반려/승인)
export function useProcessReport() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      reportId,
      action,
      targetId,
    }: {
      reportId: number
      action: ReportAction
      targetId?: number
    }) => reportApi.processReport(reportId, action, targetId),
    onSuccess: (_, { reportId, action }) => {
      queryClient.invalidateQueries({ queryKey: ["admin-reports"] })
      queryClient.invalidateQueries({ queryKey: ["admin-report", reportId] })
      toast.success(
        action === "APPROVE" ? "신고가 승인되어 처리되었습니다." : "신고가 반려되었습니다."
      )
    },
    onError: () => {
      toast.error("신고 처리에 실패했습니다.")
    },
  })
}

