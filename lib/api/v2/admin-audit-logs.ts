import { apiV2 } from "./client"
import { unwrapV2 } from "./response"
import type { ApiResponse } from "@/types/api-v2"
import type {
  AdminAuditLogListParams,
  AdminAuditLogListPayload,
} from "@/types/admin-audit-log"

export async function getAdminAuditLogsV2(
  params: AdminAuditLogListParams
): Promise<AdminAuditLogListPayload> {
  const size = params.size ?? 10
  const res = await apiV2.get<ApiResponse<AdminAuditLogListPayload>>(
    "/admin/audit-logs",
    {
      params: {
        from: params.from || undefined,
        to: params.to || undefined,
        category: params.category || undefined,
        actionType: params.actionType || undefined,
        keyword: params.keyword?.trim() || undefined,
        page: params.page ?? 0,
        size,
      },
    }
  )
  const data = unwrapV2(res)
  if (!data) {
    return {
      content: [],
      currentPage: 0,
      size,
      totalPages: 0,
      totalElements: 0,
      hasNext: false,
      hasPrev: false,
    }
  }
  return data
}

