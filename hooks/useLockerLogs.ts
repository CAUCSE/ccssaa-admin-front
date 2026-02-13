import { useQuery } from "@tanstack/react-query"
import { lockerLogApi } from "@/lib/api/locker-logs"
import type { LockerLogListParams } from "@/types/locker"

const QUERY_KEY = "admin-locker-logs"

export function useLockerLogs(params: LockerLogListParams) {
  return useQuery({
    queryKey: [QUERY_KEY, params],
    queryFn: () => lockerLogApi.getLogs(params),
  })
}

