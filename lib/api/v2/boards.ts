/**
 * v2 게시판 API
 * GET    /api/v2/admin/boards (리스트)
 * GET    /api/v2/admin/boards/{boardId} (상세)
 * POST   /api/v2/admin/boards (생성)
 * PUT    /api/v2/admin/boards/{boardId} (수정)
 * DELETE /api/v2/admin/boards/{boardId} (삭제)
 * PATCH  /api/v2/admin/boards/orders (정렬)
 */

import { apiV2 } from "./client"
import { unwrapV2 } from "./response"
import { mockBoardsV2Api } from "@/lib/mock/boards-v2"
import type { ApiResponse } from "@/types/api-v2"
import type {
  BoardCreateRequestV2,
  BoardDetailV2,
  BoardListItemV2,
  BoardSearchCondition,
  BoardsListPayloadV2,
} from "@/types/board-v2"

const USE_MOCK_API = process.env.NEXT_PUBLIC_USE_MOCK_API === "true"

/** v2 게시판 리스트 — GET (응답 data.boards), 검색 조건은 query params로 전달 */
export async function getBoardsV2(
  condition?: BoardSearchCondition
): Promise<BoardListItemV2[]> {
  if (USE_MOCK_API) return mockBoardsV2Api.getBoards(condition)
  const params: Record<string, string | boolean | undefined> = {}
  if (condition?.keyword != null && condition.keyword !== "")
    params.keyword = condition.keyword
  if (condition?.isAnonymous != null) params.isAnonymous = condition.isAnonymous
  if (condition?.writeScope != null) params.writeScope = condition.writeScope
  if (condition?.readScope != null) params.readScope = condition.readScope
  if (condition?.isNotice != null) params.isNotice = condition.isNotice
  const res = await apiV2.get<ApiResponse<BoardsListPayloadV2>>("/admin/boards", {
    params,
  })
  const data = unwrapV2(res)
  return data?.boards ?? []
}

/** v2 게시판 상세 — GET /api/v2/admin/boards/{boardId} */
export async function getBoardV2(boardId: string): Promise<BoardDetailV2 | null> {
  if (USE_MOCK_API) return mockBoardsV2Api.getBoard(boardId)
  const res = await apiV2.get<ApiResponse<BoardDetailV2>>(
    `/admin/boards/${encodeURIComponent(boardId)}`
  )
  const data = unwrapV2(res)
  return data ?? null
}

/** v2 게시판 생성 — POST /api/v2/admin/boards, body: name, description, adminUserIds, isAnonymous, readScope, writeScope, isNotice, visibility (boardId 없음) */
export async function createBoardV2(
  data: Omit<BoardCreateRequestV2, "boardId">
): Promise<unknown> {
  if (USE_MOCK_API) return mockBoardsV2Api.createBoard(data)
  const res = await apiV2.post<ApiResponse<unknown>>("/admin/boards", data)
  return unwrapV2(res)
}

/** v2 게시판 설정 수정 — PUT /api/v2/admin/boards/{boardId}, body: boardId, name, description, adminUserIds, isAnonymous, readScope, writeScope, isNotice, visibility */
export async function updateBoardV2(
  data: BoardCreateRequestV2 & { boardId: string }
): Promise<unknown> {
  if (USE_MOCK_API) return mockBoardsV2Api.updateBoard(data)
  const { boardId, ...body } = data
  const res = await apiV2.put<ApiResponse<unknown>>(
    `/admin/boards/${encodeURIComponent(boardId)}`,
    { boardId, ...body }
  )
  return unwrapV2(res)
}

/** v2 게시판 삭제 — DELETE /api/v2/admin/boards/{boardId} */
export async function deleteBoardV2(boardId: string): Promise<unknown> {
  if (USE_MOCK_API) return mockBoardsV2Api.deleteBoard(boardId)
  const res = await apiV2.delete<ApiResponse<unknown>>(
    `/admin/boards/${encodeURIComponent(boardId)}`
  )
  return unwrapV2(res)
}

/** v2 게시판 정렬 수정 — PATCH /api/v2/admin/boards/orders, body: { boardIds: string[] } (정렬 순서대로 id 나열) */
export async function updateBoardOrdersV2(boardIds: string[]): Promise<unknown> {
  if (USE_MOCK_API) return mockBoardsV2Api.updateBoardOrders(boardIds)
  const res = await apiV2.patch<ApiResponse<unknown>>("/admin/boards/orders", {
    boardIds,
  })
  return unwrapV2(res)
}
