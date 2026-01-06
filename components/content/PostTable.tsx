"use client"

import { useRouter } from "next/navigation"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { Post } from "@/types/post"
import { ArrowRight } from "lucide-react"
import { getStatusBadge } from "@/lib/utils/status-badge"

interface PostTableProps {
  data: Post[]
  currentPage: number
  totalPages: number
  totalElements: number
  pageSize: number
  onPageChange: (page: number) => void
  isLoading?: boolean
}

export function PostTable({
  data,
  currentPage,
  totalPages,
  totalElements,
  pageSize,
  onPageChange,
  isLoading,
}: PostTableProps) {
  const router = useRouter()

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, "0")}.${String(date.getDate()).padStart(2, "0")}`
  }

  const getStatusBadgeVariant = (status: Post["status"]) => {
    switch (status) {
      case "PUBLIC":
        return "success"
      case "HIDDEN":
        return "neutral"
      case "DELETED":
        return "danger"
      default:
        return "neutral"
    }
  }

  const getStatusLabel = (status: Post["status"]) => {
    switch (status) {
      case "PUBLIC":
        return "공개"
      case "HIDDEN":
        return "숨김"
      case "DELETED":
        return "삭제"
      default:
        return status
    }
  }

  const startIndex = (currentPage - 1) * pageSize

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                {Array.from({ length: 7 }).map((_, i) => (
                  <TableHead key={i}>
                    <div className="h-4 w-20 bg-muted animate-pulse rounded" />
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 10 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 7 }).map((_, j) => (
                    <TableCell key={j}>
                      <div className="h-4 w-24 bg-muted animate-pulse rounded" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="rounded-md border p-12 text-center">
        <p className="text-muted-foreground">조회된 게시글이 없습니다.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-center w-16">No</TableHead>
              <TableHead className="text-center">게시판</TableHead>
              <TableHead className="text-left">제목</TableHead>
              <TableHead className="text-center">작성자</TableHead>
              <TableHead className="text-center">작성일</TableHead>
              <TableHead className="text-center">상태</TableHead>
              <TableHead className="text-center">관리</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((post, index) => (
              <TableRow
                key={post.id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => router.push(`/content/${post.id}`)}
              >
                <TableCell className="text-center">
                  {post.isPinned && "📌 "}
                  {startIndex + index + 1}
                </TableCell>
                <TableCell className="text-center">{post.boardName}</TableCell>
                <TableCell className="text-left">
                  <span className="max-w-[300px] truncate block">
                    {post.title}
                  </span>
                </TableCell>
                <TableCell className="text-center">{post.author}</TableCell>
                <TableCell className="text-center">
                  {formatDate(post.createdAt)}
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant={getStatusBadgeVariant(post.status)}>
                    {getStatusLabel(post.status)}
                  </Badge>
                </TableCell>
                <TableCell className="text-center" onClick={(e) => e.stopPropagation()}>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push(`/content/${post.id}`)}
                  >
                    상세보기 <ArrowRight className="ml-1 h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-sm text-muted-foreground">
          총 {totalElements}개 중 {startIndex + 1}-{Math.min(startIndex + pageSize, totalElements)}개 표시
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            이전
          </Button>
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum: number
              if (totalPages <= 5) {
                pageNum = i + 1
              } else if (currentPage <= 3) {
                pageNum = i + 1
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i
              } else {
                pageNum = currentPage - 2 + i
              }
              return (
                <Button
                  key={pageNum}
                  variant={currentPage === pageNum ? "default" : "outline"}
                  size="sm"
                  onClick={() => onPageChange(pageNum)}
                >
                  {pageNum}
                </Button>
              )
            })}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            다음
          </Button>
        </div>
      </div>
    </div>
  )
}

