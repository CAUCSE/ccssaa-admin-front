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
  AcademicStatus,
  Department,
  UserDetail,
  UserListParams,
  UserListResponse,
  UserStatus,
} from "@/types/user"
import { isUserStatus, isAcademicStatus } from "@/types/user"

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

/** v2 회원 리스트 응답 Raw 타입 (백엔드 DTO 그대로) */
type RawUserSummaryV2 = {
  id: string
  name: string
  studentId: string
  department: string
  state: string
  academicStatus: string
  createdAt: string
}

type RawUserListResponseV2 = {
  content: RawUserSummaryV2[]
  totalElements: number
  totalPages: number
  size: number
  number: number
}


/** v2 리스트 응답을 기존 UserListResponse/UserSummary 타입으로 매핑 */
function normalizeUserListResponseV2(
  raw: RawUserListResponseV2
): UserListResponse {
  return {
    totalElements: raw.totalElements,
    totalPages: raw.totalPages,
    size: raw.size,
    number: raw.number,
    content: raw.content.map((item) => {
      // 타입 가드로 UserStatus 검증
      if (!isUserStatus(item.state)) {
        console.warn(`Invalid UserStatus value: ${item.state}, defaulting to ACTIVE`)
      }
      
      // 타입 가드로 AcademicStatus 검증
      if (!isAcademicStatus(item.academicStatus)) {
        console.warn(`Invalid AcademicStatus value: ${item.academicStatus}, defaulting to UNDETERMINED`)
      }
      
      return {
        id: item.id,
        studentNo: item.studentId,
        name: item.name,
        department: item.department as Department,
        status: isUserStatus(item.state) ? item.state : "ACTIVE",
        academicStatus: isAcademicStatus(item.academicStatus) ? item.academicStatus : "UNDETERMINED",
        joinedAt: item.createdAt,
      }
    }),
  }
}

/**
 * v2 전체 회원 리스트 조회
 * GET /api/v2/admin/users
 */
export async function getAdminUserListV2(
  params: UserListParams
): Promise<UserListResponse> {
  const query: Record<string, string | number | undefined> = {
    page: params.page ?? 0,
    size: params.size ?? 10,
    keyword: params.keyword,
    department: params.department,
  }

  // v2는 상태 필드명을 state로 사용하고, "ALL" 값은 보내지 않음
  if (params.status && params.status !== "ALL") {
    query.state = params.status
  }

  // academicStatus도 "ALL"은 전송하지 않음
  if (params.academicStatus && params.academicStatus !== "ALL") {
    query.academicStatus = params.academicStatus
  }

  const res = await apiV2.get<ApiResponse<RawUserListResponseV2>>(
    "/admin/users",
    { params: query }
  )
  const data = unwrapV2(res) as RawUserListResponseV2
  return normalizeUserListResponseV2(data)
}

/**
 * v2 회원 상세 조회
 * GET /api/v2/admin/users/{userId}
 */
export async function getAdminUserDetailV2(
  userId: string
): Promise<UserDetail> {
  const res = await apiV2.get<ApiResponse<UserDetail>>(
    `/admin/users/${userId}`
  )
  const data = unwrapV2(res) as UserDetail
  return {
    ...data,
    department: data.department as Department,
  }
}
