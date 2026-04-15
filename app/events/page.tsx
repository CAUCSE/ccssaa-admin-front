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
import type { CeremonyState, EventListParams } from "@/types/event"
import { useRouter } from "next/navigation"

function EventsPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [page, setPage] = useState(1)
  const [fromDate, setFromDate] = useState(searchParams.get("fromDate") || "")
  const [toDate, setToDate] = useState(searchParams.get("toDate") || "")
  const [state, setState] = useState<CeremonyState | "ALL">(
    (searchParams.get("state") as CeremonyState | "ALL") || "ALL"
  )

  const params: EventListParams = {
    page: page - 1,
    size: 10,
    fromDate: fromDate || undefined,
    toDate: toDate || undefined,
    state: state !== "ALL" ? state : undefined,
  }

  const { data, isLoading, error } = useEvents(params)

  const handleSearch = () => {
    const params = new URLSearchParams()
    if (fromDate) params.set("fromDate", fromDate)
    if (toDate) params.set("toDate", toDate)
    if (state && state !== "ALL") params.set("state", state)
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

  const getCeremonyTypeLabel = (type: string) => {
    switch (type) {
      case "경사":
        return "경사"
      case "조사":
        return "조사"
      default:
        return type
    }
  }

  const getStatusBadgeVariant = (status: CeremonyState) => {
    switch (status) {
      case "AWAIT":
        return "warning"
      case "ACCEPT":
        return "success"
      case "REJECT":
        return "danger"
      case "CLOSE":
        return "neutral"
      default:
        return "neutral"
    }
  }

  const getStatusLabel = (status: CeremonyState) => {
    switch (status) {
      case "AWAIT":
        return "대기"
      case "ACCEPT":
        return "수락"
      case "REJECT":
        return "거부"
      case "CLOSE":
        return "종료"
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
        <p className="text-muted-foreground mt-1">경조사 신청 내역을 조회하고 상세 정보를 확인할 수 있습니다.</p>
      </div>

      {/* 검색 및 필터 영역 */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                type="date"
                placeholder="시작일"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
              />
            </div>
            <div className="flex-1">
              <Input
                type="date"
                placeholder="종료일"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
              />
            </div>
            <Select value={state} onValueChange={(value) => setState(value as CeremonyState | "ALL")}>
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue placeholder="상태" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">전체</SelectItem>
                <SelectItem value="AWAIT">대기</SelectItem>
                <SelectItem value="ACCEPT">수락</SelectItem>
                <SelectItem value="REJECT">거부</SelectItem>
                <SelectItem value="CLOSE">종료</SelectItem>
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
                  const startIndex = data.currentPage * data.size
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
                        {event.applicantName} ({event.applicantStudentId})
                      </TableCell>
                      <TableCell className="text-center">
                        {getCeremonyTypeLabel(event.category)}
                      </TableCell>
                      <TableCell className="text-center">
                        {formatDate(event.startDate)}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant={getStatusBadgeVariant(event.state)}>
                          {getStatusLabel(event.state)}
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
              총 {data.totalElements}건 중 {data.currentPage * data.size + 1}-{Math.min((data.currentPage + 1) * data.size, data.totalElements)}건 표시
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

