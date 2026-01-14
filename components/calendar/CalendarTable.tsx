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
import type { CalendarEvent } from "@/types/calendar"

interface CalendarTableProps {
  data: CalendarEvent[]
  currentPage: number
  totalPages: number
  totalElements: number
  pageSize: number
  onPageChange: (page: number) => void
  onEdit?: (event: CalendarEvent) => void
  onDelete?: (eventId: number) => void
  isLoading?: boolean
}

/**
 * CalendarTable 컴포넌트
 * 캘린더 일정 목록을 테이블 형태로 표시하는 컴포넌트입니다.
 */
export function CalendarTable({
  data,
  currentPage,
  totalPages,
  totalElements,
  pageSize,
  onPageChange,
  onEdit,
  onDelete,
  isLoading,
}: CalendarTableProps) {
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, "0")}.${String(date.getDate()).padStart(2, "0")} ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, "0")}.${String(date.getDate()).padStart(2, "0")}`
  }

  const startIndex = (currentPage - 1) * pageSize

  const getScopeBadge = (scope: string) => {
    const scopeMap: Record<string, { variant: "default" | "success" | "warning" | "destructive" | "secondary"; label: string }> = {
      ALL: { variant: "default", label: "전체" },
      STUDENT: { variant: "success", label: "재학생" },
      ALUMNI: { variant: "warning", label: "졸업생" },
    }
    return scopeMap[scope] || { variant: "secondary", label: scope }
  }

  const getActionTypeBadge = (actionType: string) => {
    const actionMap: Record<string, { variant: "default" | "success" | "warning" | "destructive" | "secondary"; label: string }> = {
      Notice: { variant: "secondary", label: "일반" },
      Service: { variant: "default", label: "서비스연결" },
      Link: { variant: "default", label: "외부링크" },
    }
    return actionMap[actionType] || { variant: "secondary", label: actionType }
  }

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
          일정 데이터가 없습니다.
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
              <TableHead className="text-left">일정명</TableHead>
              <TableHead className="text-center">날짜</TableHead>
              <TableHead className="text-center">스코프</TableHead>
              <TableHead className="text-center">액션 타입</TableHead>
              <TableHead className="text-center">생성일</TableHead>
              <TableHead className="text-center">관리</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((event) => {
              const scopeBadge = getScopeBadge(event.scope)
              const actionBadge = getActionTypeBadge(event.actionType)
              return (
                <TableRow key={event.id}>
                  <TableCell className="font-medium">{event.title}</TableCell>
                  <TableCell className="text-center">
                    {formatDateTime(event.date)}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant={scopeBadge.variant}>{scopeBadge.label}</Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant={actionBadge.variant}>{actionBadge.label}</Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    {formatDate(event.createdAt)}
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex justify-center gap-2">
                      {onEdit && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onEdit(event)}
                        >
                          수정
                        </Button>
                      )}
                      {onDelete && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => onDelete(event.id)}
                        >
                          삭제
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
