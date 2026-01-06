"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { ReportFilter } from "@/components/report/ReportFilter"
import { ReportTable } from "@/components/report/ReportTable"
import { useReports } from "@/hooks/useReports"
import type { ReportListParams, ReportTargetType, ReportStatus } from "@/types/report"
import { Skeleton } from "@/components/ui/skeleton"

function ReportsPageContent() {
  const searchParams = useSearchParams()
  const [page, setPage] = useState(1)

  const params: ReportListParams = {
    page: page - 1, // API는 0-based
    size: 10,
    targetType:
      (searchParams.get("targetType") as ReportTargetType | "ALL") || undefined,
    status: (searchParams.get("status") as ReportStatus | "ALL") || undefined,
  }

  const { data, isLoading, error } = useReports(params)

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  useEffect(() => {
    setPage(1) // 필터 변경 시 첫 페이지로
  }, [searchParams])

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
        <h1 className="text-2xl font-bold mb-2">신고 관리</h1>
        <p className="text-muted-foreground">
          신고 내역을 확인하고 처리할 수 있습니다.
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
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-64 w-full" />
        </div>
      }
    >
      <ReportsPageContent />
    </Suspense>
  )
}

