"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { CalendarFilter } from "@/components/calendar/CalendarFilter"
import { CalendarTable } from "@/components/calendar/CalendarTable"
import { CalendarFormDialog } from "@/components/calendar/CalendarFormDialog"
import {
  useCalendarEvents,
  useCreateCalendarEvent,
  useUpdateCalendarEvent,
  useDeleteCalendarEvent,
} from "@/hooks/useCalendar"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { ErrorMessage } from "@/components/ui/error-message"
import { AlertDialogRoot, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import type {
  CalendarListParams,
  CalendarType,
  CalendarEvent,
  CreateCalendarEventRequest,
  UpdateCalendarEventRequest,
} from "@/types/calendar"
import { Plus } from "lucide-react"

function CalendarPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [deleteEventId, setDeleteEventId] = useState<string | null>(null)

  // 기본 검색 조건: 이번 달 + 다음 달
  const getDefaultDateRange = () => {
    const now = new Date()
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const nextMonthEnd = new Date(now.getFullYear(), now.getMonth() + 2, 0)
    
    const from = thisMonthStart.toISOString().split('T')[0]
    const to = nextMonthEnd.toISOString().split('T')[0]
    
    return { from, to }
  }

  const defaultDates = getDefaultDateRange()

  // 초기 진입 시 기본 날짜를 URL에 설정
  useEffect(() => {
    const hasParams = searchParams.toString()
    if (!hasParams) {
      const params = new URLSearchParams()
      params.set("from", defaultDates.from)
      params.set("to", defaultDates.to)
      router.replace(`/calendar?${params.toString()}`)
    }
  }, [])

  const params: CalendarListParams = {
    from: searchParams.get("from") || defaultDates.from,
    to: searchParams.get("to") || defaultDates.to,
    types: searchParams.get("types")?.split(",") as CalendarType[] | undefined,
  }

  const { data, isLoading, error } = useCalendarEvents(params)
  const createMutation = useCreateCalendarEvent()
  const updateMutation = useUpdateCalendarEvent()
  const deleteMutation = useDeleteCalendarEvent()

  const handleCreate = () => {
    setSelectedEvent(null)
    setIsFormDialogOpen(true)
  }

  const handleEdit = (event: CalendarEvent) => {
    setSelectedEvent(event)
    setIsFormDialogOpen(true)
  }

  const handleDelete = (eventId: string) => {
    setDeleteEventId(eventId)
    setIsDeleteDialogOpen(true)
  }

  const handleConfirmDelete = () => {
    if (deleteEventId) {
      deleteMutation.mutate(deleteEventId, {
        onSuccess: () => {
          setIsDeleteDialogOpen(false)
          setDeleteEventId(null)
        },
      })
    }
  }

  const handleSubmit = (
    data: CreateCalendarEventRequest | UpdateCalendarEventRequest
  ) => {
    if (selectedEvent) {
      updateMutation.mutate(
        { eventId: selectedEvent.id, data: data as UpdateCalendarEventRequest },
        {
          onSuccess: () => {
            setIsFormDialogOpen(false)
            setSelectedEvent(null)
          },
        }
      )
    } else {
      createMutation.mutate(data as CreateCalendarEventRequest, {
        onSuccess: () => {
          setIsFormDialogOpen(false)
        },
      })
    }
  }

  if (error) {
    return <ErrorMessage message="데이터를 불러오는 중 오류가 발생했습니다." />
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold mb-2">캘린더 관리</h1>
          <p className="text-muted-foreground">
            일정을 등록하고 관리할 수 있습니다.
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          일정 등록
        </Button>
      </div>

      <CalendarFilter />

      {data && (
        <CalendarTable
          data={data.data}
          onEdit={handleEdit}
          onDelete={handleDelete}
          isLoading={isLoading}
        />
      )}

      {/* 일정 등록/수정 모달 */}
      <CalendarFormDialog
        open={isFormDialogOpen}
        onOpenChange={setIsFormDialogOpen}
        event={selectedEvent || undefined}
        onSubmit={handleSubmit}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />

      {/* 삭제 확인 모달 */}
      <AlertDialogRoot open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>일정 삭제 확인</AlertDialogTitle>
            <AlertDialogDescription>
              이 일정을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              삭제
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogRoot>
    </div>
  )
}

/**
 * 캘린더 목록 페이지
 * 캘린더 일정을 조회하고 관리할 수 있는 페이지입니다.
 * 
 * 기능:
 * - 일정 검색 (날짜 범위, 타입, 키워드)
 * - 일정 목록 표시
 * - 일정 등록/수정/삭제
 */
export default function CalendarPage() {
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
      <CalendarPageContent />
    </Suspense>
  )
}
