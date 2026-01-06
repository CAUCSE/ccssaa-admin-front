"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { PostFilter } from "@/components/content/PostFilter"
import { PostTable } from "@/components/content/PostTable"
import { usePosts } from "@/hooks/usePosts"
import type { PostListParams } from "@/types/post"

export default function ContentPage() {
  const searchParams = useSearchParams()
  const [page, setPage] = useState(1)

  const params: PostListParams = {
    page: page - 1, // API는 0-based
    size: 10,
    boardId: searchParams.get("boardId") ? parseInt(searchParams.get("boardId")!, 10) : undefined,
    keyword: searchParams.get("keyword") || undefined,
    author: searchParams.get("author") || undefined,
  }

  const { data, isLoading, error } = usePosts(params)

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
        <h1 className="text-2xl font-bold mb-2">게시판 관리</h1>
        <p className="text-muted-foreground">
          게시글을 검색하고 관리할 수 있습니다.
        </p>
      </div>

      <PostFilter />

      {data && (
        <PostTable
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

