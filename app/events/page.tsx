"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { useEvents } from "@/hooks/useEvents"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Search, ArrowRight } from "lucide-react"
import type { EventListParams, EventStatus } from "@/types/event"
import { useRouter } from "next/navigation"

function EventsPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [page, setPage] = useState(1)
  const [startDate, setStartDate] = useState(searchParams.get("startDate") || "")
  const [endDate, setEndDate] = useState(searchParams.get("endDate") || "")
  const [status, setStatus] = useState<EventStatus | "ALL">(
    (searchParams.get("status") as EventStatus | "ALL") || "ALL"
  )

  const params: EventListParams = {
    page: page - 1,
    size: 10,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
    status: status !== "ALL" ? status : undefined,
  }

  const { data, isLoading, error } = useEvents(params)

  const handleSearch = () => {
    const params = new URLSearchParams()
    if (startDate) params.set("startDate", startDate)
    if (endDate) params.set("endDate", endDate)
    if (status && status !== "ALL") params.set("status", status)
    router.push(`/events?${params.toString()}`)
    setPage(1)
  }

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, "0")}.${String(date.getDate()).padStart(2, "0")}`
  }

  const getEventTypeLabel = (type: string) => {
    switch (type) {
      case "MARRIAGE":
        return "결혼"
      case "FUNERAL":
        return "부고"
      case "BIRTH":
        return "출산"
      case "OTHER":
        return "기타"
      default:
        return type
    }
  }

  const getStatusBadgeVariant = (status: EventStatus) => {
    switch (status) {
      case "PENDING":
        return "warning"
      case "APPROVED":
        return "success"
      case "REJECTED":
        return "danger"
      default:
        return "neutral"
    }
  }

  const getStatusLabel = (status: EventStatus) => {
    switch (status) {
      case "PENDING":
        return "대기"
      case "APPROVED":
        return "승인"
      case "REJECTED":
        return "거부"
      default:
        return status
    }
  }

  useEffect(() => {
    setPage(1)
  }, [searchParams])

  if (error) {
    return (
      <div className="rounded-md border p-12 text-center">
        <p className="text-destructive">데이터를 불러오는 중 오류가 발생했습니다.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">경조사 관리</h1>
        <p className="text-muted-foreground mt-1">경조사 신청 내역을 확인하고 승인/거부할 수 있습니다.</p>
      </div>

      {/* 검색 및 필터 영역 */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                type="date"
                placeholder="시작일"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="flex-1">
              <Input
                type="date"
                placeholder="종료일"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <Select value={status} onValueChange={(value) => setStatus(value as EventStatus | "ALL")}>
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue placeholder="상태" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">전체</SelectItem>
                <SelectItem value="PENDING">대기</SelectItem>
                <SelectItem value="APPROVED">승인</SelectItem>
                <SelectItem value="REJECTED">거부</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleSearch} className="w-full sm:w-auto">
              <Search className="mr-2 h-4 w-4" />
              검색
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 데이터 테이블 */}
      {isLoading ? (
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
      ) : !data || data.content.length === 0 ? (
        <div className="rounded-md border p-12 text-center">
          <p className="text-muted-foreground">조회된 경조사가 없습니다.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-center w-16">No</TableHead>
                  <TableHead className="text-center">신청일</TableHead>
                  <TableHead className="text-center">신청자</TableHead>
                  <TableHead className="text-center">종류</TableHead>
                  <TableHead className="text-center">경조사일</TableHead>
                  <TableHead className="text-center">상태</TableHead>
                  <TableHead className="text-center">관리</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.content.map((event, index) => {
                  const startIndex = (data.number) * data.size
                  return (
                    <TableRow
                      key={event.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => router.push(`/events/${event.id}`)}
                    >
                      <TableCell className="text-center">
                        {startIndex + index + 1}
                      </TableCell>
                      <TableCell className="text-center">
                        {formatDate(event.createdAt)}
                      </TableCell>
                      <TableCell className="text-center">
                        {event.applicantName} ({event.applicantStudentNo})
                      </TableCell>
                      <TableCell className="text-center">
                        {getEventTypeLabel(event.type)}
                      </TableCell>
                      <TableCell className="text-center">
                        {formatDate(event.eventDate)}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant={getStatusBadgeVariant(event.status)}>
                          {getStatusLabel(event.status)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center" onClick={(e) => e.stopPropagation()}>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => router.push(`/events/${event.id}`)}
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
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-muted-foreground">
              총 {data.totalElements}건 중 {(data.number) * data.size + 1}-{Math.min((data.number + 1) * data.size, data.totalElements)}건 표시
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
              >
                이전
              </Button>
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, data.totalPages) }, (_, i) => {
                  let pageNum: number
                  if (data.totalPages <= 5) {
                    pageNum = i + 1
                  } else if (page <= 3) {
                    pageNum = i + 1
                  } else if (page >= data.totalPages - 2) {
                    pageNum = data.totalPages - 4 + i
                  } else {
                    pageNum = page - 2 + i
                  }
                  return (
                    <Button
                      key={pageNum}
                      variant={page === pageNum ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePageChange(pageNum)}
                    >
                      {pageNum}
                    </Button>
                  )
                })}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(page + 1)}
                disabled={page === data.totalPages}
              >
                다음
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function EventsPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-6">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-64 w-full" />
        </div>
      }
    >
      <EventsPageContent />
    </Suspense>
  )
}

