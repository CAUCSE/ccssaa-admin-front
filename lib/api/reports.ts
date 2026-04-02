import { api } from "../api"
import type {
  Report,
  ReportListParams,
  ReportListResponse,
  ReportAction,
} from "@/types/report"
import { mockReportApi } from "../mock/reports"
import { withMock } from "@/lib/mock"

// 실제 API 함수들
const realReportApi = {
  // 신고 리스트 조회
  getReports: async (params: ReportListParams): Promise<ReportListResponse> => {
    const response = await api.get<ReportListResponse>("/admin/reports", { params })
    return response.data
  },

  // 신고 상세 조회
  getReportDetail: async (reportId: number): Promise<Report> => {
    const response = await api.get<Report>(`/admin/reports/${reportId}`)
    return response.data
  },

  // 신고 처리 (반려/승인)
  processReport: async (
    reportId: number,
    action: ReportAction,
    targetId?: number
  ): Promise<void> => {
    await api.post(`/admin/reports/${reportId}/process`, { action, targetId })
  },
}

// Mock 모드에 따라 API 선택
export const reportApi = withMock(realReportApi, mockReportApi)

