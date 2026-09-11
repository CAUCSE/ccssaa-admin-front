"use client"

import { ArrowRight } from "lucide-react"
import { useRouter } from "next/navigation"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { getPostCategoryLabel, getPostStatusLabel, getPostWriterLabel } from "@/lib/utils/post-admin"
import type { AdminPostSummary } from "@/types/post"

interface PostTableProps {
  data: AdminPostSummary[]
  currentPage: number
  totalPages: number
  totalElements: number
  pageSize: number
  onPageChange: (page: number) => void
  isLoading?: boolean
}

const statusVariant = (status: AdminPostSummary["status"]) =>
  status === "VISIBLE" ? "success" : status === "DELETED" ? "danger" : "neutral"

export function PostTable({ data, currentPage, totalPages, totalElements, pageSize, onPageChange, isLoading }: PostTableProps) {
  const router = useRouter()
  const startIndex = (currentPage - 1) * pageSize

  if (isLoading) {
    return <div className="rounded-md border p-12 text-center text-muted-foreground">게시물을 불러오는 중입니다.</div>
  }
  if (data.length === 0) {
    return <div className="rounded-md border p-12 text-center text-muted-foreground">조건에 맞는 게시물이 없습니다.</div>
  }

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-md border">
        <Table>
          <TableHeader><TableRow>
            <TableHead className="w-16 text-center">No</TableHead><TableHead>게시판</TableHead><TableHead>제목</TableHead><TableHead>카테고리</TableHead><TableHead>작성자</TableHead><TableHead className="text-center">댓글</TableHead><TableHead className="text-center">조회</TableHead><TableHead className="text-center">작성일</TableHead><TableHead className="text-center">상태</TableHead><TableHead className="text-center">관리</TableHead>
          </TableRow></TableHeader>
          <TableBody>{data.map((post, index) => (
            <TableRow key={post.postId} className="cursor-pointer hover:bg-muted/50" onClick={() => router.push(`/content/${post.postId}`)}>
              <TableCell className="text-center">{totalElements - startIndex - index}</TableCell>
              <TableCell className="whitespace-nowrap">{post.boardName}</TableCell>
              <TableCell><div className="max-w-[320px]"><p className="truncate font-medium">{post.title || "제목 없음"}</p><p className="truncate text-xs text-muted-foreground">{post.contentPreview}</p></div></TableCell>
              <TableCell><Badge variant="outline">{getPostCategoryLabel(post.category)}</Badge></TableCell>
              <TableCell><span className="block max-w-[180px] truncate" title={getPostWriterLabel(post)}>{getPostWriterLabel(post)}</span></TableCell>
              <TableCell className="text-center">{post.commentCount}</TableCell>
              <TableCell className="text-center">{post.viewCount}</TableCell>
              <TableCell className="whitespace-nowrap text-center">{new Date(post.createdAt).toLocaleDateString("ko-KR")}</TableCell>
              <TableCell className="text-center"><Badge variant={statusVariant(post.status)}>{getPostStatusLabel(post.status)}</Badge></TableCell>
              <TableCell className="text-center" onClick={(event) => event.stopPropagation()}><Button variant="ghost" size="sm" onClick={() => router.push(`/content/${post.postId}`)}>상세 <ArrowRight className="ml-1 h-4 w-4" /></Button></TableCell>
            </TableRow>
          ))}</TableBody>
        </Table>
      </div>
      <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
        <p className="text-sm text-muted-foreground">총 {totalElements}개 중 {startIndex + 1}-{Math.min(startIndex + pageSize, totalElements)}개</p>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}>이전</Button>
          <span className="min-w-20 text-center text-sm">{currentPage} / {Math.max(totalPages, 1)}</span>
          <Button variant="outline" size="sm" onClick={() => onPageChange(currentPage + 1)} disabled={currentPage >= totalPages}>다음</Button>
        </div>
      </div>
    </div>
  )
}
