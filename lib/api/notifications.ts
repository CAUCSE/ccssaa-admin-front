import { mockNotificationApi } from "../mock/notifications"
import {
  getLatestNotificationV2,
  getNotificationLogsV2,
  getUnreadNotificationCountV2,
  markNotificationReadV2,
} from "./v2/notifications"

const USE_MOCK_API = process.env.NEXT_PUBLIC_USE_MOCK_API === "true"

const realNotificationApi = {
  getNotificationLogs: (isRead: boolean) => getNotificationLogsV2(isRead),
  getLatestNotification: () => getLatestNotificationV2(),
  getUnreadNotificationCount: () => getUnreadNotificationCountV2(),
  markNotificationRead: (id: string) => markNotificationReadV2(id),
}

export const notificationApi = USE_MOCK_API
  ? mockNotificationApi
  : realNotificationApi
