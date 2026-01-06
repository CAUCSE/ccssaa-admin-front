export type PostStatus = "PUBLIC" | "HIDDEN" | "DELETED"
export type PostTargetType = "POST" | "COMMENT" | "USER"

export interface Post {
  id: number
  title: string
  content: string
  author: string
  authorId?: number
  boardId: number
  boardName: string
  createdAt: string
  updatedAt: string
  status: PostStatus
  isPinned?: boolean
  attachments?: string[]
}

export interface Comment {
  id: number
  postId: number
  content: string
  author: string
  authorId?: number
  createdAt: string
  updatedAt: string
  status: PostStatus
}

export interface Board {
  id: number
  name: string
  description: string
  postCount: number
  createdAt: string
}

export interface PostListParams {
  page?: number
  size?: number
  boardId?: number
  keyword?: string
  author?: string
  status?: PostStatus
}

export interface PostListResponse {
  content: Post[]
  totalElements: number
  totalPages: number
  size: number
  number: number
}

