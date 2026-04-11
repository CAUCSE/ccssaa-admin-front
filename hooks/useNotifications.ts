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
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["notifications"] })

      const previousUnread =
        queryClient.getQueryData<NotificationLogItem[]>([
          "notifications",
          "log",
          false,
        ]) ?? []
      const previousRead =
        queryClient.getQueryData<NotificationLogItem[]>([
          "notifications",
          "log",
          true,
        ]) ?? []
      const previousFeedEntries = queryClient
        .getQueryCache()
        .findAll({ queryKey: ["notifications", "feed"] })
        .map((query) => [
          query.queryKey,
          queryClient.getQueryData<NotificationLogItem[]>(query.queryKey),
        ] as const)

      const updateReadState = (items: NotificationLogItem[] | undefined) =>
        items?.map((item) =>
          item.notificationLogId === id ? { ...item, isRead: true } : item
        )
      const markedItem = previousUnread.find(
        (item) => item.notificationLogId === id
      )

      queryClient.setQueryData<NotificationLogItem[]>(
        ["notifications", "log", false],
        (prev) => prev?.filter((item) => item.notificationLogId !== id) ?? []
      )
      queryClient.setQueryData<NotificationLogItem[]>(
        ["notifications", "log", true],
        (prev) => {
          const next = updateReadState(prev) ?? []

          if (!markedItem) {
            return next
          }

          const alreadyExists = next.some(
            (item) => item.notificationLogId === markedItem.notificationLogId
          )

          return alreadyExists
            ? next
            : [{ ...markedItem, isRead: true }, ...next].sort(
                (a, b) =>
                  new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
              )
        }
      )

      queryClient
        .getQueryCache()
        .findAll({ queryKey: ["notifications", "feed"] })
        .forEach((query) => {
          queryClient.setQueryData<NotificationLogItem[]>(
            query.queryKey,
            (prev) => updateReadState(prev)
          )
        })

      return { previousUnread, previousRead, previousFeedEntries }
    },
    onError: (_error, _id, context) => {
      if (!context) {
        return
      }

      queryClient.setQueryData(
        ["notifications", "log", false],
        context.previousUnread
      )
      queryClient.setQueryData(
        ["notifications", "log", true],
        context.previousRead
      )

      context.previousFeedEntries.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data)
      })
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications", "count"] })
      queryClient.invalidateQueries({ queryKey: ["notifications", "latest"] })
    },
  })
}
