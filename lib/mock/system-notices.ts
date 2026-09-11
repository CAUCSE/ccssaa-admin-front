import type { LatestSystemNotice, SystemNotice, SystemNoticeRequest } from "@/types/system-notice"

let notices: SystemNotice[] = [{
  id: "system-notice-1",
  title: "서비스 이용 안내",
  content: "동네 관리자 서비스 이용에 관한 안내입니다.",
  authorName: "운영자",
  createdAt: "2026-08-25T12:00:00",
}]
let latestNoticeRead = false

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export const mockSystemNoticeApi = {
  async getLatest(): Promise<LatestSystemNotice | null> {
    await delay(200)
    const latestNotice = notices[0]
    return latestNotice ? { ...latestNotice, isRead: latestNoticeRead } : null
  },
  async getAll(): Promise<SystemNotice[]> {
    await delay(200)
    return notices.map((notice) => ({ ...notice }))
  },
  async markRead(id: string): Promise<void> {
    await delay(150)
    if (notices[0]?.id === id) latestNoticeRead = true
  },
  async create(data: SystemNoticeRequest): Promise<SystemNotice> {
    await delay(300)
    const notice: SystemNotice = {
      id: `system-notice-${Date.now()}`,
      ...data,
      authorName: "관리자",
      createdAt: new Date().toISOString(),
    }
    notices = [notice, ...notices]
    latestNoticeRead = false
    return { ...notice }
  },
  async update(id: string, data: SystemNoticeRequest): Promise<void> {
    await delay(300)
    notices = notices.map((notice) => notice.id === id ? { ...notice, ...data } : notice)
  },
  async remove(id: string): Promise<void> {
    await delay(300)
    notices = notices.filter((notice) => notice.id !== id)
    latestNoticeRead = false
  },
}
