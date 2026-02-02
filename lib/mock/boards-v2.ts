/**
 * v2 게시판 Mock API
 * NEXT_PUBLIC_USE_MOCK_API=true 시 사용
 */

import type {
  BoardAdminInfo,
  BoardDetailV2,
  BoardListItemV2,
  BoardCreateRequestV2,
  BoardReadScope,
  BoardSearchCondition,
  BoardWriteScope,
  BoardVisibility,
} from "@/types/board-v2"

let mockIdCounter = 5

/** adminUserIds를 BoardAdminInfo[]로 변환 (mock에서는 id만 있고 name/email은 빈 문자열) */
function adminUserIdsToAdmins(adminUserIds: string[]): BoardAdminInfo[] {
  return adminUserIds.map((id) => ({
    id,
    adminEmail: "",
    adminName: "",
  }))
}

const createMockBoard = (
  overrides: Partial<BoardDetailV2> & { name: string; description: string },
  admins: BoardAdminInfo[] = []
): BoardDetailV2 => {
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
    displayOrder: 0,
    admins: [],
    ...overrides,
    boardId: id,
    admins: overrides.admins ?? admins,
  }
}

// 가변 목록 (생성/수정/정렬 반영). 상세 조회 시 admins 반영을 위해 BoardDetailV2로 저장.
const mockBoards: BoardDetailV2[] = [
  {
    boardId: "1",
    name: "학생회 공지",
    description: "학생회 공지사항",
    isAnonymous: false,
    readScope: "BOTH",
    writeScope: "ONLY_ADMIN",
    isNotice: false,
    visibility: "VISIBLE",
    displayOrder: 0,
    admins: [],
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
    displayOrder: 1,
    admins: [],
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
    displayOrder: 2,
    admins: [],
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
    displayOrder: 3,
    admins: [],
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
    displayOrder: 4,
    admins: [],
  },
]

const delay = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms))

function applySearchCondition(
  list: BoardDetailV2[],
  condition?: BoardSearchCondition
): BoardDetailV2[] {
  if (!condition) return list
  return list.filter((b) => {
    if (
      condition.keyword != null &&
      condition.keyword.trim() !== "" &&
      !b.name.toLowerCase().includes(condition.keyword!.trim().toLowerCase())
    ) {
      return false
    }
    if (condition.isAnonymous != null && b.isAnonymous !== condition.isAnonymous)
      return false
    if (condition.writeScope != null && b.writeScope !== condition.writeScope)
      return false
    if (condition.readScope != null && b.readScope !== condition.readScope)
      return false
    if (condition.isNotice != null && b.isNotice !== condition.isNotice)
      return false
    return true
  })
}

export const mockBoardsV2Api = {
  getBoards: async (
    condition?: BoardSearchCondition
  ): Promise<BoardListItemV2[]> => {
    await delay(300)
    const sorted = [...mockBoards].sort(
      (a, b) => a.displayOrder - b.displayOrder
    )
    const filtered = applySearchCondition(sorted, condition)
    return filtered.map(({ admins: _admins, ...b }) => b as BoardListItemV2)
  },

  getBoard: async (boardId: string): Promise<BoardDetailV2 | null> => {
    await delay(200)
    const item = mockBoards.find((b) => b.boardId === boardId)
    if (!item) return null
    return { ...item }
  },

  createBoard: async (
    data: Omit<BoardCreateRequestV2, "boardId">
  ): Promise<unknown> => {
    await delay(400)
    const admins = adminUserIdsToAdmins(data.adminUserIds ?? [])
    const newBoard = createMockBoard(
      {
        name: data.name,
        description: data.description,
        isAnonymous: data.isAnonymous,
        readScope: data.readScope,
        writeScope: data.writeScope,
        isNotice: data.isNotice,
        visibility: data.visibility,
        displayOrder: mockBoards.length,
      },
      admins
    )
    mockBoards.push(newBoard)
    return newBoard
  },

  updateBoard: async (
    data: BoardCreateRequestV2 & { boardId: string }
  ): Promise<unknown> => {
    await delay(400)
    const idx = mockBoards.findIndex((b) => b.boardId === data.boardId)
    if (idx === -1) return {}
    const admins = adminUserIdsToAdmins(data.adminUserIds ?? [])
    mockBoards[idx] = {
      ...mockBoards[idx],
      name: data.name,
      description: data.description,
      isAnonymous: data.isAnonymous,
      readScope: data.readScope,
      writeScope: data.writeScope,
      isNotice: data.isNotice,
      visibility: data.visibility,
      admins,
    }
    return mockBoards[idx]
  },

  updateBoardOrders: async (boardIds: string[]): Promise<unknown> => {
    await delay(300)
    boardIds.forEach((id, index) => {
      const b = mockBoards.find((x) => x.boardId === id)
      if (b) b.displayOrder = index
    })
    mockBoards.sort((a, b) => a.displayOrder - b.displayOrder)
    return {}
  },

  deleteBoard: async (boardId: string): Promise<unknown> => {
    await delay(300)
    const idx = mockBoards.findIndex((b) => b.boardId === boardId)
    if (idx === -1) return {}
    mockBoards.splice(idx, 1)
    return {}
  },
}
