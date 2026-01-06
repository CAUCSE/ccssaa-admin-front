import { api } from "../api"
import type { DashboardData } from "@/types/dashboard"
import { mockDashboardApi } from "../mock/dashboard"

// 환경 변수로 Mock 모드 제어
const USE_MOCK_API = process.env.NEXT_PUBLIC_USE_MOCK_API === "true"

// 실제 API 함수
const realDashboardApi = {
  getDashboardData: async (): Promise<DashboardData> => {
    const response = await api.get<DashboardData>("/admin/dashboard")
    return response.data
  },
}

// Mock 모드에 따라 API 선택
export const dashboardApi = USE_MOCK_API ? mockDashboardApi : realDashboardApi

// 외부에서 사용할 함수
export async function getDashboardData(): Promise<DashboardData> {
  return dashboardApi.getDashboardData()
}

