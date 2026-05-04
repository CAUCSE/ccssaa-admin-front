"use client"

import { useRouter } from "next/navigation"
import { ArrowRight } from "lucide-react"
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
import { getStatusBadge } from "@/lib/utils/status-badge"
import type { UserSummary, AcademicStatus } from "@/types/user"
import { ACADEMIC_STATUS_CONFIG, DEPARTMENT_CONFIG } from "@/types/user"

interface UserTableProps {
  data: UserSummary[]
  currentPage: number
  totalPages: number
  totalElements: number
  pageSize: number
  onPageChange: (page: number) => void
  isLoading?: boolean
}

export function UserTable({
  data,
  currentPage,
  totalPages,
  totalElements,
  pageSize,
  onPageChange,
  isLoading,
}: UserTableProps) {
  const router = useRouter()

  const getDepartmentLabel = (code: string) => {
    return DEPARTMENT_CONFIG[code as keyof typeof DEPARTMENT_CONFIG] ?? code
  }

  const getAcademicStatusLabel = (status: AcademicStatus) => {
    return ACADEMIC_STATUS_CONFIG[status] ?? ""
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
  }

  const startIndex = (currentPage - 1) * pageSize

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                {Array.from({ length: 10 }).map((_, i) => (
                  <TableHead key={i}>
                    <div className="h-4 w-20 animate-pulse rounded bg-muted" />
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 10 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 10 }).map((_, j) => (
                    <TableCell key={j}>
                      <div className="h-4 w-24 animate-pulse rounded bg-muted" />
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
        <p className="text-muted-foreground">조회된 회원이 없습니다.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground md:hidden">
        표가 길어 좌우로 스크롤할 수 있습니다.
      </p>
      <div className="rounded-md border">
        <Table className="min-w-[1100px]">
          <TableHeader>
            <TableRow>
              <TableHead className="w-16 text-center">No</TableHead>
              <TableHead className="text-center">학번</TableHead>
              <TableHead className="text-left">이름</TableHead>
              <TableHead className="text-left">이메일</TableHead>
              <TableHead className="text-center">입학년도</TableHead>
              <TableHead className="text-left">학과</TableHead>
              <TableHead className="text-center">상태</TableHead>
              <TableHead className="text-center">학적 상태</TableHead>
              <TableHead className="text-center">가입일</TableHead>
              <TableHead className="text-center">관리</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((user, index) => {
              const statusBadge = getStatusBadge(user.status)

              return (
                <TableRow
                  key={user.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => router.push(`/users/${user.id}`)}
                >
                  <TableCell className="text-center">
                    {startIndex + index + 1}
                  </TableCell>
                  <TableCell className="text-center font-mono">
                    {user.studentNo}
                  </TableCell>
                  <TableCell className="text-left font-medium">{user.name}</TableCell>
                  <TableCell className="max-w-[220px] text-left text-muted-foreground">
                    <span className="block truncate">{user.email}</span>
                  </TableCell>
                  <TableCell className="text-center">{user.admissionYear}</TableCell>
                  <TableCell className="text-left">{getDepartmentLabel(user.department)}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant={statusBadge.variant}>{statusBadge.label}</Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    {getAcademicStatusLabel(user.academicStatus)}
                  </TableCell>
                  <TableCell className="text-center text-muted-foreground">
                    {formatDate(user.createdAt)}
                  </TableCell>
                  <TableCell
                    className="text-center"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => router.push(`/users/${user.id}`)}
                    >
                      상세보기 <ArrowRight className="ml-1 h-4 w-4" />
                    </Button>
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
