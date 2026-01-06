import type {
  Post,
  PostListParams,
  PostListResponse,
  Board,
  Comment,
} from "@/types/post"

// Mock 게시판 데이터
const mockBoards: Board[] = [
  { id: 1, name: "학생회 공지", description: "학생회 공지사항", postCount: 15, createdAt: "2024-01-01T00:00:00Z" },
  { id: 2, name: "문화부 공지", description: "문화부 공지사항", postCount: 8, createdAt: "2024-01-01T00:00:00Z" },
  { id: 3, name: "학부 공지", description: "학부 공지사항", postCount: 12, createdAt: "2024-01-01T00:00:00Z" },
  { id: 4, name: "자유게시판", description: "자유로운 소통 공간", postCount: 45, createdAt: "2024-01-01T00:00:00Z" },
  { id: 5, name: "동문 게시판", description: "졸업생 소통 공간", postCount: 23, createdAt: "2024-01-01T00:00:00Z" },
]

// Mock 게시글 데이터 생성
const generateMockPosts = (): Post[] => {
  const titles = [
    "2025년 1학기 개강총회 안내",
    "학생회 임원 선거 공고",
    "문화부 행사 일정 안내",
    "학부 장학금 신청 안내",
    "동문회 모임 안내",
    "새로운 시설 이용 안내",
    "학생회비 납부 안내",
    "동아리 모집 공고",
    "졸업식 일정 안내",
    "학사 일정 변경 안내",
  ]

  const authors = ["이영희", "김철수", "박민수", "정수진", "최지훈", "한소영", "윤대현", "강미영"]
  const statuses: Post["status"][] = ["PUBLIC", "PUBLIC", "PUBLIC", "HIDDEN", "PUBLIC"]

  return Array.from({ length: 50 }, (_, i) => {
    const board = mockBoards[i % mockBoards.length]
    const createdAt = new Date()
    createdAt.setDate(createdAt.getDate() - Math.floor(Math.random() * 30))
    const updatedAt = new Date(createdAt.getTime() + Math.random() * 86400000)

    return {
      id: i + 1,
      title: titles[i % titles.length] + (i > titles.length ? ` (${Math.floor(i / titles.length) + 1})` : ""),
      content: `게시글 내용 ${i + 1}입니다. 상세 내용은 여기에 표시됩니다.`,
      author: authors[i % authors.length],
      authorId: i + 1,
      boardId: board.id,
      boardName: board.name,
      createdAt: createdAt.toISOString(),
      updatedAt: updatedAt.toISOString(),
      status: statuses[i % statuses.length],
      isPinned: i < 3, // 처음 3개는 고정
      attachments: i % 3 === 0 ? [`attachment-${i + 1}.pdf`] : undefined,
    }
  })
}

const mockPosts = generateMockPosts()

// Mock 댓글 데이터 생성
const generateMockComments = (postId: number): Comment[] => {
  const authors = ["사용자1", "사용자2", "사용자3"]
  return Array.from({ length: Math.floor(Math.random() * 5) + 1 }, (_, i) => {
    const createdAt = new Date()
    createdAt.setDate(createdAt.getDate() - Math.floor(Math.random() * 7))

    return {
      id: postId * 100 + i + 1,
      postId,
      content: `댓글 내용 ${i + 1}입니다.`,
      author: authors[i % authors.length],
      authorId: i + 1,
      createdAt: createdAt.toISOString(),
      updatedAt: createdAt.toISOString(),
      status: "PUBLIC" as Post["status"],
    }
  })
}

