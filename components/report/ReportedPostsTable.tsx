"use client"

import Link from "next/link"
import { ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { formatDateTime } from "@/lib/utils/datetime"
import type { ReportedPost } from "@/types/report"

interface ReportedPostsTableProps {
  data: ReportedPost[]
  currentPage: number
  totalPages: number
  totalElements: number
  pageSize: number
  onPageChange: (page: number) => void
  isLoading?: boolean
}

export function ReportedPostsTable({
  data,
  currentPage,
  totalPages,
  totalElements,
  pageSize,
  onPageChange,
  isLoading,
}: ReportedPostsTableProps) {
  const startIndex = (currentPage - 1) * pageSize

  return (
    <Card>
      <CardHeader>
        <CardTitle>신고된 게시글</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  {Array.from({ length: 6 }).map((_, index) => (
                    <TableHead key={index}>
                      <div className="h-4 w-20 animate-pulse rounded bg-muted" />
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.from({ length: 5 }).map((_, rowIndex) => (
                  <TableRow key={rowIndex}>
                    {Array.from({ length: 6 }).map((_, cellIndex) => (
                      <TableCell key={cellIndex}>
                        <div className="h-4 w-24 animate-pulse rounded bg-muted" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : data.length === 0 ? (
          <div className="rounded-md border p-10 text-center text-muted-foreground">
            신고된 게시글이 없습니다.
          </div>
        ) : (
          <>
            <div className="rounded-md border overflow-x-auto">
              <Table className="min-w-[920px]">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16 text-center">No</TableHead>
                    <TableHead className="text-left">게시글 제목</TableHead>
                    <TableHead className="text-center">게시판</TableHead>
                    <TableHead className="text-left">신고 사유</TableHead>
                    <TableHead className="text-center">신고일</TableHead>
                    <TableHead className="text-center">원문</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map((item, index) => (
                    <TableRow key={item.reportId}>
                      <TableCell className="text-center">{startIndex + index + 1}</TableCell>
                      <TableCell className="max-w-[280px] font-medium">
                        <span className="block truncate">{item.postTitle}</span>
                      </TableCell>
                      <TableCell className="text-center">{item.boardName}</TableCell>
                      <TableCell className="max-w-[280px]">
                        <span className="block truncate text-muted-foreground">
                          {item.reportReasonDescription}
                        </span>
                      </TableCell>
                      <TableCell className="text-center text-muted-foreground">
                        {formatDateTime(item.reportCreatedAt)}
                      </TableCell>
                      <TableCell className="text-center">
                        <Button asChild variant="ghost" size="sm">
                          <Link href={item.url} target="_blank" rel="noreferrer">
                            보기 <ExternalLink className="ml-1 h-4 w-4" />
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="flex flex-col items-center justify-center gap-4">
              <div className="text-sm text-muted-foreground">
                총 {totalElements}건 중 {startIndex + 1}-{Math.min(startIndex + pageSize, totalElements)}건 표시
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
          </>
        )}
      </CardContent>
    </Card>
  )
}
