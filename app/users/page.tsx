"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { UserFilter } from "@/components/user/UserFilter"
import { UserTable } from "@/components/user/UserTable"
import { useUsers } from "@/hooks/useUsers"
import type { UserListParams, UserStatus, AcademicStatus, Department } from "@/types/user"
import { Skeleton } from "@/components/ui/skeleton"

function UsersPageContent() {
  const searchParams = useSearchParams()
  const [page, setPage] = useState(1)
  const [sortBy, setSortBy] = useState<string>("")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")

  const params: UserListParams = {
    page: page - 1, // API는 0-based
    size: 10,
    keyword: searchParams.get("keyword") || undefined,
    department: (searchParams.get("department") as Department) || undefined,
    status: (searchParams.get("status") as UserStatus) || undefined,
    academicStatus: (searchParams.get("academicStatus") as AcademicStatus) || undefined,
  }

  const { data, isLoading, error } = useUsers(params)

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortBy(field)
      setSortOrder("asc")
    }
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
        <h1 className="text-2xl font-bold mb-2">전체 회원 목록</h1>
        <p className="text-muted-foreground">
          회원을 검색하고 관리할 수 있습니다.
        </p>
      </div>

      <UserFilter />

      {data && (
        <UserTable
          data={data.content}
          currentPage={page}
          totalPages={data.totalPages}
          totalElements={data.totalElements}
          pageSize={data.size}
          onPageChange={handlePageChange}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSort={handleSort}
          isLoading={isLoading}
        />
      )}
    </div>
  )
}

/**
 * 회원 목록 페이지
 * 전체 회원을 조회하고 관리할 수 있는 페이지입니다.
 * 
 * 기능:
 * - 회원 검색 (학번/이름, 학과, 상태)
 * - 회원 목록 표시 및 정렬
 * - 페이지네이션
 * - 회원 상세 페이지로 이동
 */
export default function UsersPage() {
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
      <UsersPageContent />
    </Suspense>
  )
}
