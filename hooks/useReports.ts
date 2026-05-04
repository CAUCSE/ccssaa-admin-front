import { useQuery } from "@tanstack/react-query"
import { reportApi } from "@/lib/api/reports"
import type { ReportedUserContentParams, ReportedUserListParams } from "@/types/report"

export function useReportedUsers(params: ReportedUserListParams) {
  return useQuery({
    queryKey: ["reported-users", params],
    queryFn: () => reportApi.getReportedUsers(params),
  })
}

export function useReportedUserPosts(
  userId: string,
  params: ReportedUserContentParams
) {
  return useQuery({
    queryKey: ["reported-user-posts", userId, params],
    queryFn: () => reportApi.getReportedUserPosts(userId, params),
    enabled: Boolean(userId),
  })
}

export function useReportedUserComments(
  userId: string,
  params: ReportedUserContentParams
) {
  return useQuery({
    queryKey: ["reported-user-comments", userId, params],
    queryFn: () => reportApi.getReportedUserComments(userId, params),
    enabled: Boolean(userId),
  })
}
