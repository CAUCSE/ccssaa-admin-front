import { api } from "../api"
import type {
  LockerPolicy,
  LockerPolicyFormData,
  LockerPolicyListResponse,
} from "@/types/locker-policy"
import type { ApiResponse } from "@/types/api-v2"
import { unwrapV2 } from "./v2/response"
import { mockLockerPolicyApi } from "../mock/locker-policies"

const USE_MOCK_API = process.env.NEXT_PUBLIC_USE_MOCK_API === "true"

const realApi = {
  getList: async (): Promise<LockerPolicyListResponse> => {
    const res = await api.get<ApiResponse<LockerPolicyListResponse>>(
      "/admin/locker-policies"
    )
    return unwrapV2(res)
  },

  getById: async (id: number): Promise<LockerPolicy | null> => {
    const res = await api.get<ApiResponse<LockerPolicy>>(
      `/admin/locker-policies/${id}`
    )
    return unwrapV2(res) ?? null
  },

  create: async (data: LockerPolicyFormData): Promise<LockerPolicy> => {
    const res = await api.post<ApiResponse<LockerPolicy>>(
      "/admin/locker-policies",
      data
    )
    return unwrapV2(res)
  },

  update: async (id: number, data: LockerPolicyFormData): Promise<LockerPolicy> => {
    const res = await api.put<ApiResponse<LockerPolicy>>(
      `/admin/locker-policies/${id}`,
      data
    )
    return unwrapV2(res)
  },

  activate: async (id: number): Promise<void> => {
    await api.post(`/admin/locker-policies/${id}/activate`)
  },
}

export const lockerPolicyApi = USE_MOCK_API ? mockLockerPolicyApi : realApi
