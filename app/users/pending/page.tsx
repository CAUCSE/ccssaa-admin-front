"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { AdmissionFilter } from "@/components/admission/AdmissionFilter"
import { AdmissionTable } from "@/components/admission/AdmissionTable"
import { useAdmissions } from "@/hooks/useAdmissions"
import type { AdmissionListParams } from "@/types/admission"
import type { UserStatus } from "@/types/user"
import { Skeleton } from "@/components/ui/skeleton"

function PendingUsersPageContent() {
  const searchParams = useSearchParams()
  const [page, setPage] = useState(1)

  const params: AdmissionListParams = {
    page: page - 1,
    size: 10,
    keyword: searchParams.get("keyword") || undefined,
    userState: (searchParams.get("userState") as UserStatus) || undefined,
  }

  const { data, isLoading, error } = useAdmissions(params)

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
        <p className="text-destructive">
          데이터를 불러오는 중 오류가 발생했습니다.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">승인 대기 요청</h1>
        <p className="text-muted-foreground">
          회원가입 후 재학 인증 신청한 유저를 확인하고 승인 또는 거절할 수 있습니다.
        </p>
      </div>

      <AdmissionFilter />

      {isLoading && !data && (
        <AdmissionTable
          data={[]}
          currentPage={1}
          totalPages={0}
          totalElements={0}
          pageSize={10}
          onPageChange={() => {}}
          isLoading
        />
      )}

      {data && (
        <AdmissionTable
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

export default function PendingUsersPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-6">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      }
    >
      <PendingUsersPageContent />
    </Suspense>
  )
}
