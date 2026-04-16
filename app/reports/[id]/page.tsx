"use client"

import { useMemo, useState } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { PageHeader } from "@/components/layout/PageHeader"
import { ReportedPostsTable } from "@/components/report/ReportedPostsTable"
import { ReportedCommentsTable } from "@/components/report/ReportedCommentsTable"
import { useReportedUserComments, useReportedUserPosts } from "@/hooks/useReports"
import { ACADEMIC_STATUS_CONFIG, isAcademicStatus, isUserStatus } from "@/types/user"
import { getStatusBadge } from "@/lib/utils/status-badge"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ReportBanAction } from "@/components/report/ReportBanAction"

export default function ReportDetailPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const userId = String(params.id ?? "")
  const [postsPage, setPostsPage] = useState(1)
  const [commentsPage, setCommentsPage] = useState(1)

  const postsQuery = useReportedUserPosts(userId, {
    page: postsPage - 1,
    size: 10,
  })
  const commentsQuery = useReportedUserComments(userId, {
    page: commentsPage - 1,
    size: 10,
  })

  const summary = useMemo(() => {
    const academicStatusParam = searchParams.get("academicStatus")
    const userStateParam = searchParams.get("userState")
    const writerName =
      searchParams.get("name") ||
      postsQuery.data?.content[0]?.writerName ||
      commentsQuery.data?.content[0]?.writerName ||
      "신고 회원"
    const studentId =
      searchParams.get("studentId") ||
      postsQuery.data?.content[0]?.studentId ||
      commentsQuery.data?.content[0]?.studentId ||
      "—"

    const academicStatus =
      academicStatusParam && isAcademicStatus(academicStatusParam)
        ? academicStatusParam
        : undefined
    const userState =
      userStateParam && isUserStatus(userStateParam)
        ? userStateParam
        : postsQuery.data?.content[0]?.writerState ||
          commentsQuery.data?.content[0]?.writerState ||
          "ACTIVE"

    const reportedCount =
      Number(searchParams.get("reportedCount")) ||
      (postsQuery.data?.totalElements ?? 0) + (commentsQuery.data?.totalElements ?? 0)

    return {
      writerName,
      studentId,
      academicStatus,
      userState,
      reportedCount,
    }
  }, [commentsQuery.data, postsQuery.data, searchParams])

  const statusBadge = getStatusBadge(summary.userState)

  if (postsQuery.error || commentsQuery.error) {
    return (
      <div className="rounded-md border p-12 text-center">
        <p className="mb-4 text-destructive">신고 상세 정보를 불러오는 중 오류가 발생했습니다.</p>
        <Button variant="outline" onClick={() => router.push("/reports")}>
          목록으로 돌아가기
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${summary.writerName} 신고 상세`}
        description="신고된 게시글과 댓글 내역을 확인합니다."
        backHref="/reports"
        backLabel="신고 관리"
        breadcrumbs={[{ label: "신고 상세" }]}
      />

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">이름</p>
            <p className="mt-1 text-lg font-semibold">{summary.writerName}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">학번</p>
            <p className="mt-1 font-mono text-lg font-semibold">{summary.studentId}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">학적 상태</p>
            <p className="mt-1 text-lg font-semibold">
              {summary.academicStatus
                ? ACADEMIC_STATUS_CONFIG[summary.academicStatus]
                : "—"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">누적 신고 건수</p>
            <div className="mt-1 flex items-center justify-between gap-2">
              <p className="text-lg font-semibold">{summary.reportedCount}건</p>
              <Badge variant={statusBadge.variant}>{statusBadge.label}</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end gap-2">
        {summary.userState === "ACTIVE" && (
          <ReportBanAction
            userId={userId}
            userName={summary.writerName}
            buttonLabel="회원 추방"
            buttonSize="default"
          />
        )}
        <Button asChild variant="outline">
          <Link href={`/users/${userId}`}>회원 상세 보기</Link>
        </Button>
      </div>

      <ReportedPostsTable
        data={postsQuery.data?.content ?? []}
        currentPage={postsPage}
        totalPages={postsQuery.data?.totalPages ?? 1}
        totalElements={postsQuery.data?.totalElements ?? 0}
        pageSize={postsQuery.data?.size ?? 10}
        onPageChange={(nextPage) => {
          setPostsPage(nextPage)
          window.scrollTo({ top: 0, behavior: "smooth" })
        }}
        isLoading={postsQuery.isLoading}
      />

      <ReportedCommentsTable
        data={commentsQuery.data?.content ?? []}
        currentPage={commentsPage}
        totalPages={commentsQuery.data?.totalPages ?? 1}
        totalElements={commentsQuery.data?.totalElements ?? 0}
        pageSize={commentsQuery.data?.size ?? 10}
        onPageChange={(nextPage) => {
          setCommentsPage(nextPage)
          window.scrollTo({ top: 0, behavior: "smooth" })
        }}
        isLoading={commentsQuery.isLoading}
      />
    </div>
  )
}
