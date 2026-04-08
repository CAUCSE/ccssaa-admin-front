import { api } from "../api"
import type {
  UserListParams,
  UserListResponse,
  UserDetail,
  UserRole,
  UserDropResult,
  UserRestoreResult,
  UserRoleUpdateResult,
} from "@/types/user"
import { mockUserApi } from "../mock/users"
import { getAdminUserListV2, getAdminUserDetailV2 } from "./v2/users"
import { apiV2 } from "./v2/client"
import { unwrapV2 } from "./v2/response"
import type { ApiResponse } from "@/types/api-v2"

// 환경 변수로 Mock 모드 제어
const USE_MOCK_API = process.env.NEXT_PUBLIC_USE_MOCK_API === "true"

// 실제 API 함수들
const realUserApi = {
  // 회원 리스트 조회 (v2)
  getUsers: (params: UserListParams): Promise<UserListResponse> =>
    getAdminUserListV2(params),

  // 회원 상세 조회 (v2)
  getUserDetail: (userId: string): Promise<UserDetail> =>
    getAdminUserDetailV2(userId),

  // 회원 승인
  approveUser: async (userId: string): Promise<void> => {
    await api.post(`/admin/users/${userId}/approve`)
  },

  // 회원 거부
  rejectUser: async (userId: string): Promise<void> => {
    await api.post(`/admin/users/${userId}/reject`)
  },

  // 회원 추방
  banUser: async ({
    userId,
    dropReason,
  }: {
    userId: string
    dropReason: string
  }): Promise<UserDropResult> => {
    const res = await apiV2.patch<ApiResponse<UserDropResult>>(
      `/admin/users/${userId}/drop`,
      { dropReason }
    )
    return unwrapV2(res)
  },

  // 추방 사용자 복구 (관리자)
  restoreUser: async (userId: string): Promise<UserRestoreResult> => {
    const res = await apiV2.patch<ApiResponse<UserRestoreResult>>(
      `/admin/users/${userId}/restore`
    )
    return unwrapV2(res)
  },

  // 역할 변경
  updateUserRole: async (
    userId: string,
    currentRole: UserRole,
    newRole: UserRole
  ): Promise<UserRoleUpdateResult> => {
    const res = await apiV2.patch<ApiResponse<UserRoleUpdateResult>>(
      `/admin/users/${userId}/role`,
      { currentRole, newRole }
    )
    return unwrapV2(res)
  },
}

// Mock 모드에 따라 API 선택
export const userApi = USE_MOCK_API ? mockUserApi : realUserApi

