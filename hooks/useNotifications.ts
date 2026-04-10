import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { notificationApi } from "@/lib/api/notifications"
import type { NotificationLogItem } from "@/types/notification"

export function useNotificationLogs(isRead: boolean) {
  return useQuery({
    queryKey: ["notifications", "log", isRead],
    queryFn: () => notificationApi.getNotificationLogs(isRead),
  })
}

export function useRecentNotificationFeed(limit = 8) {
  return useQuery({
    queryKey: ["notifications", "feed", limit],
    queryFn: async () => {
      const [unread, read] = await Promise.allSettled([
        notificationApi.getNotificationLogs(false),
        notificationApi.getNotificationLogs(true),
      ])

      const unreadItems = unread.status === "fulfilled" ? unread.value : []
      const readItems = read.status === "fulfilled" ? read.value : []

      return [...unreadItems, ...readItems]
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        .slice(0, limit)
    },
  })
}

export function useLatestNotification() {
  return useQuery({
    queryKey: ["notifications", "latest"],
    queryFn: () => notificationApi.getLatestNotification(),
  })
}

export function useUnreadNotificationCount() {
  return useQuery({
    queryKey: ["notifications", "count"],
    queryFn: () => notificationApi.getUnreadNotificationCount(),
  })
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => notificationApi.markNotificationRead(id),
    onSuccess: (_, id) => {
      const updateReadState = (items: NotificationLogItem[] | undefined) =>
        items?.map((item) =>
          item.notificationLogId === id ? { ...item, isRead: true } : item
        )

      queryClient.setQueryData<NotificationLogItem[]>(
        ["notifications", "log", false],
        (prev) => prev?.filter((item) => item.notificationLogId !== id) ?? []
      )
      queryClient.setQueryData<NotificationLogItem[]>(
        ["notifications", "log", true],
        (prev) => updateReadState(prev)
      )
      queryClient.setQueryData<NotificationLogItem[]>(
        ["notifications", "feed", 6],
        (prev) => updateReadState(prev)
      )
      queryClient.setQueryData<NotificationLogItem[]>(
        ["notifications", "feed", 8],
        (prev) => updateReadState(prev)
      )
      queryClient.invalidateQueries({ queryKey: ["notifications"] })
    },
  })
}
