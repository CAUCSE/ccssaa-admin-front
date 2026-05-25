"use client"

import { useRouter } from "next/navigation"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ACADEMIC_STATUS_CONFIG } from "@/types/user"
import { getStatusBadge } from "@/lib/utils/status-badge"
import type { ReportedUserSummary } from "@/types/report"

interface ReportTableProps {
  data: ReportedUserSummary[]
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
  const startIndex = (currentPage - 1) * pageSize

  if (isLoading) {
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {Array.from({ length: 7 }).map((_, index) => (
                <TableHead key={index}>
                  <div className="h-4 w-20 animate-pulse rounded bg-muted" />
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 10 }).map((_, rowIndex) => (
              <TableRow key={rowIndex}>
                {Array.from({ length: 7 }).map((_, cellIndex) => (
                  <TableCell key={cellIndex}>
                    <div className="h-4 w-24 animate-pulse rounded bg-muted" />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="rounded-md border p-12 text-center">
        <p className="text-muted-foreground">조회된 신고 회원이 없습니다.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Mobile: card view */}
      <div className="block md:hidden space-y-3">
        {data.map((user, index) => {
          const statusBadge = getStatusBadge(user.userState)
          const href = `/reports/${user.userId}?name=${encodeURIComponent(user.name)}&studentId=${encodeURIComponent(user.studentId)}&academicStatus=${encodeURIComponent(user.academicStatus)}&reportedCount=${user.reportedCount}&userState=${encodeURIComponent(user.userState)}`
          return (
            <div
              key={user.userId}
              className="rounded-lg border bg-card p-4 cursor-pointer hover:bg-accent/50 transition-colors"
              onClick={() => router.push(href)}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <p className="font-semibold text-base">{user.name}</p>
                  <p className="text-sm text-muted-foreground">{user.studentId}</p>
                </div>
                <Badge variant={statusBadge.variant}>{statusBadge.label}</Badge>
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                <p className="text-muted-foreground">학적</p>
                <p>{ACADEMIC_STATUS_CONFIG[user.academicStatus]}</p>
                <p className="text-muted-foreground">신고 건수</p>
                <p className="font-semibold">{user.reportedCount}건</p>
              </div>
              <div className="mt-3">
                <Button variant="ghost" size="sm" className="w-full" onClick={(e) => { e.stopPropagation(); router.push(href); }}>
                  상세보기 <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Desktop: table view */}
      <div className="hidden md:block rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16 text-center">No</TableHead>
              <TableHead className="text-center">학번</TableHead>
              <TableHead className="text-left">이름</TableHead>
              <TableHead className="text-center">학적 상태</TableHead>
              <TableHead className="text-center">신고 건수</TableHead>
              <TableHead className="text-center">회원 상태</TableHead>
              <TableHead className="text-center">관리</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((user, index) => {
              const statusBadge = getStatusBadge(user.userState)
              const href = `/reports/${user.userId}?name=${encodeURIComponent(user.name)}&studentId=${encodeURIComponent(user.studentId)}&academicStatus=${encodeURIComponent(user.academicStatus)}&reportedCount=${user.reportedCount}&userState=${encodeURIComponent(user.userState)}`

              return (
                <TableRow
                  key={user.userId}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => router.push(href)}
                >
                  <TableCell className="text-center">{startIndex + index + 1}</TableCell>
                  <TableCell className="text-center font-mono">{user.studentId}</TableCell>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell className="text-center">
                    {ACADEMIC_STATUS_CONFIG[user.academicStatus]}
                  </TableCell>
                  <TableCell className="text-center font-semibold">
                    {user.reportedCount}건
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant={statusBadge.variant}>{statusBadge.label}</Badge>
                  </TableCell>
                  <TableCell
                    className="text-center"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <Button variant="ghost" size="sm" onClick={() => router.push(href)}>
                        상세보기 <ArrowRight className="ml-1 h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col items-center justify-center gap-4">
        <div className="text-sm text-muted-foreground">
          총 {totalElements}명 중 {startIndex + 1}-{Math.min(startIndex + pageSize, totalElements)}명 표시
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm" className="min-w-[40px] min-h-[40px]"
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
                  size="sm" className="min-w-[40px] min-h-[40px]"
                  onClick={() => onPageChange(pageNum)}
                >
                  {pageNum}
                </Button>
              )
            })}
          </div>
          <Button
            variant="outline"
            size="sm" className="min-w-[40px] min-h-[40px]"
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
