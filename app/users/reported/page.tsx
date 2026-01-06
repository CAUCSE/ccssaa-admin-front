"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { UserFilter } from "@/components/user/UserFilter"
import { UserTable } from "@/components/user/UserTable"
import { useUsers } from "@/hooks/useUsers"
import type { UserListParams, UserStatus } from "@/types/user"

export default function ReportedUsersPage() {
  const searchParams = useSearchParams()
  const [page, setPage] = useState(1)
  const [sortBy, setSortBy] = useState<string>("")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")

  // TODO: API에 신고 필터가 추가되면 적용
  // 현재는 기본 필터만 적용
  const params: UserListParams = {
    page: page - 1, // API는 0-based
    size: 10,
    keyword: searchParams.get("keyword") || undefined,
    department: searchParams.get("department") || undefined,
    status: (searchParams.get("status") as UserStatus) || undefined,
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
        <h1 className="text-2xl font-bold mb-2">신고된 회원</h1>
        <p className="text-muted-foreground">
          신고된 회원을 검색하고 관리할 수 있습니다.
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

