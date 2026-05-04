"use client"

import { Suspense, useEffect, useMemo, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Skeleton } from "@/components/ui/skeleton"
import { DeletedUserFilter } from "@/components/user/DeletedUserFilter"
import { DeletedUserTable } from "@/components/user/DeletedUserTable"
import { useDeletedUsers } from "@/hooks/useUsers"
import {
  isAcademicStatus,
  type AcademicStatus,
  type DeletedUserListParams,
  type DeletedUserListSortBy,
  type Department,
} from "@/types/user"

function DeletedUsersPageContent() {
  const searchParams = useSearchParams()
  const [page, setPage] = useState(1)

  const params: DeletedUserListParams = useMemo(() => {
    const academicStatusParam = searchParams.get("academicStatus")
    const academicStatus =
      academicStatusParam && isAcademicStatus(academicStatusParam)
        ? academicStatusParam
        : undefined

    const admissionYearFrom = searchParams.get("admissionYearFrom")
    const admissionYearTo = searchParams.get("admissionYearTo")
    const sortBy =
      (searchParams.get("sortBy") as DeletedUserListSortBy | null) ??
      "DELETED_AT_DESC"

    return {
      page: page - 1,
      size: 10,
      keyword: searchParams.get("keyword") || undefined,
      department: (searchParams.get("department") as Department) || undefined,
      academicStatus: academicStatus as AcademicStatus | undefined,
      admissionYearFrom: admissionYearFrom ? Number(admissionYearFrom) : undefined,
      admissionYearTo: admissionYearTo ? Number(admissionYearTo) : undefined,
      sortBy,
    }
  }, [page, searchParams])

  const { data, isLoading, error } = useDeletedUsers(params)

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
        <h1 className="text-2xl font-bold mb-2">탈퇴/추방 회원 목록</h1>
        <p className="text-muted-foreground">
          삭제 처리된 회원만 조회합니다. 삭제일과 사유를 함께 확인할 수 있습니다.
        </p>
      </div>

      <DeletedUserFilter />

      {data && (
        <DeletedUserTable
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

export default function DeletedUsersPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-6">
          <div>
            <Skeleton className="h-8 w-56 mb-2" />
            <Skeleton className="h-4 w-80" />
          </div>
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      }
    >
      <DeletedUsersPageContent />
    </Suspense>
  )
}
