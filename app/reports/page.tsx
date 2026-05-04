"use client"

import { Suspense, useEffect, useMemo, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Skeleton } from "@/components/ui/skeleton"
import { ReportFilter } from "@/components/report/ReportFilter"
import { ReportTable } from "@/components/report/ReportTable"
import { useReportedUsers } from "@/hooks/useReports"
import {
  isAcademicStatus,
  type AcademicStatus,
} from "@/types/user"
import type { ReportedUserListParams } from "@/types/report"

function ReportsPageContent() {
  const searchParams = useSearchParams()
  const [page, setPage] = useState(1)

  const params: ReportedUserListParams = useMemo(() => {
    const academicStatusParam = searchParams.get("academicStatus")
    const academicStatus =
      academicStatusParam && isAcademicStatus(academicStatusParam)
        ? academicStatusParam
        : undefined

    return {
      keyword: searchParams.get("keyword") || undefined,
      state: "ACTIVE",
      academicStatus: academicStatus as AcademicStatus | undefined,
      page: page - 1,
      size: 10,
      sort: searchParams.get("sort") || undefined,
    }
  }, [page, searchParams])

  const { data, isLoading, error } = useReportedUsers(params)

  useEffect(() => {
    setPage(1)
  }, [searchParams])

  const handlePageChange = (nextPage: number) => {
    setPage(nextPage)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  if (error) {
    return (
      <div className="rounded-md border p-12 text-center">
        <p className="text-destructive">데이터를 불러오는 중 오류가 발생했습니다.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">신고 회원 관리</h1>
        <p className="text-muted-foreground">
          신고된 ACTIVE 회원을 조회하고, 해당 회원의 신고된 게시글과 댓글을 상세 페이지에서 확인합니다.
        </p>
      </div>

      <ReportFilter />

      {data && (
        <ReportTable
          data={data.content}
          currentPage={page}
          totalPages={data.totalPages}
          totalElements={data.totalElements}
          pageSize={data.size}
          onPageChange={handlePageChange}
          isLoading={isLoading}
        />
      )}
    </div>
  )
}

export default function ReportsPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-6">
          <div>
            <Skeleton className="mb-2 h-8 w-48" />
            <Skeleton className="h-4 w-96" />
          </div>
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      }
    >
      <ReportsPageContent />
    </Suspense>
  )
}
