import { apiV2 } from "./client"
import { unwrapV2 } from "./response"
import type { ApiResponse } from "@/types/api-v2"
import type {
  ReportedComment,
  ReportedCommentListResponse,
  ReportedPost,
  ReportedPostListResponse,
  ReportedUserListParams,
  ReportedUserListResponse,
  ReportedUserSummary,
} from "@/types/report"
import { isAcademicStatus, isUserStatus, type AcademicStatus, type UserStatus } from "@/types/user"

type RawReportedUserSummary = {
  userId: string
  studentId: string
  name: string
  academicStatus: string
  reportedCount: number
  userState: string
}

type RawReportedUserListResponse = {
  content: RawReportedUserSummary[]
  currentPage: number
  size: number
  totalPages: number
  totalElements: number
  hasNext: boolean
  hasPrev: boolean
}

type RawReportedPost = {
  reportId: string
  studentId: string
  postId: string
  postTitle: string
  writerName: string
  writerState: string
  reportReasonDescription: string
  reportCreatedAt: string
  boardName: string
  url: string
}

type RawReportedPostListResponse = {
  content: RawReportedPost[]
  currentPage: number
  size: number
  totalPages: number
  totalElements: number
  hasNext: boolean
  hasPrev: boolean
}

type RawReportedComment = {
  reportId: string
  studentId: string
  commentId: string
  commentContent: string
  writerName: string
  writerState: string
  reportReasonDescription: string
  reportCreatedAt: string
  url: string
}

type RawReportedCommentListResponse = {
  content: RawReportedComment[]
  currentPage: number
  size: number
  totalPages: number
  totalElements: number
  hasNext: boolean
  hasPrev: boolean
}

function normalizeUserState(value: string): UserStatus {
  return isUserStatus(value) ? value : "ACTIVE"
}

function normalizeAcademicStatus(value: string): AcademicStatus {
  return isAcademicStatus(value) ? value : "UNDETERMINED"
}

function normalizeReportedUsers(
  raw: RawReportedUserListResponse
): ReportedUserListResponse {
  return {
    ...raw,
    content: raw.content.map(
      (item): ReportedUserSummary => ({
        userId: item.userId,
        studentId: item.studentId,
        name: item.name,
        academicStatus: normalizeAcademicStatus(item.academicStatus),
        reportedCount: item.reportedCount,
        userState: normalizeUserState(item.userState),
      })
    ),
  }
}

function normalizeReportedPosts(
  raw: RawReportedPostListResponse
): ReportedPostListResponse {
  return {
    ...raw,
    content: raw.content.map(
      (item): ReportedPost => ({
        reportId: item.reportId,
        studentId: item.studentId,
        postId: item.postId,
        postTitle: item.postTitle,
        writerName: item.writerName,
        writerState: normalizeUserState(item.writerState),
        reportReasonDescription: item.reportReasonDescription,
        reportCreatedAt: item.reportCreatedAt,
        boardName: item.boardName,
        url: item.url,
      })
    ),
  }
}

function normalizeReportedComments(
  raw: RawReportedCommentListResponse
): ReportedCommentListResponse {
  return {
    ...raw,
    content: raw.content.map(
      (item): ReportedComment => ({
        reportId: item.reportId,
        studentId: item.studentId,
        commentId: item.commentId,
        commentContent: item.commentContent,
        writerName: item.writerName,
        writerState: normalizeUserState(item.writerState),
        reportReasonDescription: item.reportReasonDescription,
        reportCreatedAt: item.reportCreatedAt,
        url: item.url,
      })
    ),
  }
}

export async function getReportedUsersV2(
  params: ReportedUserListParams
): Promise<ReportedUserListResponse> {
  const response = await apiV2.get<ApiResponse<RawReportedUserListResponse>>(
    "/admin/reports/users",
    {
      params: {
        keyword: params.keyword,
        state: params.state ?? "ACTIVE",
        academicStatus:
          params.academicStatus && params.academicStatus !== "ALL"
            ? params.academicStatus
            : undefined,
        page: params.page ?? 0,
        size: params.size ?? 10,
        sort: params.sort,
      },
    }
  )

  return normalizeReportedUsers(unwrapV2(response))
}

export async function getReportedUserPostsV2(
  userId: string,
  params: { page?: number; size?: number }
): Promise<ReportedPostListResponse> {
  const response = await apiV2.get<ApiResponse<RawReportedPostListResponse>>(
    `/admin/reports/users/${userId}/posts`,
    {
      params: {
        page: params.page ?? 0,
        size: params.size ?? 10,
      },
    }
  )

  return normalizeReportedPosts(unwrapV2(response))
}

export async function getReportedUserCommentsV2(
  userId: string,
  params: { page?: number; size?: number }
): Promise<ReportedCommentListResponse> {
  const response = await apiV2.get<ApiResponse<RawReportedCommentListResponse>>(
    `/admin/reports/users/${userId}/comments`,
    {
      params: {
        page: params.page ?? 0,
        size: params.size ?? 10,
      },
    }
  )

  return normalizeReportedComments(unwrapV2(response))
}
