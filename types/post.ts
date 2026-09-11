export type PostAdminStatus = "VISIBLE" | "HIDDEN" | "DELETED"
export type CommentAdminStatus = "VISIBLE" | "DELETED"
export type PostCategory =
  | "RECRUIT"
  | "ACADEMIC"
  | "EVENT_LECTURE"
  | "EXTERNAL_ACTIVITY"
  | "RESEARCH"
  | "ETC"

export interface AdminPostSummary {
  postId: string
  title: string | null
  contentPreview: string
  category: PostCategory | null
  boardId: string
  boardName: string
  writerId: string
  writerName: string
  writerNickname: string
  isAnonymous: boolean
  status: PostAdminStatus
  commentCount: number
  likeCount: number
  viewCount: number
  createdAt: string
  updatedAt: string
}

export interface AdminPostDetail extends Omit<AdminPostSummary, "contentPreview"> {
  content: string
  isCrawled: boolean
  imageUrls: string[]
}

export interface AdminComment {
  commentId: string
  parentCommentId: string | null
  postId: string
  content: string
  status: CommentAdminStatus
  writerId: string
  writerName: string
  writerNickname: string
  isAnonymous: boolean
  createdAt: string
  updatedAt: string
  children: AdminComment[]
}

export interface PageResponse<T> {
  content: T[]
  currentPage: number
  size: number
  totalPages: number
  totalElements: number
  hasNext: boolean
  hasPrev: boolean
}

export interface AdminPostListParams {
  page?: number
  size?: number
  boardId?: string
  category?: PostCategory
  keyword?: string
  writerKeyword?: string
  status?: PostAdminStatus
  sort?: string
}
