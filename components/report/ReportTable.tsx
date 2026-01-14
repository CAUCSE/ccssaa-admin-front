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
import type { Report } from "@/types/report"
import { ArrowRight } from "lucide-react"

interface ReportTableProps {
  data: Report[]
  currentPage: number
  totalPages: number
  totalElements: number
  pageSize: number
  onPageChange: (page: number) => void
  isLoading?: boolean
}

export function ReportTable({
  data,
  currentPage,
  totalPages,
  totalElements,
  pageSize,
  onPageChange,
  isLoading,
}: ReportTableProps) {
  const router = useRouter()

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, "0")}.${String(date.getDate()).padStart(2, "0")} ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`
  }

  const getTargetTypeLabel = (type: Report["targetType"]) => {
    switch (type) {
      case "POST":
        return "게시글"
      case "COMMENT":
        return "댓글"
      case "USER":
        return "유저"
      default:
        return type
    }
  }

  const getStatusBadgeVariant = (status: Report["status"]) => {
    return status === "UNRESOLVED" ? "warning" : "success"
  }

  const getStatusLabel = (status: Report["status"]) => {
    return status === "UNRESOLVED" ? "미처리" : "완료"
  }

  const startIndex = (currentPage - 1) * pageSize

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                {Array.from({ length: 6 }).map((_, i) => (
                  <TableHead key={i}>
                    <div className="h-4 w-20 bg-muted animate-pulse rounded" />
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 10 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 6 }).map((_, j) => (
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
        <p className="text-muted-foreground">조회된 신고가 없습니다.</p>
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
              <TableHead className="text-center">대상</TableHead>
              <TableHead className="text-left">사유</TableHead>
              <TableHead className="text-center">신고자</TableHead>
              <TableHead className="text-center">접수일</TableHead>
              <TableHead className="text-center">상태</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((report, index) => {
              const handleRowClick = (e: React.MouseEvent) => {
                e.preventDefault()
                e.stopPropagation()
                const reportPath = `/reports/${report.id}`
                console.log("Navigating to report detail:", reportPath, "report.id:", report.id)
                router.push(reportPath)
              }

              return (
                <TableRow
                  key={report.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={handleRowClick}
                >
                <TableCell className="text-center">
                  {startIndex + index + 1}
                </TableCell>
                <TableCell className="text-center">
                  {getTargetTypeLabel(report.targetType)}
                </TableCell>
                <TableCell className="text-left">
                  <span className="max-w-[300px] truncate block">
                    {report.reason}
                  </span>
                </TableCell>
                <TableCell className="text-center">
                  {report.reporter === "익명" ? "익명" : report.reporter}
                </TableCell>
                <TableCell className="text-center">
                  {formatDateTime(report.createdAt)}
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant={getStatusBadgeVariant(report.status)}>
                    {getStatusLabel(report.status)}
                  </Badge>
                </TableCell>
              </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
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
    </div>
  )
}

