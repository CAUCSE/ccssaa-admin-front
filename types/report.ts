import type { AcademicStatus, UserStatus } from "@/types/user"

export type ReportedUserListSortBy = string

export interface ReportedUserSummary {
  userId: string
  studentId: string
  name: string
  academicStatus: AcademicStatus
  reportedCount: number
  userState: UserStatus
}

export interface ReportedUserListParams {
  keyword?: string
  state?: UserStatus
  academicStatus?: AcademicStatus | "ALL"
  page?: number
  size?: number
  sort?: ReportedUserListSortBy
}

export interface ReportedUserListResponse {
  content: ReportedUserSummary[]
  currentPage: number
  size: number
  totalPages: number
  totalElements: number
  hasNext: boolean
  hasPrev: boolean
}

export interface ReportedUserContentParams {
  page?: number
  size?: number
}

export interface ReportedPost {
  reportId: string
  studentId: string
  postId: string
  postTitle: string
  writerName: string
  writerState: UserStatus
  reportReasonDescription: string
  reportCreatedAt: string
  boardName: string
  url: string
}

export interface ReportedPostListResponse {
  content: ReportedPost[]
  currentPage: number
  size: number
  totalPages: number
  totalElements: number
  hasNext: boolean
  hasPrev: boolean
}

export interface ReportedComment {
  reportId: string
  studentId: string
  commentId: string
  commentContent: string
  writerName: string
  writerState: UserStatus
  reportReasonDescription: string
  reportCreatedAt: string
  url: string
}

export interface ReportedCommentListResponse {
  content: ReportedComment[]
  currentPage: number
  size: number
  totalPages: number
  totalElements: number
  hasNext: boolean
  hasPrev: boolean
}
