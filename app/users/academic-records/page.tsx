"use client"

import { useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAcademicRecordApplications } from "@/hooks/useAcademicRecords"
import type { AcademicRecordListParams, AcademicRequestStatus } from "@/types/academic-record"
import {
  ACADEMIC_REQUEST_STATUS_CONFIG,
} from "@/types/academic-record"
import { DEPARTMENT_CONFIG, ACADEMIC_STATUS_CONFIG } from "@/types/user"
import type { Department } from "@/types/user"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
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
import { ChevronLeft, ChevronRight, Search } from "lucide-react"

function AcademicRecordsPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [page, setPage] = useState(1)

  // 입력용 (UI에 바인딩)
  const [statusFilter, setStatusFilter] = useState<AcademicRequestStatus | "ALL">(
    (searchParams.get("requestStatus") as AcademicRequestStatus) || "ALL"
  )
  const [departmentFilter, setDepartmentFilter] = useState<Department | "ALL">(
    (searchParams.get("department") as Department) || "ALL"
  )
  const [keyword, setKeyword] = useState(searchParams.get("keyword") || "")

  // 조회용 (조회 버튼을 눌러야 반영)
  const [appliedFilters, setAppliedFilters] = useState<{
    requestStatus: AcademicRequestStatus | "ALL"
    department: Department | "ALL"
    keyword: string
  }>({
    requestStatus: (searchParams.get("requestStatus") as AcademicRequestStatus) || "ALL",
    department: (searchParams.get("department") as Department) || "ALL",
    keyword: searchParams.get("keyword") || "",
  })

  const params: AcademicRecordListParams = {
    page: page - 1,
    size: 10,
    requestStatus: appliedFilters.requestStatus,
    department: appliedFilters.department,
    keyword: appliedFilters.keyword || undefined,
  }

  const { data, isLoading, error } = useAcademicRecordApplications(params)

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleSearch = () => {
    setAppliedFilters({
      requestStatus: statusFilter,
      department: departmentFilter,
      keyword: keyword,
    })
    setPage(1)
  }

  const handleRowClick = (applicationId: string) => {
    router.push(`/users/academic-records/${applicationId}`)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
  }

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
        <h1 className="text-2xl font-bold mb-2">학적 상태 변경 요청</h1>
        <p className="text-muted-foreground">
          회원의 학적 상태 변경 요청을 조회하고 관리할 수 있습니다.
        </p>
      </div>

      {/* 필터 영역 */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="이름 또는 학번 검색"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSearch()
                }}
              />
            </div>
            <Select
              value={departmentFilter}
              onValueChange={(val) => setDepartmentFilter(val as Department | "ALL")}
            >
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="학과" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">전체</SelectItem>
                {Object.entries(DEPARTMENT_CONFIG).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={statusFilter}
              onValueChange={(val) => setStatusFilter(val as AcademicRequestStatus | "ALL")}
            >
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue placeholder="처리 상태" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">전체</SelectItem>
                  <SelectItem value="AWAIT">대기</SelectItem>
                  <SelectItem value="ACCEPT">승인</SelectItem>
                  <SelectItem value="REJECT">거절</SelectItem>
                  <SelectItem value="CLOSE">종료</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleSearch} className="w-full sm:w-auto">
              <Search className="mr-2 h-4 w-4" />
              조회
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 데이터 테이블 */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-center w-[60px]">No</TableHead>
                  <TableHead className="text-center">학번</TableHead>
                  <TableHead className="text-left">이름</TableHead>
                  <TableHead className="text-left">학과</TableHead>
                  <TableHead className="text-center">변경 전 학적</TableHead>
                  <TableHead className="text-center">변경 학적</TableHead>
                  <TableHead className="text-center">처리 상태</TableHead>
                  <TableHead className="text-center">요청일</TableHead>
                  <TableHead className="text-center w-[100px]">관리</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 9 }).map((_, j) => (
                        <TableCell key={j}>
                          <Skeleton className="h-4 w-full" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : data && data.content.length > 0 ? (
                  data.content.map((app, index) => {
                    const statusConfig = ACADEMIC_REQUEST_STATUS_CONFIG[app.requestStatus] ?? {
                      label: app.requestStatus,
                      variant: "neutral" as const,
                    }
                    return (
                      <TableRow
                        key={app.applicationId}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => handleRowClick(app.applicationId)}
                      >
                        <TableCell className="text-center">
                          {data.number * data.size + index + 1}
                        </TableCell>
                        <TableCell className="text-center">{app.studentId}</TableCell>
                        <TableCell className="text-left">{app.userName}</TableCell>
                        <TableCell className="text-left">
                          {DEPARTMENT_CONFIG[app.department] ?? app.department}
                        </TableCell>
                        <TableCell className="text-center">
                          {ACADEMIC_STATUS_CONFIG[app.currentAcademicStatus] ?? app.currentAcademicStatus}
                        </TableCell>
                        <TableCell className="text-center">
                          {ACADEMIC_STATUS_CONFIG[app.targetAcademicStatus] ?? app.targetAcademicStatus}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant={statusConfig.variant}>
                            {statusConfig.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">{formatDate(app.createdAt)}</TableCell>
                        <TableCell className="text-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleRowClick(app.applicationId)
                            }}
                          >
                            상세보기 &gt;
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={9} className="h-24 text-center text-muted-foreground">
                      학적 상태 변경 요청이 없습니다.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* 페이지네이션 */}
          {data && data.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 py-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(page - 1)}
                disabled={page <= 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              {Array.from({ length: data.totalPages }, (_, i) => i + 1)
                .filter((p) => {
                  const diff = Math.abs(p - page)
                  return diff <= 2 || p === 1 || p === data.totalPages
                })
                .map((p, idx, arr) => {
                  const prev = arr[idx - 1]
                  const showEllipsis = prev != null && p - prev > 1
                  return (
                    <span key={p} className="flex items-center">
                      {showEllipsis && <span className="px-1 text-muted-foreground">...</span>}
                      <Button
                        variant={page === p ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(p)}
                        className="min-w-[32px]"
                      >
                        {p}
                      </Button>
                    </span>
                  )
                })}
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(page + 1)}
                disabled={page >= data.totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default function AcademicRecordsPage() {
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
      <AcademicRecordsPageContent />
    </Suspense>
  )
}
