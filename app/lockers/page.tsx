"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { LockerFilter } from "@/components/locker/LockerFilter"
import { LockerTable } from "@/components/locker/LockerTable"
import { useLockers, useReleaseAllLockers, useSetLockerApplicationPeriod } from "@/hooks/useLockers"
import { useSyncLockerPeriodToCalendar } from "@/hooks/useCalendar"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { ErrorMessage } from "@/components/ui/error-message"
import { FormDialog } from "@/components/ui/form-dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { LockerListParams, LockerStatus, LockerApplicationPeriod } from "@/types/locker"
import { toast } from "sonner"
import { Calendar } from "lucide-react"

function LockersPageContent() {
  const searchParams = useSearchParams()
  const [page, setPage] = useState(1)
  const [isPeriodDialogOpen, setIsPeriodDialogOpen] = useState(false)
  const [periodStart, setPeriodStart] = useState("")
  const [periodEnd, setPeriodEnd] = useState("")

  const params: LockerListParams = {
    page: page - 1, // API는 0-based
    size: 10,
    number: searchParams.get("number") || undefined,
    status: (searchParams.get("status") as LockerStatus) || undefined,
    userKeyword: searchParams.get("userKeyword") || undefined,
  }

  const { data, isLoading, error } = useLockers(params)
  const releaseAllMutation = useReleaseAllLockers()
  const setPeriodMutation = useSetLockerApplicationPeriod()
  const syncCalendarMutation = useSyncLockerPeriodToCalendar()

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleReleaseAll = () => {
    if (confirm("모든 사물함을 회수하시겠습니까?")) {
      releaseAllMutation.mutate()
    }
  }

  const handleSetPeriod = () => {
    if (!periodStart || !periodEnd) {
      toast.error("시작일과 종료일을 모두 입력해주세요.")
      return
    }

    if (new Date(periodStart) > new Date(periodEnd)) {
      toast.error("시작일이 종료일보다 늦을 수 없습니다.")
      return
    }

    const period: LockerApplicationPeriod = {
      startAt: new Date(periodStart).toISOString(),
      endAt: new Date(periodEnd).toISOString(),
    }

    setPeriodMutation.mutate(period, {
      onSuccess: () => {
        // 캘린더 자동 동기화
        syncCalendarMutation.mutate({
          startAt: period.startAt,
          endAt: period.endAt,
        })
        setIsPeriodDialogOpen(false)
        setPeriodStart("")
        setPeriodEnd("")
      },
    })
  }

  useEffect(() => {
    setPage(1) // 필터 변경 시 첫 페이지로
  }, [searchParams])

  if (error) {
    return <ErrorMessage message="데이터를 불러오는 중 오류가 발생했습니다." />
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">사물함 관리</h1>
        <p className="text-muted-foreground">
          사물함을 검색하고 관리할 수 있습니다.
        </p>
      </div>

      {/* 관리자 액션 버튼 */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant="destructive"
          onClick={handleReleaseAll}
          disabled={releaseAllMutation.isPending}
        >
          일괄 회수
        </Button>
        <Button
          variant="default"
          onClick={() => setIsPeriodDialogOpen(true)}
        >
          <Calendar className="mr-2 h-4 w-4" />
          신청 기간 설정
        </Button>
      </div>

      <LockerFilter />

      {data && (
        <LockerTable
          data={data.content}
          currentPage={page}
          totalPages={data.totalPages}
          totalElements={data.totalElements}
          pageSize={data.size}
          onPageChange={handlePageChange}
          isLoading={isLoading}
        />
      )}

      {/* 신청 기간 설정 모달 */}
      <FormDialog
        open={isPeriodDialogOpen}
        onOpenChange={setIsPeriodDialogOpen}
        title="신청 기간 설정"
        description="사물함 신청 기간을 설정합니다. 설정 시 캘린더에 자동으로 동기화됩니다."
        confirmText="설정"
        cancelText="취소"
        onConfirm={handleSetPeriod}
        isLoading={setPeriodMutation.isPending}
      >
        <div className="space-y-4">
          <div>
            <Label htmlFor="periodStart">시작일 *</Label>
            <Input
              id="periodStart"
              type="datetime-local"
              value={periodStart}
              onChange={(e) => setPeriodStart(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="periodEnd">종료일 *</Label>
            <Input
              id="periodEnd"
              type="datetime-local"
              value={periodEnd}
              onChange={(e) => setPeriodEnd(e.target.value)}
            />
          </div>
        </div>
      </FormDialog>
    </div>
  )
}

/**
 * 사물함 목록 페이지
 * 사물함을 조회하고 관리할 수 있는 페이지입니다.
 * 
 * 기능:
 * - 사물함 검색 (번호, 상태, 사용자)
 * - 사물함 목록 표시
 * - 페이지네이션
 * - 일괄 회수
 * - 신청 기간 설정 (캘린더 자동 동기화)
 * - 사물함 상세 페이지로 이동
 */
export default function LockersPage() {
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
      <LockersPageContent />
    </Suspense>
  )
}
