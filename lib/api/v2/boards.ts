/**
 * v2 게시판 API
 * GET  /api/v2/admin/boards (리스트)
 * POST /api/v2/admin/boards (생성)
 * PUT  /api/v2/admin/boards (수정)
 * PATCH /api/v2/admin/boards/orders (정렬)
 */

import { apiV2 } from "./client"
import { mockBoardsV2Api } from "@/lib/mock/boards-v2"
import type { BoardCreateRequestV2, BoardListItemV2 } from "@/types/board-v2"

const USE_MOCK_API = process.env.NEXT_PUBLIC_USE_MOCK_API === "true"

/** v2 게시판 리스트 — GET */
export async function getBoardsV2(): Promise<BoardListItemV2[]> {
  if (USE_MOCK_API) return mockBoardsV2Api.getBoards()
  const { data } = await apiV2.get<BoardListItemV2[]>("/admin/boards")
  return data ?? []
}

/** v2 게시판 생성 — POST, boardId 빈 문자열 */
export async function createBoardV2(
  data: Omit<BoardCreateRequestV2, "boardId"> & { boardId?: string }
): Promise<unknown> {
  if (USE_MOCK_API) return mockBoardsV2Api.createBoard(data)
  const body = { ...data, boardId: data.boardId ?? "" }
  const { data: res } = await apiV2.post("/admin/boards", body)
  return res
}

/** v2 게시판 설정 수정 — PUT, boardId 필수 */
export async function updateBoardV2(
  data: BoardCreateRequestV2 & { boardId: string }
): Promise<unknown> {
  if (USE_MOCK_API) return mockBoardsV2Api.updateBoard(data)
  const { data: res } = await apiV2.put("/admin/boards", data)
  return res
}

/** v2 게시판 정렬 수정 — PATCH, boardIds를 원하는 순서대로 나열 */
export async function updateBoardOrdersV2(boardIds: string[]): Promise<unknown> {
  if (USE_MOCK_API) return mockBoardsV2Api.updateBoardOrders(boardIds)
  const { data: res } = await apiV2.patch("/admin/boards/orders", { boardIds })
  return res
}
