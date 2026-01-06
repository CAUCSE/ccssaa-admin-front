import { api } from "../api"
import type {
  Post,
  PostListParams,
  PostListResponse,
  Board,
  Comment,
  PostStatus,
} from "@/types/post"
import { mockPostApi } from "../mock/posts"

// 환경 변수로 Mock 모드 제어
const USE_MOCK_API = process.env.NEXT_PUBLIC_USE_MOCK_API === "true"

// 실제 API 함수들
const realPostApi = {
  // 게시글 리스트 조회
  getPosts: async (params: PostListParams): Promise<PostListResponse> => {
    const response = await api.get<PostListResponse>("/admin/posts", { params })
    return response.data
  },

  // 게시글 상세 조회
  getPostDetail: async (postId: number): Promise<Post> => {
    const response = await api.get<Post>(`/admin/posts/${postId}`)
    return response.data
  },

  // 게시판 목록 조회
  getBoards: async (): Promise<Board[]> => {
    const response = await api.get<Board[]>("/admin/boards")
    return response.data
  },

  // 댓글 목록 조회
  getComments: async (postId: number): Promise<Comment[]> => {
    const response = await api.get<Comment[]>(`/admin/posts/${postId}/comments`)
    return response.data
  },

  // 게시글 상태 변경
  updatePostStatus: async (postId: number, status: PostStatus): Promise<void> => {
    await api.patch(`/admin/posts/${postId}/status`, { status })
  },

  // 게시글 고정 토글
  togglePostPin: async (postId: number, isPinned: boolean): Promise<void> => {
    await api.patch(`/admin/posts/${postId}/pin`, { isPinned })
  },

  // 댓글 삭제
  deleteComment: async (commentId: number): Promise<void> => {
    await api.delete(`/admin/comments/${commentId}`)
  },

  // 게시판 생성
  createBoard: async (data: { name: string; description: string }): Promise<Board> => {
    const response = await api.post<Board>("/admin/boards", data)
    return response.data
  },

  // 게시판 수정
  updateBoard: async (boardId: number, data: { name: string; description: string }): Promise<Board> => {
    const response = await api.patch<Board>(`/admin/boards/${boardId}`, data)
    return response.data
  },

  // 게시판 삭제
  deleteBoard: async (boardId: number): Promise<void> => {
    await api.delete(`/admin/boards/${boardId}`)
  },
}

// Mock 모드에 따라 API 선택
export const postApi = USE_MOCK_API ? mockPostApi : realPostApi

