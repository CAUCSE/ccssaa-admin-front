"use client"

import Link from "next/link"
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
import type { ScheduleEvent } from "@/types/schedule"

interface ScheduleTableProps {
  data: ScheduleEvent[]
  onEdit?: (event: ScheduleEvent) => void
  onDelete?: (eventId: string) => void
  isLoading?: boolean
}

/**
 * ScheduleTable 컴포넌트
 * 스케줄 일정 목록을 테이블 형태로 표시하는 컴포넌트입니다.
 */
export function ScheduleTable({
  data,
  onEdit,
  onDelete,
  isLoading,
}: ScheduleTableProps) {
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, "0")}.${String(date.getDate()).padStart(2, "0")} ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`
  }

  const getTypeBadge = (type: string) => {
    const typeMap: Record<string, { variant: "default" | "success" | "warning" | "destructive" | "secondary"; label: string }> = {
      ACADEMIC: { variant: "default", label: "학사일정" },
      DEPARTMENT: { variant: "success", label: "학부행사" },
      CCSSAA: { variant: "warning", label: "CCSSAA" },
      STUDENT_COUNCIL: { variant: "secondary", label: "학생회" },
      HOLIDAY: { variant: "default", label: "공휴일" },
    }
    return typeMap[type] || { variant: "secondary", label: type }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="rounded-md border max-h-[600px] overflow-y-auto overflow-x-auto">
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
      <div className="rounded-md border max-h-[600px] overflow-y-auto overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-left">일정명</TableHead>
              <TableHead className="text-center">타입</TableHead>
              <TableHead className="text-center">시작일시</TableHead>
              <TableHead className="text-center">종료일시</TableHead>
              <TableHead className="text-center">연결 게시물</TableHead>
              <TableHead className="text-center">관리</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((event) => {
              const typeBadge = getTypeBadge(event.type)
              return (
                <TableRow key={event.id}>
                  <TableCell className="font-medium">{event.title}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant={typeBadge.variant}>{typeBadge.label}</Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    {formatDateTime(event.start)}
                  </TableCell>
                  <TableCell className="text-center">
                    {formatDateTime(event.end)}
                  </TableCell>
                  <TableCell className="text-center">
                    {event.postId ? (
                      <Link
                        href={`/content/${event.postId}`}
                        className="text-sm text-primary underline underline-offset-2"
                      >
                        {event.postId}
                      </Link>
                    ) : (
                      <span className="text-sm text-muted-foreground">-</span>
                    )}
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

      {/* Total count */}
      <div className="flex justify-center">
        <div className="text-sm text-muted-foreground">
          총 {data.length}개의 일정
        </div>
      </div>
    </div>
  )
}
