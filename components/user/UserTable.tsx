"use client"

import { useState } from "react"
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
import { getStatusBadge } from "@/lib/utils/status-badge"
import type { UserSummary, AcademicStatus } from "@/types/user"
import { ACADEMIC_STATUS_CONFIG, DEPARTMENT_CONFIG } from "@/types/user"
import { ChevronUp, ChevronDown, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface UserTableProps {
  data: UserSummary[]
  currentPage: number
  totalPages: number
  totalElements: number
  pageSize: number
  onPageChange: (page: number) => void
  sortBy?: string
  sortOrder?: "asc" | "desc"
  onSort: (field: string) => void
  isLoading?: boolean
}

/**
 * UserTable 컴포넌트
 * 회원 목록을 테이블 형태로 표시하는 컴포넌트입니다.
 * 
 * 기능:
 * - 회원 목록 표시 (학번, 이름, 학과, 상태, 학적 상태)
 * - 정렬 기능 (학번, 이름, 학과, 상태, 학적 상태)
 * - 페이지네이션
 * - 로딩 상태 표시
 * - Empty State 처리
 * - 행 클릭 시 상세 페이지로 이동
 * 
 * @param data - 표시할 회원 데이터 배열
 * @param currentPage - 현재 페이지 번호
 * @param totalPages - 전체 페이지 수
 * @param totalElements - 전체 항목 수
 * @param pageSize - 페이지당 항목 수
 * @param onPageChange - 페이지 변경 핸들러
 * @param sortBy - 현재 정렬 필드
 * @param sortOrder - 정렬 순서 (asc/desc)
 * @param onSort - 정렬 핸들러
 * @param isLoading - 로딩 상태
 */
export function UserTable({
  data,
  currentPage,
  totalPages,
  totalElements,
  pageSize,
  onPageChange,
  sortBy,
  sortOrder,
  onSort,
  isLoading,
}: UserTableProps) {
  const router = useRouter()

  const getDepartmentLabel = (code: string) => {
    return DEPARTMENT_CONFIG[code as keyof typeof DEPARTMENT_CONFIG] ?? code
  }

  const getAcademicStatusLabel = (status: AcademicStatus) => {
    return ACADEMIC_STATUS_CONFIG[status] ?? ""
  }

  const getSortIcon = (field: string) => {
    if (sortBy !== field) {
      return null
    }
    return sortOrder === "asc" ? (
      <ChevronUp className="h-4 w-4" />
    ) : (
      <ChevronDown className="h-4 w-4" />
    )
  }

  const handleSort = (field: string) => {
    onSort(field)
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
        <p className="text-muted-foreground">조회된 회원이 없습니다.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-center w-16">
                No
              </TableHead>
              <TableHead className="text-center">
                <button
                  onClick={() => handleSort("studentNo")}
                  className="flex items-center justify-center gap-1 hover:text-foreground"
                >
                  학번
                  {getSortIcon("studentNo")}
                </button>
              </TableHead>
              <TableHead className="text-left">
                <button
                  onClick={() => handleSort("name")}
                  className="flex items-center gap-1 hover:text-foreground"
                >
                  이름
                  {getSortIcon("name")}
                </button>
              </TableHead>
              <TableHead className="text-left">
                <button
                  onClick={() => handleSort("department")}
                  className="flex items-center gap-1 hover:text-foreground"
                >
                  학과
                  {getSortIcon("department")}
                </button>
              </TableHead>
              <TableHead className="text-center">
                <button
                  onClick={() => handleSort("status")}
                  className="flex items-center justify-center gap-1 hover:text-foreground"
                >
                  상태
                  {getSortIcon("status")}
                </button>
              </TableHead>
              <TableHead className="text-center">
                <button
                  onClick={() => handleSort("academicStatus")}
                  className="flex items-center justify-center gap-1 hover:text-foreground"
                >
                  학적 상태
                  {getSortIcon("academicStatus")}
                </button>
              </TableHead>
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
                  <TableCell className="text-left">{user.name}</TableCell>
                  <TableCell className="text-left">{getDepartmentLabel(user.department)}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant={statusBadge.variant}>
                      {statusBadge.label}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    {getAcademicStatusLabel(user.academicStatus)}
                  </TableCell>
                  <TableCell className="text-center" onClick={(e) => e.stopPropagation()}>
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

      {/* Pagination */}
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

