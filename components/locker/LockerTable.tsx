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
import type { Locker } from "@/types/locker"
import { ArrowRight } from "lucide-react"
import { getStatusBadge } from "@/lib/utils/status-badge"

interface LockerTableProps {
  data: Locker[]
  currentPage: number
  totalPages: number
  totalElements: number
  pageSize: number
  onPageChange: (page: number) => void
  isLoading?: boolean
}

/**
 * LockerTable 컴포넌트
 * 사물함 목록을 테이블 형태로 표시하는 컴포넌트입니다.
 */
export function LockerTable({
  data,
  currentPage,
  totalPages,
  totalElements,
  pageSize,
  onPageChange,
  isLoading,
}: LockerTableProps) {
  const router = useRouter()

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, "0")}.${String(date.getDate()).padStart(2, "0")}`
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
                    <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 6 }).map((_, j) => (
                    <TableCell key={j}>
                      <div className="h-4 w-24 bg-gray-100 rounded animate-pulse" />
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
      <div className="rounded-md border">
        <div className="p-12 text-center text-gray-500">
          사물함 데이터가 없습니다.
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-center w-[80px]">번호</TableHead>
              <TableHead className="text-center">현재 사용자</TableHead>
              <TableHead className="text-center">이전 사용자</TableHead>
              <TableHead className="text-center w-[120px]">상태</TableHead>
              <TableHead className="text-center w-[120px]">배정일</TableHead>
              <TableHead className="text-center w-[100px]">관리</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((locker) => {
              const statusBadge = getStatusBadge(locker.status)
              return (
                <TableRow
                  key={locker.id}
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => router.push(`/lockers/${locker.id}`)}
                >
                  <TableCell className="text-center font-medium">
                    {locker.number}
                  </TableCell>
                  <TableCell className="text-center">
                    {locker.currentUserName && locker.currentUserStudentNo ? (
                      <div>
                        {locker.currentUserName} ({locker.currentUserStudentNo})
                      </div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    {locker.previousUserName && locker.previousUserStudentNo ? (
                      <div>
                        {locker.previousUserName} ({locker.previousUserStudentNo})
                      </div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant={statusBadge.variant}>
                      {statusBadge.label}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    {locker.assignedAt ? formatDate(locker.assignedAt) : "-"}
                  </TableCell>
                  <TableCell className="text-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        router.push(`/lockers/${locker.id}`)
                      }}
                    >
                      상세보기
                      <ArrowRight className="ml-1 h-4 w-4" />
                    </Button>
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
