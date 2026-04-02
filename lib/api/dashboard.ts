import { api } from "../api"
import type { DashboardData } from "@/types/dashboard"
import { mockDashboardApi } from "../mock/dashboard"
import { withMock } from "@/lib/mock"

// 실제 API 함수
const realDashboardApi = {
  getDashboardData: async (): Promise<DashboardData> => {
    const response = await api.get<DashboardData>("/admin/dashboard")
    return response.data
  },
}

// Mock 모드에 따라 API 선택
export const dashboardApi = withMock(realDashboardApi, mockDashboardApi)

// 외부에서 사용할 함수
export async function getDashboardData(): Promise<DashboardData> {
  return dashboardApi.getDashboardData()
}

