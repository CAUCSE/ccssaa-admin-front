"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { FinanceFilter } from "@/components/finance/FinanceFilter"
import { FinanceTable } from "@/components/finance/FinanceTable"
import { useFinanceRecords } from "@/hooks/useFinance"
import type { FinanceListParams, PaymentStatus } from "@/types/finance"
import { Skeleton } from "@/components/ui/skeleton"

function FinancePageContent() {
  const searchParams = useSearchParams()
  const [page, setPage] = useState(1)

  const params: FinanceListParams = {
    page: page - 1,
    size: 10,
    keyword: searchParams.get("keyword") || undefined,
    startDate: searchParams.get("startDate") || undefined,
    endDate: searchParams.get("endDate") || undefined,
    status: (searchParams.get("status") as PaymentStatus) || undefined,
  }

  const { data, isLoading, error } = useFinanceRecords(params)

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  useEffect(() => {
    setPage(1)
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
        <h1 className="text-2xl font-bold">재정 관리</h1>
        <p className="text-muted-foreground mt-1">
          학생회비 납부 내역을 확인하고 관리할 수 있습니다.
        </p>
      </div>

      <FinanceFilter />

      {data && (
        <FinanceTable
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

export default function FinancePage() {
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
      <FinancePageContent />
    </Suspense>
  )
}
