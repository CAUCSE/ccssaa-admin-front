import { apiV2 } from "./client"
import { unwrapV2 } from "./response"
import type { ApiResponse } from "@/types/api-v2"
import type {
  NotificationLogCount,
  NotificationLogItem,
} from "@/types/notification"

export async function getNotificationLogsV2(
  isRead: boolean
): Promise<NotificationLogItem[]> {
  const res = await apiV2.get<ApiResponse<NotificationLogItem[]>>(
    "/notifications/log",
    { params: { isRead } }
  )
  const body = res.data as ApiResponse<NotificationLogItem[]>
  if (body && typeof body === "object" && !("data" in body)) {
    return []
  }
  return unwrapV2(res)
}

export async function getLatestNotificationV2(): Promise<NotificationLogItem | null> {
  const res = await apiV2.get<ApiResponse<NotificationLogItem | null>>(
    "/notifications/log/latest"
  )
  const body = res.data as ApiResponse<NotificationLogItem | null>
  if (body && typeof body === "object" && !("data" in body)) {
    return null
  }
  return unwrapV2(res)
}

export async function getUnreadNotificationCountV2(): Promise<NotificationLogCount> {
  const res = await apiV2.get<ApiResponse<NotificationLogCount>>(
    "/notifications/log/count"
  )
  return unwrapV2(res)
}

export async function markNotificationReadV2(id: string): Promise<void> {
  const res = await apiV2.patch<ApiResponse<Record<string, never>>>(
    `/notifications/log/${encodeURIComponent(id)}/read`
  )
  unwrapV2(res)
}
