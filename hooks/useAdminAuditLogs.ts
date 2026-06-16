import { useQuery } from "@tanstack/react-query"
import { getAdminAuditLogsV2 } from "@/lib/api/v2/admin-audit-logs"
import { mockAdminAuditLogApi } from "@/lib/mock/admin-audit-logs"
import type { AdminAuditLogListParams } from "@/types/admin-audit-log"

export const ADMIN_AUDIT_LOGS_QUERY_KEY = "admin-audit-logs"

const USE_MOCK_API = process.env.NEXT_PUBLIC_USE_MOCK_API === "true"

export function useAdminAuditLogs(params: AdminAuditLogListParams) {
  return useQuery({
    queryKey: [ADMIN_AUDIT_LOGS_QUERY_KEY, params],
    queryFn: () =>
      USE_MOCK_API
        ? mockAdminAuditLogApi.getAuditLogs(params)
        : getAdminAuditLogsV2(params),
  })
}

