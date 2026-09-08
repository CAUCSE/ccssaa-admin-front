"use client"

import { Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"

import { PostFilter } from "@/components/content/PostFilter"
import { PostTable } from "@/components/content/PostTable"
import { Skeleton } from "@/components/ui/skeleton"
import { usePosts } from "@/hooks/usePosts"
import type { AdminPostListParams, PostAdminStatus, PostCategory } from "@/types/post"

function PostManagementContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const page = Math.max(Number(searchParams.get("page")) || 1, 1)
  const params: AdminPostListParams = {
    page: page - 1,
    size: 20,
    boardId: searchParams.get("boardId") ?? undefined,
    category: (searchParams.get("category") as PostCategory | null) ?? undefined,
    status: (searchParams.get("status") as PostAdminStatus | null) ?? undefined,
    keyword: searchParams.get("keyword") ?? undefined,
    writerKeyword: searchParams.get("writerKeyword") ?? undefined,
    sort: "createdAt,desc",
  }
  const { data, isLoading, error } = usePosts(params)

  const changePage = (nextPage: number) => {
    const next = new URLSearchParams(searchParams.toString())
    next.set("page", String(nextPage))
    router.push(`/content?${next.toString()}`)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return <div className="space-y-6">
    <div><h1 className="mb-2 text-2xl font-bold">게시물 관리</h1><p className="text-muted-foreground">전체 게시물을 검색하고 공개 상태와 카테고리를 관리합니다.</p></div>
    <PostFilter />
    {error ? <div className="rounded-md border p-12 text-center text-destructive">게시물을 불러오는 중 오류가 발생했습니다.</div> : <PostTable data={data?.content ?? []} currentPage={page} totalPages={data?.totalPages ?? 0} totalElements={data?.totalElements ?? 0} pageSize={data?.size ?? 20} onPageChange={changePage} isLoading={isLoading} />}
  </div>
}

export default function ContentPage() {
  return <Suspense fallback={<div className="space-y-6"><Skeleton className="h-16 w-72" /><Skeleton className="h-28 w-full" /><Skeleton className="h-96 w-full" /></div>}><PostManagementContent /></Suspense>
}
