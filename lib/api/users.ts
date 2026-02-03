import { api } from "../api"
import type {
  UserListParams,
  UserListResponse,
  UserDetail,
} from "@/types/user"
import { mockUserApi } from "../mock/users"

// 환경 변수로 Mock 모드 제어
const USE_MOCK_API = process.env.NEXT_PUBLIC_USE_MOCK_API === "true"

// 실제 API 함수들
const realUserApi = {
  // 회원 리스트 조회
  getUsers: async (params: UserListParams): Promise<UserListResponse> => {
    const response = await api.get<UserListResponse>("/admin/users", { params })
    return response.data
  },

  // 회원 상세 조회
  getUserDetail: async (userId: string): Promise<UserDetail> => {
    const response = await api.get<UserDetail>(`/admin/users/${userId}`)
    return response.data
  },

  // 회원 승인
  approveUser: async (userId: string): Promise<void> => {
    await api.post(`/admin/users/${userId}/approve`)
  },

  // 회원 거부
  rejectUser: async (userId: string): Promise<void> => {
    await api.post(`/admin/users/${userId}/reject`)
  },

  // 회원 추방
  banUser: async (userId: string): Promise<void> => {
    await api.post(`/admin/users/${userId}/ban`)
  },

  // 목록에서 삭제 (관리자)
  deleteUser: async (userId: string): Promise<void> => {
    await api.delete(`/admin/users/${userId}`)
  },

  // 추방 사용자 복구 (관리자)
  restoreUser: async (userId: string): Promise<void> => {
    await api.post(`/admin/users/${userId}/restore`)
  },

  // 역할 변경
  updateUserRole: async (
    userId: string,
    role: "USER" | "ADMIN" | "MASTER"
  ): Promise<void> => {
    await api.patch(`/admin/users/${userId}/role`, { role })
  },
}

// Mock 모드에 따라 API 선택
export const userApi = USE_MOCK_API ? mockUserApi : realUserApi

