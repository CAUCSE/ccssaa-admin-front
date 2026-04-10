import { apiV2 } from "./v2/client"
import { unwrapV2 } from "./v2/response"
import type { ApiResponse } from "@/types/api-v2"
import type { DashboardData } from "@/types/dashboard"
import { buildMockDashboardData, mockDashboardApi } from "../mock/dashboard"

const USE_MOCK_API = process.env.NEXT_PUBLIC_USE_MOCK_API === "true"

type DailySignupCountResponse = {
  targetDate: string
  count: number
}

type TotalUserCountResponse = {
  totalUserCount: number
}

type PendingCeremonyCountResponse = {
  pendingCount: number
}

function getSeoulToday(): string {
  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Asia/Seoul",
  }).format(new Date())
}

const realDashboardApi = {
  getDashboardData: async (targetDate: string): Promise<DashboardData> => {
    const mockData = buildMockDashboardData(targetDate)
    const [dailySignupResult, totalUsersResult, pendingCeremoniesResult] =
      await Promise.allSettled([
        apiV2.get<ApiResponse<DailySignupCountResponse>>(
          "/admin/users/daily-count",
          { params: { targetDate } }
        ),
        apiV2.get<ApiResponse<TotalUserCountResponse>>("/admin/users/count"),
        apiV2.get<ApiResponse<PendingCeremonyCountResponse>>(
          "/admin/ceremonies/pending-count"
        ),
      ])

    const dailySignup =
      dailySignupResult.status === "fulfilled"
        ? unwrapV2(dailySignupResult.value)
        : null
    const totalUsers =
      totalUsersResult.status === "fulfilled"
        ? unwrapV2(totalUsersResult.value)
        : null
    const pendingCeremonies =
      pendingCeremoniesResult.status === "fulfilled"
        ? unwrapV2(pendingCeremoniesResult.value)
        : null

    if (!dailySignup && !totalUsers && !pendingCeremonies) {
      return mockData
    }

    return {
      ...mockData,
      targetDate: dailySignup?.targetDate || targetDate,
      stats: {
        ...mockData.stats,
        totalUsers: totalUsers?.totalUserCount ?? mockData.stats.totalUsers,
        newUsersToday: dailySignup?.count ?? mockData.stats.newUsersToday,
        pendingEvents:
          pendingCeremonies?.pendingCount ?? mockData.stats.pendingEvents,
      },
    }
  },
}

export const dashboardApi = USE_MOCK_API ? mockDashboardApi : realDashboardApi

export async function getDashboardData(): Promise<DashboardData> {
  return dashboardApi.getDashboardData(getSeoulToday())
}
