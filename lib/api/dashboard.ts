import { api } from "../api"
import type { DashboardData } from "@/types/dashboard"
import { mockDashboardApi } from "../mock/dashboard"

// 실제 대시보드 API가 준비되기 전까지는 기본적으로 mock 사용
const USE_REAL_DASHBOARD_API = process.env.NEXT_PUBLIC_ENABLE_DASHBOARD_API === "true"

// 실제 API 함수
const realDashboardApi = {
  getDashboardData: async (): Promise<DashboardData> => {
    const response = await api.get<DashboardData>("/admin/dashboard")
    return response.data
  },
}

export const dashboardApi = USE_REAL_DASHBOARD_API ? realDashboardApi : mockDashboardApi

// 외부에서 사용할 함수
export async function getDashboardData(): Promise<DashboardData> {
  return dashboardApi.getDashboardData()
}

