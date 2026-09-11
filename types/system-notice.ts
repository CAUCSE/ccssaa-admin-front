/** 시스템 공지 API 타입 */
export interface SystemNotice {
  id: string
  title: string
  content: string
  authorName: string
  createdAt: string
}

/** 사용자용 최신 공지 조회 응답 */
export interface LatestSystemNotice extends SystemNotice {
  isRead: boolean
}

export interface SystemNoticeRequest {
  title: string
  content: string
}
