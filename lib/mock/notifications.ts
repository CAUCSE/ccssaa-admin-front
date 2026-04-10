import type {
  NotificationLogCount,
  NotificationLogItem,
} from "@/types/notification"

const mockNotificationLogs: NotificationLogItem[] = [
  {
    notificationLogId: "notification-1",
    title: "경조사 신청이 접수되었습니다.",
    body: "김민수 회원의 경조사 신청이 접수되어 확인이 필요합니다.",
    noticeType: "CEREMONY_V2",
    targetId: "mock-ceremony-1",
    targetParentId: null,
    isRead: false,
    createdAt: "2026-04-10T08:45:00.000Z",
  },
  {
    notificationLogId: "notification-2",
    title: "커뮤니티 새 글 알림",
    body: "자유게시판에 새 글이 등록되었습니다.",
    noticeType: "COMMUNITY",
    targetId: "201",
    targetParentId: "board-community",
    isRead: false,
    createdAt: "2026-04-10T07:35:00.000Z",
  },
  {
    notificationLogId: "notification-3",
    title: "공지 게시글이 등록되었습니다.",
    body: "학생회 공지 게시판에 새 게시글이 등록되었습니다.",
    noticeType: "OFFICIAL",
    targetId: "301",
    targetParentId: "board-1",
    isRead: true,
    createdAt: "2026-04-09T12:20:00.000Z",
  },
  {
    notificationLogId: "notification-4",
    title: "시스템 점검 안내",
    body: "오늘 23시에 관리자 서비스 점검이 예정되어 있습니다.",
    noticeType: "SYSTEM",
    targetId: null,
    targetParentId: null,
    isRead: true,
    createdAt: "2026-04-08T05:40:00.000Z",
  },
]

function sortNotifications(items: NotificationLogItem[]) {
  return [...items].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )
}

export const mockNotificationApi = {
  getNotificationLogs: async (isRead: boolean): Promise<NotificationLogItem[]> => {
    await new Promise((resolve) => setTimeout(resolve, 200))
    return sortNotifications(
      mockNotificationLogs.filter((item) => item.isRead === isRead)
    )
  },

  getLatestNotification: async (): Promise<NotificationLogItem | null> => {
    await new Promise((resolve) => setTimeout(resolve, 150))
    return (
      sortNotifications(
        mockNotificationLogs.filter((item) => item.isRead === false)
      )[0] ?? null
    )
  },

  getUnreadNotificationCount: async (): Promise<NotificationLogCount> => {
    await new Promise((resolve) => setTimeout(resolve, 150))
    const unreadCount = mockNotificationLogs.filter((item) => !item.isRead).length
    return {
      notificationLogCount: unreadCount > 9 ? 10 : unreadCount,
    }
  },

  markNotificationRead: async (id: string): Promise<void> => {
    await new Promise((resolve) => setTimeout(resolve, 120))
    const notification = mockNotificationLogs.find(
      (item) => item.notificationLogId === id
    )
    if (notification) {
      notification.isRead = true
    }
  },
}
