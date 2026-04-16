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
  DeletedUserListParams,
  DeletedUserListResponse,
  DeletedUserListSortBy,
  Department,
  DeletedUserSummary,
  UserDetail,
  UserListParams,
  UserListResponse,
  UserListSortBy,
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
  email: string
  studentId: string
  admissionYear: number
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
  currentPage: number
  hasNext: boolean
  hasPrev: boolean
}

type RawDeletedUserSummaryV2 = {
  id: string
  name: string
  email: string
  studentId: string
  admissionYear: number
  department: string
  userState: string
  academicStatus: string
  deletedAt: string
  dropReason: string | null
}

type RawDeletedUserListResponseV2 = {
  content: RawDeletedUserSummaryV2[]
  totalElements: number
  totalPages: number
  size: number
  currentPage: number
  hasNext: boolean
  hasPrev: boolean
}


/** v2 리스트 응답을 기존 UserListResponse/UserSummary 타입으로 매핑 */
function normalizeUserListResponseV2(
  raw: RawUserListResponseV2
): UserListResponse {
  return {
    totalElements: raw.totalElements,
    totalPages: raw.totalPages,
    size: raw.size,
    currentPage: raw.currentPage,
    hasNext: raw.hasNext,
    hasPrev: raw.hasPrev,
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
        email: item.email,
        admissionYear: item.admissionYear,
        department: item.department as Department,
        status: isUserStatus(item.state) ? item.state : "ACTIVE",
        academicStatus: isAcademicStatus(item.academicStatus) ? item.academicStatus : "UNDETERMINED",
        createdAt: item.createdAt,
      }
    }),
  }
}

function normalizeDeletedUserListResponseV2(
  raw: RawDeletedUserListResponseV2
): DeletedUserListResponse {
  return {
    totalElements: raw.totalElements,
    totalPages: raw.totalPages,
    size: raw.size,
    currentPage: raw.currentPage,
    hasNext: raw.hasNext,
    hasPrev: raw.hasPrev,
    content: raw.content.map((item): DeletedUserSummary => ({
      id: item.id,
      name: item.name,
      email: item.email,
      studentNo: item.studentId,
      admissionYear: item.admissionYear,
      department: item.department as Department,
      userState: isUserStatus(item.userState) ? item.userState : "DROP",
      academicStatus: isAcademicStatus(item.academicStatus)
        ? item.academicStatus
        : "UNDETERMINED",
      deletedAt: item.deletedAt,
      dropReason: item.dropReason,
    })),
  }
}

function appendQueryParam(
  query: URLSearchParams,
  key: string,
  value: string | number | undefined
) {
  if (value == null || value === "") {
    return
  }
  query.append(key, String(value))
}

/**
 * v2 전체 회원 리스트 조회
 * GET /api/v2/admin/users
 */
export async function getAdminUserListV2(
  params: UserListParams
): Promise<UserListResponse> {
  const query = new URLSearchParams()
  appendQueryParam(query, "page", params.page ?? 0)
  appendQueryParam(query, "size", params.size ?? 10)
  appendQueryParam(query, "keyword", params.keyword)
  appendQueryParam(query, "department", params.department)
  appendQueryParam(query, "admissionYearFrom", params.admissionYearFrom)
  appendQueryParam(query, "admissionYearTo", params.admissionYearTo)
  appendQueryParam(
    query,
    "sortBy",
    params.sortBy ?? ("CREATED_AT_DESC" satisfies UserListSortBy)
  )

  if (params.academicStatus && params.academicStatus !== "ALL") {
    appendQueryParam(query, "academicStatus", params.academicStatus)
  }

  const normalizedStates = params.states?.length ? params.states : ["ACTIVE"]
  normalizedStates.forEach((state) => {
    appendQueryParam(query, "states", state)
  })

  const res = await apiV2.get<ApiResponse<RawUserListResponseV2>>(
    "/admin/users",
    { params: query }
  )
  const data = unwrapV2(res) as RawUserListResponseV2
  return normalizeUserListResponseV2(data)
}

/**
 * v2 탈퇴/추방 회원 리스트 조회
 * GET /api/v2/admin/users/deleted
 */
export async function getDeletedUsersV2(
  params: DeletedUserListParams
): Promise<DeletedUserListResponse> {
  const query = new URLSearchParams()
  appendQueryParam(query, "page", params.page ?? 0)
  appendQueryParam(query, "size", params.size ?? 10)
  appendQueryParam(query, "keyword", params.keyword)
  appendQueryParam(query, "department", params.department)
  appendQueryParam(query, "admissionYearFrom", params.admissionYearFrom)
  appendQueryParam(query, "admissionYearTo", params.admissionYearTo)
  appendQueryParam(
    query,
    "sortBy",
    params.sortBy ?? ("DELETED_AT_DESC" satisfies DeletedUserListSortBy)
  )

  if (params.academicStatus && params.academicStatus !== "ALL") {
    appendQueryParam(query, "academicStatus", params.academicStatus)
  }

  const res = await apiV2.get<ApiResponse<RawDeletedUserListResponseV2>>(
    "/admin/users/deleted",
    { params: query }
  )
  const data = unwrapV2(res) as RawDeletedUserListResponseV2
  return normalizeDeletedUserListResponseV2(data)
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
