/**
 * v2 게시판 Mock API
 * NEXT_PUBLIC_USE_MOCK_API=true 시 사용
 */

import type {
  BoardListItemV2,
  BoardCreateRequestV2,
  BoardReadScope,
  BoardWriteScope,
  BoardVisibility,
} from "@/types/board-v2"

let mockIdCounter = 5

const createMockBoard = (
  overrides: Partial<BoardListItemV2> & { name: string; description: string }
): BoardListItemV2 => {
  const id = overrides.boardId ?? String(++mockIdCounter)
  return {
    boardId: id,
    name: overrides.name,
    description: overrides.description,
    isAnonymous: false,
    readScope: "BOTH" as BoardReadScope,
    writeScope: "ONLY_ADMIN" as BoardWriteScope,
    isNotice: false,
    visibility: "VISIBLE" as BoardVisibility,
    display_order: 0,
    ...overrides,
    boardId: id,
  }
}

// 가변 목록 (생성/수정/정렬 반영)
const mockBoards: BoardListItemV2[] = [
  {
    boardId: "1",
    name: "학생회 공지",
    description: "학생회 공지사항",
    isAnonymous: false,
    readScope: "BOTH",
    writeScope: "ONLY_ADMIN",
    isNotice: false,
    visibility: "VISIBLE",
    display_order: 0,
  },
  {
    boardId: "2",
    name: "문화부 공지",
    description: "문화부 공지사항",
    isAnonymous: false,
    readScope: "BOTH",
    writeScope: "ONLY_ADMIN",
    isNotice: false,
    visibility: "VISIBLE",
    display_order: 1,
  },
  {
    boardId: "3",
    name: "학부 공지",
    description: "학부 공지사항",
    isAnonymous: false,
    readScope: "BOTH",
    writeScope: "ONLY_ADMIN",
    isNotice: false,
    visibility: "VISIBLE",
    display_order: 2,
  },
  {
    boardId: "4",
    name: "자유게시판",
    description: "자유로운 소통 공간",
    isAnonymous: false,
    readScope: "BOTH",
    writeScope: "ONLY_ADMIN",
    isNotice: false,
    visibility: "VISIBLE",
    display_order: 3,
  },
  {
    boardId: "5",
    name: "동문 게시판",
    description: "졸업생 소통 공간",
    isAnonymous: false,
    readScope: "BOTH",
    writeScope: "ONLY_ADMIN",
    isNotice: false,
    visibility: "VISIBLE",
    display_order: 4,
  },
]

const delay = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms))

export const mockBoardsV2Api = {
  getBoards: async (): Promise<BoardListItemV2[]> => {
    await delay(300)
    return [...mockBoards].sort(
      (a, b) => (a.display_order ?? 0) - (b.display_order ?? 0)
    )
  },

  createBoard: async (
    data: Omit<BoardCreateRequestV2, "boardId"> & { boardId?: string }
  ): Promise<unknown> => {
    await delay(400)
    const newBoard = createMockBoard({
      name: data.name,
      description: data.description,
      isAnonymous: data.isAnonymous,
      readScope: data.readScope,
      writeScope: data.writeScope,
      isNotice: data.isNotice,
      visibility: data.visibility,
      display_order: mockBoards.length,
    })
    mockBoards.push(newBoard)
    return newBoard
  },

  updateBoard: async (
    data: BoardCreateRequestV2 & { boardId: string }
  ): Promise<unknown> => {
    await delay(400)
    const idx = mockBoards.findIndex((b) => b.boardId === data.boardId)
    if (idx === -1) return {}
    mockBoards[idx] = {
      ...mockBoards[idx],
      name: data.name,
      description: data.description,
      isAnonymous: data.isAnonymous,
      readScope: data.readScope,
      writeScope: data.writeScope,
      isNotice: data.isNotice,
      visibility: data.visibility,
    }
    return mockBoards[idx]
  },

  updateBoardOrders: async (boardIds: string[]): Promise<unknown> => {
    await delay(300)
    boardIds.forEach((id, index) => {
      const b = mockBoards.find((x) => x.boardId === id)
      if (b) b.display_order = index
    })
    mockBoards.sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0))
    return {}
  },
}
