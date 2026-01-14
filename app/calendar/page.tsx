"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
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
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import type {
  CalendarListParams,
  CalendarScope,
  CalendarActionType,
  CalendarEvent,
  CreateCalendarEventRequest,
  UpdateCalendarEventRequest,
} from "@/types/calendar"
import { Plus } from "lucide-react"

function CalendarPageContent() {
  const searchParams = useSearchParams()
  const [page, setPage] = useState(1)
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [deleteEventId, setDeleteEventId] = useState<number | null>(null)

  const params: CalendarListParams = {
    page: page - 1, // API는 0-based
    size: 10,
    startDate: searchParams.get("startDate") || undefined,
    endDate: searchParams.get("endDate") || undefined,
    scope: (searchParams.get("scope") as CalendarScope) || undefined,
    actionType: (searchParams.get("actionType") as CalendarActionType) || undefined,
    keyword: searchParams.get("keyword") || undefined,
  }

  const { data, isLoading, error } = useCalendarEvents(params)
  const createMutation = useCreateCalendarEvent()
  const updateMutation = useUpdateCalendarEvent()
  const deleteMutation = useDeleteCalendarEvent()

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleCreate = () => {
    setSelectedEvent(null)
    setIsFormDialogOpen(true)
  }

  const handleEdit = (event: CalendarEvent) => {
    setSelectedEvent(event)
    setIsFormDialogOpen(true)
  }

  const handleDelete = (eventId: number) => {
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

  useEffect(() => {
    setPage(1) // 필터 변경 시 첫 페이지로
  }, [searchParams])

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
          data={data.content}
          currentPage={page}
          totalPages={data.totalPages}
          totalElements={data.totalElements}
          pageSize={data.size}
          onPageChange={handlePageChange}
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
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
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
      </AlertDialog>
    </div>
  )
}

/**
 * 캘린더 목록 페이지
 * 캘린더 일정을 조회하고 관리할 수 있는 페이지입니다.
 * 
 * 기능:
 * - 일정 검색 (날짜 범위, 스코프, 액션 타입, 키워드)
 * - 일정 목록 표시
 * - 페이지네이션
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
