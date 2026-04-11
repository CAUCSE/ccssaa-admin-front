import type { NotificationLogItem, NotificationNoticeType } from "@/types/notification"

export function formatNotificationCount(count: number | undefined) {
  if (!count || count <= 0) return null
  return count > 9 ? "9+" : String(count)
}

export function formatNotificationTime(value: string) {
  const now = Date.now()
  const createdAt = new Date(value).getTime()
  const diffMinutes = Math.max(1, Math.floor((now - createdAt) / (1000 * 60)))

  if (diffMinutes < 60) {
    return `${diffMinutes}분 전`
  }

  const diffHours = Math.floor(diffMinutes / 60)
  if (diffHours < 24) {
    return `${diffHours}시간 전`
  }

  const diffDays = Math.floor(diffHours / 24)
  if (diffDays < 7) {
    return `${diffDays}일 전`
  }

  return new Date(value).toLocaleDateString("ko-KR", {
    month: "2-digit",
    day: "2-digit",
  })
}

export function getNotificationTypeLabel(noticeType: NotificationNoticeType) {
  switch (noticeType) {
    case "CEREMONY_V2":
      return "경조사"
    case "COMMUNITY":
      return "커뮤니티"
    case "OFFICIAL":
      return "공식"
    case "SYSTEM":
      return "시스템"
    default:
      return "알림"
  }
}

export function getNotificationHref(item: NotificationLogItem) {
  switch (item.noticeType) {
    case "CEREMONY_V2":
      return item.targetId ? `/events/${item.targetId}` : "/events"
    case "COMMUNITY":
    case "OFFICIAL":
      return item.targetId ? `/content/${item.targetId}` : "/content"
    case "SYSTEM":
      return "/dashboard"
    default:
      return "/dashboard"
  }
}
