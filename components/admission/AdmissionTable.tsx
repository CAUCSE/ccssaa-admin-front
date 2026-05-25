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
import { DEPARTMENT_CONFIG } from "@/types/user"
import type { AdmissionSummary } from "@/types/admission"
import { ChevronUp, ChevronDown, ArrowRight } from "lucide-react"

interface AdmissionTableProps {
  data: AdmissionSummary[]
  currentPage: number
  totalPages: number
  totalElements: number
  pageSize: number
  onPageChange: (page: number) => void
  isLoading?: boolean
}

export function AdmissionTable({
  data,
  currentPage,
  totalPages,
  totalElements,
  pageSize,
  onPageChange,
  isLoading,
}: AdmissionTableProps) {
  const router = useRouter()
  const [sortBy, setSortBy] = useState("")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortBy(field)
      setSortOrder("asc")
    }
  }

  const getSortIcon = (field: string) => {
    if (sortBy !== field) return null
    return sortOrder === "asc" ? (
      <ChevronUp className="h-4 w-4" />
    ) : (
      <ChevronDown className="h-4 w-4" />
    )
  }

  const startIndex = (currentPage - 1) * pageSize

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
  }

  if (isLoading) {
    return (
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
    )
  }

  if (data.length === 0) {
    return (
      <div className="rounded-md border p-12 text-center">
        <p className="text-muted-foreground">인증 신청 내역이 없습니다.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Mobile: card view */}
      <div className="block md:hidden space-y-3">
        {data.map((item, index) => {
          const statusBadge = getStatusBadge(item.userState)
          return (
            <div
              key={item.id}
              className="rounded-lg border bg-card p-4 cursor-pointer hover:bg-accent/50 transition-colors"
              onClick={() => router.push(`/users/pending/${item.id}`)}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <p className="font-semibold text-base">{item.userName}</p>
                  <p className="text-sm text-muted-foreground">{item.requestedStudentId}</p>
                </div>
                <Badge variant={statusBadge.variant}>{statusBadge.label}</Badge>
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                <p className="text-muted-foreground">학과</p>
                <p>{DEPARTMENT_CONFIG[item.requestedDepartment] ?? item.requestedDepartment}</p>
                <p className="text-muted-foreground">신청일</p>
                <p>{formatDate(item.createdAt)}</p>
              </div>
              <div className="mt-3">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full"
                  onClick={(e) => {
                    e.stopPropagation()
                    router.push(`/users/pending/${item.id}`)
                  }}
                >
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
              <TableHead className="text-center w-16">No</TableHead>
              <TableHead className="text-center">
                <button
                  onClick={() => handleSort("requestedStudentId")}
                  className="flex items-center justify-center gap-1 hover:text-foreground"
                >
                  학번
                  {getSortIcon("requestedStudentId")}
                </button>
              </TableHead>
              <TableHead className="text-left">
                <button
                  onClick={() => handleSort("userName")}
                  className="flex items-center gap-1 hover:text-foreground"
                >
                  이름
                  {getSortIcon("userName")}
                </button>
              </TableHead>
              <TableHead className="text-left">
                <button
                  onClick={() => handleSort("requestedDepartment")}
                  className="flex items-center gap-1 hover:text-foreground"
                >
                  학과
                  {getSortIcon("requestedDepartment")}
                </button>
              </TableHead>
              <TableHead className="text-center">
                <button
                  onClick={() => handleSort("userState")}
                  className="flex items-center justify-center gap-1 hover:text-foreground"
                >
                  상태
                  {getSortIcon("userState")}
                </button>
              </TableHead>
              <TableHead className="text-center">
                <button
                  onClick={() => handleSort("createdAt")}
                  className="flex items-center justify-center gap-1 hover:text-foreground"
                >
                  신청일
                  {getSortIcon("createdAt")}
                </button>
              </TableHead>
              <TableHead className="text-center">관리</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item, index) => {
              const statusBadge = getStatusBadge(item.userState)
              return (
                <TableRow
                  key={item.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => router.push(`/users/pending/${item.id}`)}
                >
                  <TableCell className="text-center">
                    {startIndex + index + 1}
                  </TableCell>
                  <TableCell className="text-center font-mono">
                    {item.requestedStudentId}
                  </TableCell>
                  <TableCell className="text-left">{item.userName}</TableCell>
                  <TableCell className="text-left">
                    {DEPARTMENT_CONFIG[item.requestedDepartment] ??
                      item.requestedDepartment}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant={statusBadge.variant}>
                      {statusBadge.label}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    {formatDate(item.createdAt)}
                  </TableCell>
                  <TableCell
                    className="text-center"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Button
                      variant="ghost"
                      size="sm" className="min-w-[40px] min-h-[40px]"
                      onClick={() => router.push(`/users/pending/${item.id}`)}
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
          총 {totalElements}건 중 {startIndex + 1}-
          {Math.min(startIndex + pageSize, totalElements)}건 표시
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
            disabled={currentPage === totalPages || totalPages === 0}
          >
            다음
          </Button>
        </div>
      </div>
    </div>
  )
}
