import { api } from "../api"
import type { Role, Permission, Banner, DesignSettings } from "@/types/settings"
import type { ApiResponse } from "@/types/api-v2"
import { unwrapV2 } from "./v2/response"
import { mockSettingsApi } from "../mock/settings"

// 환경 변수로 Mock 모드 제어
const USE_MOCK_API = process.env.NEXT_PUBLIC_USE_MOCK_API === "true"

// 실제 API 함수들
const realSettingsApi = {
  // 역할 목록 조회
  getRoles: async (): Promise<Role[]> => {
    const response = await api.get<ApiResponse<Role[]>>("/admin/settings/roles")
    return unwrapV2(response)
  },

  // 역할 생성
  createRole: async (data: { name: string; description: string; permissions: string[] }): Promise<Role> => {
    const response = await api.post<ApiResponse<Role>>("/admin/settings/roles", data)
    return unwrapV2(response)
  },

  // 역할 수정
  updateRole: async (roleId: number, data: { name: string; description: string; permissions: string[] }): Promise<Role> => {
    const response = await api.patch<ApiResponse<Role>>(
      `/admin/settings/roles/${roleId}`,
      data
    )
    return unwrapV2(response)
  },

  // 역할 삭제
  deleteRole: async (roleId: number): Promise<void> => {
    await api.delete(`/admin/settings/roles/${roleId}`)
  },

  // 권한 목록 조회
  getPermissions: async (): Promise<Permission[]> => {
    const response = await api.get<ApiResponse<Permission[]>>(
      "/admin/settings/permissions"
    )
    return unwrapV2(response)
  },

  // 배너 목록 조회
  getBanners: async (): Promise<Banner[]> => {
    const response = await api.get<ApiResponse<Banner[]>>("/admin/settings/banners")
    return unwrapV2(response)
  },

  // 배너 생성
  createBanner: async (data: Omit<Banner, "id" | "createdAt">): Promise<Banner> => {
    const response = await api.post<ApiResponse<Banner>>(
      "/admin/settings/banners",
      data
    )
    return unwrapV2(response)
  },

  // 배너 수정
  updateBanner: async (bannerId: number, data: Partial<Banner>): Promise<Banner> => {
    const response = await api.patch<ApiResponse<Banner>>(
      `/admin/settings/banners/${bannerId}`,
      data
    )
    return unwrapV2(response)
  },

  // 배너 삭제
  deleteBanner: async (bannerId: number): Promise<void> => {
    await api.delete(`/admin/settings/banners/${bannerId}`)
  },

  // 디자인 설정 조회
  getDesignSettings: async (): Promise<DesignSettings> => {
    const response = await api.get<ApiResponse<DesignSettings>>(
      "/admin/settings/design"
    )
    return unwrapV2(response)
  },

  // 디자인 설정 업데이트
  updateDesignSettings: async (data: Partial<DesignSettings>): Promise<DesignSettings> => {
    const response = await api.patch<ApiResponse<DesignSettings>>(
      "/admin/settings/design",
      data
    )
    return unwrapV2(response)
  },
}

// Mock 모드에 따라 API 선택
export const settingsApi = USE_MOCK_API ? mockSettingsApi : realSettingsApi