// Mock API 함수들
export const mockPostApi = {
  // 게시글 리스트 조회
  getPosts: async (params: PostListParams): Promise<PostListResponse> => {
    await new Promise((resolve) => setTimeout(resolve, 300 + Math.random() * 200))

    let filteredPosts = [...mockPosts]

    // 게시판 필터링
    if (params.boardId) {
      filteredPosts = filteredPosts.filter((post) => post.boardId === params.boardId)
    }

    // 키워드 필터링 (제목+내용)
    if (params.keyword) {
      const keyword = params.keyword.toLowerCase()
      filteredPosts = filteredPosts.filter(
        (post) =>
          post.title.toLowerCase().includes(keyword) ||
          post.content.toLowerCase().includes(keyword)
      )
    }

    // 작성자 필터링
    if (params.author) {
      filteredPosts = filteredPosts.filter((post) =>
        post.author.toLowerCase().includes(params.author!.toLowerCase())
      )
    }

    // 상태 필터링
    if (params.status) {
      filteredPosts = filteredPosts.filter((post) => post.status === params.status)
    }

    // 정렬 (최신순)
    filteredPosts.sort((a, b) => {
      // 고정 게시글 우선
      if (a.isPinned && !b.isPinned) return -1
      if (!a.isPinned && b.isPinned) return 1
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })

    // 페이지네이션
    const page = params.page || 0
    const size = params.size || 10
    const start = page * size
    const end = start + size
    const paginatedPosts = filteredPosts.slice(start, end)

    return {
      content: paginatedPosts,
      totalElements: filteredPosts.length,
      totalPages: Math.ceil(filteredPosts.length / size),
      size,
      number: page,
    }
  },

  // 게시글 상세 조회
  getPostDetail: async (postId: number): Promise<Post> => {
    await new Promise((resolve) => setTimeout(resolve, 300 + Math.random() * 200))

    const post = mockPosts.find((p) => p.id === postId)
    if (!post) {
      throw new Error("게시글을 찾을 수 없습니다.")
    }

    return post
  },

  // 게시판 목록 조회
  getBoards: async (): Promise<Board[]> => {
    await new Promise((resolve) => setTimeout(resolve, 200))
    return mockBoards
  },

  // 댓글 목록 조회
  getComments: async (postId: number): Promise<Comment[]> => {
    await new Promise((resolve) => setTimeout(resolve, 200))
    return generateMockComments(postId)
  },

  // 게시글 상태 변경
  updatePostStatus: async (postId: number, status: Post["status"]): Promise<void> => {
    await new Promise((resolve) => setTimeout(resolve, 300))
    const post = mockPosts.find((p) => p.id === postId)
    if (post) {
      post.status = status
    }
  },

  // 게시글 고정 토글
  togglePostPin: async (postId: number, isPinned: boolean): Promise<void> => {
    await new Promise((resolve) => setTimeout(resolve, 300))
    const post = mockPosts.find((p) => p.id === postId)
    if (post) {
      post.isPinned = isPinned
    }
  },

  // 댓글 삭제
  deleteComment: async (commentId: number): Promise<void> => {
    await new Promise((resolve) => setTimeout(resolve, 300))
    // Mock에서는 실제 삭제하지 않음
  },

  // 게시판 생성
  createBoard: async (data: { name: string; description: string }): Promise<Board> => {
    await new Promise((resolve) => setTimeout(resolve, 300))
    const newBoard: Board = {
      id: mockBoards.length + 1,
      name: data.name,
      description: data.description,
      postCount: 0,
      createdAt: new Date().toISOString(),
    }
    mockBoards.push(newBoard)
    return newBoard
  },

  // 게시판 수정
  updateBoard: async (boardId: number, data: { name: string; description: string }): Promise<Board> => {
    await new Promise((resolve) => setTimeout(resolve, 300))
    const board = mockBoards.find((b) => b.id === boardId)
    if (!board) {
      throw new Error("게시판을 찾을 수 없습니다.")
    }
    board.name = data.name
    board.description = data.description
    return board
  },

  // 게시판 삭제
  deleteBoard: async (boardId: number): Promise<void> => {
    await new Promise((resolve) => setTimeout(resolve, 300))
    const index = mockBoards.findIndex((b) => b.id === boardId)
    if (index === -1) {
      throw new Error("게시판을 찾을 수 없습니다.")
    }
    mockBoards.splice(index, 1)
  },
}

