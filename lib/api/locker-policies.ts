import { api } from "../api"
import type {
  LockerPolicy,
  LockerPolicyFormData,
  LockerPolicyListResponse,
} from "@/types/locker-policy"
import { mockLockerPolicyApi } from "../mock/locker-policies"

const USE_MOCK_API = process.env.NEXT_PUBLIC_USE_MOCK_API === "true"

const realApi = {
  getList: async (): Promise<LockerPolicyListResponse> => {
    const res = await api.get<LockerPolicyListResponse>("/admin/locker-policies")
    return res.data
  },

  getById: async (id: number): Promise<LockerPolicy | null> => {
    const res = await api.get<LockerPolicy>(`/admin/locker-policies/${id}`)
    return res.data ?? null
  },

  create: async (data: LockerPolicyFormData): Promise<LockerPolicy> => {
    const res = await api.post<LockerPolicy>("/admin/locker-policies", data)
    return res.data
  },

  update: async (id: number, data: LockerPolicyFormData): Promise<LockerPolicy> => {
    const res = await api.put<LockerPolicy>(`/admin/locker-policies/${id}`, data)
    return res.data
  },

  activate: async (id: number): Promise<void> => {
    await api.post(`/admin/locker-policies/${id}/activate`)
  },
}

export const lockerPolicyApi = USE_MOCK_API ? mockLockerPolicyApi : realApi
