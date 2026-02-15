import { useQuery } from "@tanstack/react-query"
import { getLockerLogsV2 } from "@/lib/api/v2/locker-logs"
import type { LockerLogListParams } from "@/types/locker"

const QUERY_KEY = "admin-locker-logs"

export function useLockerLogs(params: LockerLogListParams) {
  return useQuery({
    queryKey: [QUERY_KEY, params],
    queryFn: async () => {
      const page = params.page ?? 0
      const size = params.size ?? 20
      const payload = await getLockerLogsV2({
        userKeyword: params.userKeyword?.trim() || undefined,
        action: params.action || undefined,
        lockerLocationName: params.lockerLocationName,
        lockerNumber: params.lockerNumber != null ? Number(params.lockerNumber) : undefined,
        page,
        size,
      })
      return {
        content: payload.content,
        totalElements: payload.totalElements,
        totalPages: payload.totalPages,
        size: payload.size,
        number: payload.currentPage,
      }
    },
  })
}
