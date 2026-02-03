/**
 * v2 관리자 유저 검색 API
 * GET /api/v2/admin/users/search — 관리자 지정 모달용 (userState, userRole, keyword)
 */

import { apiV2 } from "./client"
import { unwrapV2 } from "./response"
import type { ApiResponse } from "@/types/api-v2"
import type {
  AdminUserItemV2,
  AdminUsersSearchParamsV2,
} from "@/types/user"

/** API 응답 항목 — 백엔드가 name/email 또는 adminName/adminEmail 등으로 올 수 있음 */
type RawUserItem = Record<string, unknown> & {
  id?: string | number
  name?: string
  email?: string
  adminName?: string
  adminEmail?: string
}

function normalizeToAdminUserItem(raw: RawUserItem): AdminUserItemV2 {
  const id = raw.id != null ? String(raw.id) : ""
  const adminName =
    (raw.adminName as string) ?? (raw.name as string) ?? ""
  const adminEmail =
    (raw.adminEmail as string) ?? (raw.email as string) ?? ""
  return { id, adminName, adminEmail: adminEmail || undefined }
}

/** v2 관리자 유저 검색 — GET /api/v2/admin/users/search */
export async function getAdminUsersV2(
  params?: AdminUsersSearchParamsV2
): Promise<AdminUserItemV2[]> {
  const query: Record<string, string | undefined> = {}
  if (params?.userState != null) query.userState = params.userState
  if (params?.userRole != null) query.userRole = params.userRole
  if (params?.keyword != null && params.keyword !== "")
    query.keyword = params.keyword

  const res = await apiV2.get<
    ApiResponse<{ users?: RawUserItem[]; content?: RawUserItem[] } | RawUserItem[]>
  >("/admin/users/search", { params: query })
  const data = unwrapV2(res) as
    | { users?: RawUserItem[]; content?: RawUserItem[] }
    | RawUserItem[]
  const rawList = Array.isArray(data) ? data : (data?.users ?? data?.content ?? [])
  return rawList.map(normalizeToAdminUserItem)
}
