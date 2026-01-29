/**
 * v2 게시판 API 전용 타입
 * POST /api/v2/admin/boards (생성/수정)
 */

/** BoardReadScope — 읽기 권한 범위 */
export type BoardReadScope = "ENROLLED" | "GRADUATED" | "BOTH"
// ENROLLED: 재학생
// GRADUATED: 졸업생
// BOTH: 모두

/** BoardWriteScope — 쓰기 권한 범위 */
export type BoardWriteScope = "ALL_USER" | "ONLY_ADMIN"
// ALL_USER: 일반 유저 작성 가능
// ONLY_ADMIN: 게시판 관리자만 작성 가능

/** BoardVisibility — 노출 여부 */
export type BoardVisibility = "VISIBLE" | "HIDDEN"
// VISIBLE: 보임
// HIDDEN: 안 보임

/** v2 게시판 리스트 항목 — GET /api/v2/admin/boards 응답 항목 */
export interface BoardListItemV2 {
  /** 서버 부여 번호 (목록 순서용) */
  no?: number
  boardId: string
  name: string
  description: string
  isAnonymous: boolean
  readScope: BoardReadScope
  writeScope: BoardWriteScope
  isNotice: boolean
  visibility: BoardVisibility
  /** 표시 순서 (정렬용) */
  displayOrder: number
}

/** GET /api/v2/admin/boards 응답 data 페이로드 */
export interface BoardsListPayloadV2 {
  boards: BoardListItemV2[]
}

/** v2 게시판 생성/수정 요청 Body */
export interface BoardCreateRequestV2 {
  /** 수정 시 기존 boardId (생성 시 빈 문자열 또는 생략) */
  boardId?: string
  /** 게시판 제목 */
  name: string
  /** 게시판 설명 */
  description: string
  /** 게시판 관리자 id 배열 (uuid) */
  adminUserIds: string[]
  /** 익명 여부 */
  isAnonymous: boolean
  /** 읽기 권한 (BoardReadScope) */
  readScope: BoardReadScope
  /** 쓰기 권한 (BoardWriteScope) */
  writeScope: BoardWriteScope
  /** 알림 가능 게시판 여부 */
  isNotice: boolean
  /** 노출 여부 (BoardVisibility) */
  visibility: BoardVisibility
}
