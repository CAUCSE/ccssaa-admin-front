/**
 * 홈 화면 이벤트 섹션 타입
 * (경조사 `types/event.ts`와는 별개의 도메인 — 백엔드 campus/event)
 */

/** GET /api/v2/admin/events 응답 항목 */
export interface HomeEvent {
  id: string
  title: string
  landingUrl: string
  isActive: boolean
  displayOrder: number
  createdAt: string
  updatedAt: string
}

/** POST / PUT /api/v2/admin/events 요청 body */
export interface HomeEventRequest {
  title: string
  landingUrl: string
  isActive: boolean
}
