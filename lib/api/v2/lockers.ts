/**
 * v2 사물함 API
 * GET /api/v2/admin/lockers — 관리자 사물함 목록 조회
 */

import { apiV2 } from "./client"
import { unwrapV2 } from "./response"
import type { ApiResponse } from "@/types/api-v2"
import type {
  LockerListRequestV2,
  LockerListPayloadV2,
  LockerListItemV2,
  Locker,
} from "@/types/locker"

/** v2 사물함 목록 — GET /api/v2/admin/lockers */
export async function getLockersV2(
  params: LockerListRequestV2
): Promise<LockerListPayloadV2> {
  const res = await apiV2.get<ApiResponse<LockerListPayloadV2>>("/admin/lockers", {
    params: {
      location: params.location,
      isActive: params.isActive,
      isOccupied: params.isOccupied,
      page: params.page,
      size: params.size,
    },
  })
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

/** v2 목록 항목을 공통 Locker 타입으로 변환 (테이블/액션용) */
export function mapLockerItemV2ToLocker(item: LockerListItemV2): Locker {
  return {
    id: (item as unknown as { id?: number }).id ?? undefined,
    number: item.lockerNumber,
    status: item.status,
    location: item.location,
    currentUserId: item.user ? (item.user.id ?? -1) : undefined,
    currentUserName: item.user?.name,
    currentUserStudentNo: item.user?.studentNo,
    expiredAt: item.expireDate ?? undefined,
  }
}
