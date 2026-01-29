/**
 * v2 게시판 API
 * GET  /api/v2/admin/boards (리스트)
 * POST /api/v2/admin/boards (생성)
 * PUT  /api/v2/admin/boards (수정)
 * PATCH /api/v2/admin/boards/orders (정렬)
 */

import { apiV2 } from "./client"
import { unwrapV2 } from "./response"
import { mockBoardsV2Api } from "@/lib/mock/boards-v2"
import type { ApiResponse } from "@/types/api-v2"
import type {
  BoardCreateRequestV2,
  BoardListItemV2,
  BoardsListPayloadV2,
} from "@/types/board-v2"

const USE_MOCK_API = process.env.NEXT_PUBLIC_USE_MOCK_API === "true"

/** v2 게시판 리스트 — GET (응답 data.boards) */
export async function getBoardsV2(): Promise<BoardListItemV2[]> {
  if (USE_MOCK_API) return mockBoardsV2Api.getBoards()
  const res = await apiV2.get<ApiResponse<BoardsListPayloadV2>>("/admin/boards")
  const data = unwrapV2(res)
  return data?.boards ?? []
}

/** v2 게시판 생성 — POST, boardId 빈 문자열 */
export async function createBoardV2(
  data: Omit<BoardCreateRequestV2, "boardId"> & { boardId?: string }
): Promise<unknown> {
  if (USE_MOCK_API) return mockBoardsV2Api.createBoard(data)
  const body = { ...data, boardId: data.boardId ?? "" }
  const res = await apiV2.post<ApiResponse<unknown>>("/admin/boards", body)
  return unwrapV2(res)
}

/** v2 게시판 설정 수정 — PUT, boardId 필수 */
export async function updateBoardV2(
  data: BoardCreateRequestV2 & { boardId: string }
): Promise<unknown> {
  if (USE_MOCK_API) return mockBoardsV2Api.updateBoard(data)
  const res = await apiV2.put<ApiResponse<unknown>>("/admin/boards", data)
  return unwrapV2(res)
}

/** v2 게시판 정렬 수정 — PATCH, boardIds를 원하는 순서대로 나열 */
export async function updateBoardOrdersV2(boardIds: string[]): Promise<unknown> {
  if (USE_MOCK_API) return mockBoardsV2Api.updateBoardOrders(boardIds)
  const res = await apiV2.patch<ApiResponse<unknown>>("/admin/boards/orders", {
    boardIds,
  })
  return unwrapV2(res)
}
