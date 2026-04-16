import type {
  ReportedCommentListResponse,
  ReportedPostListResponse,
  ReportedUserContentParams,
  ReportedUserListParams,
  ReportedUserListResponse,
} from "@/types/report"
import { mockReportApi } from "../mock/reports"
import {
  getReportedUserCommentsV2,
  getReportedUserPostsV2,
  getReportedUsersV2,
} from "./v2/reports"

const USE_MOCK_API = process.env.NEXT_PUBLIC_USE_MOCK_API === "true"

const realReportApi = {
  getReportedUsers: (
    params: ReportedUserListParams
  ): Promise<ReportedUserListResponse> => getReportedUsersV2(params),

  getReportedUserPosts: (
    userId: string,
    params: ReportedUserContentParams
  ): Promise<ReportedPostListResponse> => getReportedUserPostsV2(userId, params),

  getReportedUserComments: (
    userId: string,
    params: ReportedUserContentParams
  ): Promise<ReportedCommentListResponse> =>
    getReportedUserCommentsV2(userId, params),
}

export const reportApi = USE_MOCK_API ? mockReportApi : realReportApi
