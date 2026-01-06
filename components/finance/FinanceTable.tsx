"use client"

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
import type { FinanceRecord } from "@/types/finance"
import { ArrowRight } from "lucide-react"

interface FinanceTableProps {
  data: FinanceRecord[]
  currentPage: number
  totalPages: number
  totalElements: number
  pageSize: number
  onPageChange: (page: number) => void
  isLoading?: boolean
}

export function FinanceTable({
  data,
  currentPage,
  totalPages,
  totalElements,
  pageSize,
  onPageChange,
  isLoading,
}: FinanceTableProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, "0")}.${String(date.getDate()).padStart(2, "0")}`
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("ko-KR", {
      style: "currency",
      currency: "KRW",
    }).format(amount)
  }

  const getStatusBadgeVariant = (status: FinanceRecord["status"]) => {
    switch (status) {
      case "PAID":
        return "success"
      case "PENDING":
        return "warning"
      case "OVERDUE":
        return "danger"
      default:
        return "neutral"
    }
  }

  const getStatusLabel = (status: FinanceRecord["status"]) => {
    switch (status) {
      case "PAID":
        return "납부완료"
      case "PENDING":
        return "대기"
      case "OVERDUE":
        return "연체"
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
        <p className="text-muted-foreground">조회된 납부 내역이 없습니다.</p>
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
              <TableHead className="text-center">이름</TableHead>
              <TableHead className="text-center">학번</TableHead>
              <TableHead className="text-right">금액</TableHead>
              <TableHead className="text-center">납부일</TableHead>
              <TableHead className="text-center">마감일</TableHead>
              <TableHead className="text-center">상태</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((record, index) => (
              <TableRow key={record.id} className="hover:bg-muted/50">
                <TableCell className="text-center">
                  {startIndex + index + 1}
                </TableCell>
                <TableCell className="text-center">{record.userName}</TableCell>
                <TableCell className="text-center font-mono">
                  {record.userStudentNo}
                </TableCell>
                <TableCell className="text-right font-medium">
                  {formatCurrency(record.amount)}
                </TableCell>
                <TableCell className="text-center">
                  {record.paidAt ? formatDate(record.paidAt) : "-"}
                </TableCell>
                <TableCell className="text-center">
                  {formatDate(record.dueDate)}
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant={getStatusBadgeVariant(record.status)}>
                    {getStatusLabel(record.status)}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
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

