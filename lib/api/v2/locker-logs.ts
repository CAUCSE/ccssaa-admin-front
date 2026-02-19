/**
 * v2 사물함 로그 API
 * GET /api/v2/admin/lockers/logs
 */

import { apiV2 } from "./client"
import { unwrapV2 } from "./response"
import type { ApiResponse } from "@/types/api-v2"
import type {
  LockerLogListRequestV2,
  LockerLogListPayloadV2,
} from "@/types/locker"

/** v2 사물함 로그 목록 — GET /api/v2/admin/lockers/logs */
export async function getLockerLogsV2(
  params: LockerLogListRequestV2
): Promise<LockerLogListPayloadV2> {
  const res = await apiV2.get<ApiResponse<LockerLogListPayloadV2>>(
    "/admin/lockers/logs",
    {
      params: {
        userKeyword: params.userKeyword?.trim() || undefined,
        action: params.action || undefined,
        lockerLocationName: params.lockerLocationName || undefined,
        lockerNumber: params.lockerNumber ?? undefined,
        page: params.page,
        size: params.size,
      },
    }
  )
  const data = unwrapV2(res)
  if (!data) {
    return {
      content: [],
      currentPage: 0,
      size: params.size,
      totalPages: 0,
      totalElements: 0,
      hasNext: false,
      hasPrev: false,
    }
  }
  return data
}
