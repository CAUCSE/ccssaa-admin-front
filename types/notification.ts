export type NotificationNoticeType =
  | "COMMUNITY"
  | "SYSTEM"
  | "OFFICIAL"
  | "CEREMONY_V2"

export interface NotificationLogItem {
  notificationLogId: string
  title: string
  body: string
  noticeType: NotificationNoticeType
  targetId: string | null
  targetParentId: string | null
  isRead: boolean
  createdAt: string
}

export interface NotificationLogCount {
  notificationLogCount: number
}
