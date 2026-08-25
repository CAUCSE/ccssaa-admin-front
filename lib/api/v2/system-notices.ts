import { apiV2 } from "./client"
import { unwrapV2 } from "./response"
import { mockSystemNoticeApi } from "@/lib/mock/system-notices"
import type { ApiResponse } from "@/types/api-v2"
import type { LatestSystemNotice, SystemNotice, SystemNoticeRequest } from "@/types/system-notice"

const USE_MOCK_API = process.env.NEXT_PUBLIC_USE_MOCK_API === "true"

export async function getLatestSystemNotice(): Promise<LatestSystemNotice | null> {
  if (USE_MOCK_API) return mockSystemNoticeApi.getLatest()
  const response = await apiV2.get<ApiResponse<LatestSystemNotice>>("/system-notices/latest")
  return unwrapV2(response) ?? null
}

export async function markSystemNoticeRead(postId: string): Promise<void> {
  if (USE_MOCK_API) return mockSystemNoticeApi.markRead(postId)
  const response = await apiV2.post<ApiResponse<void>>(
    `/system-notices/${encodeURIComponent(postId)}/read`
  )
  unwrapV2(response)
}

export async function getSystemNotices(): Promise<SystemNotice[]> {
  if (USE_MOCK_API) return mockSystemNoticeApi.getAll()
  const response = await apiV2.get<ApiResponse<SystemNotice[]>>("/admin/system-notices")
  return unwrapV2(response) ?? []
}

export async function createSystemNotice(data: SystemNoticeRequest): Promise<SystemNotice> {
  if (USE_MOCK_API) return mockSystemNoticeApi.create(data)
  const response = await apiV2.post<ApiResponse<SystemNotice>>("/admin/system-notices", data)
  return unwrapV2(response)
}

export async function updateSystemNotice(id: string, data: SystemNoticeRequest): Promise<void> {
  if (USE_MOCK_API) return mockSystemNoticeApi.update(id, data)
  const response = await apiV2.put<ApiResponse<void>>(`/admin/system-notices/${encodeURIComponent(id)}`, data)
  unwrapV2(response)
}

export async function deleteSystemNotice(id: string): Promise<void> {
  if (USE_MOCK_API) return mockSystemNoticeApi.remove(id)
  const response = await apiV2.delete<ApiResponse<void>>(`/admin/system-notices/${encodeURIComponent(id)}`)
  unwrapV2(response)
}
