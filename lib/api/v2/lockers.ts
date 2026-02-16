/**
 * v2 사물함 API
 * GET  /api/v2/admin/lockers — 목록
 * POST /api/v2/admin/lockers/{id}/assign  — 배정
 * POST /api/v2/admin/lockers/{id}/extend  — 연장
 * POST /api/v2/admin/lockers/{id}/release — 회수
 */

import { apiV2 } from "./client"
import { unwrapV2 } from "./response"
import type { ApiResponse } from "@/types/api-v2"
import type {
  LockerListRequestV2,
  LockerListPayloadV2,
  LockerListItemV2,
  Locker,
  LockerUserV2,
  AssignLockerRequest,
  ExtendLockerRequest,
} from "@/types/locker"

/** v2 사물함 목록 — GET /api/v2/admin/lockers */
export async function getLockersV2(
  params: LockerListRequestV2
): Promise<LockerListPayloadV2> {
  const res = await apiV2.get<ApiResponse<LockerListPayloadV2>>("/admin/lockers", {
    params: {
      userKeyword: params.userKeyword?.trim() || undefined,
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
  const id = item.id ?? (item as unknown as { id?: number | string }).id
  const user = item.user
  const hasUser = user != null && user !== ""
  const isUserObject = hasUser && typeof user === "object"
  return {
    id: id ?? undefined,
    number: item.lockerNumber,
    status: item.status,
    location: item.location,
    currentUserId: hasUser ? (isUserObject && "id" in user ? (user.id ?? -1) : -1) : undefined,
    currentUserName: hasUser
      ? typeof user === "string"
        ? user
        : (user as LockerUserV2).name
      : undefined,
    currentUserStudentNo:
      hasUser && isUserObject && "studentNo" in user
        ? (user as LockerUserV2).studentNo
        : undefined,
    expiredAt: item.expireDate ?? undefined,
  }
}

/** v2 배정 — POST /api/v2/admin/lockers/{id}/assign */
export async function assignLockerV2(
  id: number | string,
  data: AssignLockerRequest
): Promise<void> {
  await apiV2.post(`/admin/lockers/${id}/assign`, data)
}

/** v2 연장 — POST /api/v2/admin/lockers/{id}/extend */
export async function extendLockerV2(
  id: number | string,
  data: ExtendLockerRequest
): Promise<void> {
  await apiV2.post(`/admin/lockers/${id}/extend`, data)
}

/** v2 회수 — POST /api/v2/admin/lockers/{id}/release */
export async function releaseLockerV2(id: number | string): Promise<void> {
  await apiV2.post(`/admin/lockers/${id}/release`)
}

/** v2 활성화 — POST /api/v2/admin/lockers/{id}/enable */
export async function enableLockerV2(id: number | string): Promise<void> {
  await apiV2.post(`/admin/lockers/${id}/enable`)
}

/** v2 비활성화 — POST /api/v2/admin/lockers/{id}/disable (사용 중이면 함께 해제) */
export async function disableLockerV2(id: number | string): Promise<void> {
  await apiV2.post(`/admin/lockers/${id}/disable`)
}
