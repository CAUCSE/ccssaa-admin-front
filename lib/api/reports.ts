import { api } from "../api"
import type {
  Report,
  ReportListParams,
  ReportListResponse,
  ReportAction,
} from "@/types/report"
import type { ApiResponse } from "@/types/api-v2"
import { unwrapV2 } from "./v2/response"
import { mockReportApi } from "../mock/reports"

// 환경 변수로 Mock 모드 제어
const USE_MOCK_API = process.env.NEXT_PUBLIC_USE_MOCK_API === "true"

// 실제 API 함수들
const realReportApi = {
  // 신고 리스트 조회
  getReports: async (params: ReportListParams): Promise<ReportListResponse> => {
    const response = await api.get<ApiResponse<ReportListResponse>>("/admin/reports", {
      params,
    })
    return unwrapV2(response)
  },

  // 신고 상세 조회
  getReportDetail: async (reportId: number): Promise<Report> => {
    const response = await api.get<ApiResponse<Report>>(`/admin/reports/${reportId}`)
    return unwrapV2(response)
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
export const reportApi = USE_MOCK_API ? mockReportApi : realReportApi
