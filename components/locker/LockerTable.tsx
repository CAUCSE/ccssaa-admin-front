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
import type { Locker, LockerUsageStatus } from "@/types/locker"
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
  onAssignClick?: (locker: Locker) => void
  onExtendClick?: (locker: Locker) => void
  onRevokeClick?: (locker: Locker) => void
  onCleanupClick?: (locker: Locker) => void
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
  onAssignClick,
  onExtendClick,
  onRevokeClick,
  onCleanupClick,
}: LockerTableProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, "0")}.${String(date.getDate()).padStart(2, "0")}`
  }

  const getUsageStatus = (locker: Locker): LockerUsageStatus => {
    if (locker.status === "DISABLED") return "EMPTY" // 비활성은 액션 없음으로만 구분
    if (!locker.currentUserId) return "EMPTY"
    if (locker.expiredAt) {
      const t = new Date(locker.expiredAt).getTime()
      if (!Number.isNaN(t) && t < Date.now()) return "EXPIRED"
    }
    return "IN_USE"
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
              <TableHead className="text-center w-[140px]">위치</TableHead>
              <TableHead className="text-center w-[80px]">번호</TableHead>
              <TableHead className="text-center w-[100px]">상태</TableHead>
              <TableHead className="text-center">사용자</TableHead>
              <TableHead className="text-center w-[140px]">만료일</TableHead>
              <TableHead className="text-center w-[180px]">액션</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((locker) => {
              const isDisabled = locker.status === "DISABLED"
              const usageStatus = getUsageStatus(locker)
              const statusBadge = isDisabled
                ? getStatusBadge("DISABLED")
                : usageStatus === "EMPTY"
                  ? getStatusBadge("AVAILABLE")
                  : usageStatus === "IN_USE"
                    ? getStatusBadge("IN_USE")
                    : getStatusBadge("INACTIVE")
              const statusLabel = isDisabled
                ? "비활성"
                : usageStatus === "EMPTY"
                  ? "비어있음"
                  : usageStatus === "IN_USE"
                    ? "사용중"
                    : "만료됨"
              return (
                <TableRow key={locker.id ?? `${locker.location ?? ""}-${locker.number}`}>
                  <TableCell className="text-center">
                    {locker.location || "-"}
                  </TableCell>
                  <TableCell className="text-center font-medium">
                    {locker.number}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant={statusBadge.variant}>
                      {statusLabel}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    {locker.currentUserName ? (
                      <div>
                        {locker.currentUserStudentNo
                          ? `${locker.currentUserName} (${locker.currentUserStudentNo})`
                          : locker.currentUserName}
                      </div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    {locker.expiredAt ? formatDate(locker.expiredAt) : "-"}
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-2">
                      {!isDisabled && usageStatus === "EMPTY" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onAssignClick?.(locker)}
                        >
                          배정
                        </Button>
                      )}
                      {!isDisabled && usageStatus === "IN_USE" && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onExtendClick?.(locker)}
                          >
                            연장
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => onRevokeClick?.(locker)}
                          >
                            회수
                          </Button>
                        </>
                      )}
                      {!isDisabled && usageStatus === "EXPIRED" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onCleanupClick?.(locker)}
                        >
                          정리
                        </Button>
                      )}
                    </div>
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
