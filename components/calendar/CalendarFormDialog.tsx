"use client"

import { useState, useEffect } from "react"
import { toast } from "sonner"
import { FormDialog } from "@/components/ui/form-dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type {
  CalendarEvent,
  CreateCalendarEventRequest,
  UpdateCalendarEventRequest,
  CalendarType,
} from "@/types/calendar"

interface CalendarFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  event?: CalendarEvent
  initialDates?: { start: Date; end: Date }
  onSubmit: (data: CreateCalendarEventRequest | UpdateCalendarEventRequest) => void
  isLoading?: boolean
}

/**
 * CalendarFormDialog 컴포넌트
 * 캘린더 일정 등록/수정 모달입니다.
 */
export function CalendarFormDialog({
  open,
  onOpenChange,
  event,
  initialDates,
  onSubmit,
  isLoading,
}: CalendarFormDialogProps) {
  const [title, setTitle] = useState("")
  const [type, setType] = useState<CalendarType>("ACADEMIC")
  const [startDate, setStartDate] = useState("")
  const [startTime, setStartTime] = useState("")
  const [endDate, setEndDate] = useState("")
  const [endTime, setEndTime] = useState("")
  const [targetPostId, setTargetPostId] = useState("")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const isValidTime = (value: string) => /^([01]\d|2[0-3]):([0-5]\d)$/.test(value)

  useEffect(() => {
    setErrorMessage(null)

    if (event) {
      setTitle(event.title)
      setType(event.type)
      setTargetPostId(event.targetPostId ?? "")
      
      // ISO 문자열에서 날짜/시간 직접 추출 (타임존 변환 방지)
      const startParts = event.start.split("T")
      setStartDate(startParts[0])
      setStartTime(startParts[1].substring(0, 5))
      
      const endParts = event.end.split("T")
      setEndDate(endParts[0])
      setEndTime(endParts[1].substring(0, 5))
    } else if (initialDates) {
      // 달력에서 날짜 클릭 시 초기값 설정
      setTitle("")
      setType("ACADEMIC")
      setTargetPostId("")
      
      const startYear = initialDates.start.getFullYear()
      const startMonth = String(initialDates.start.getMonth() + 1).padStart(2, '0')
      const startDay = String(initialDates.start.getDate()).padStart(2, '0')
      setStartDate(`${startYear}-${startMonth}-${startDay}`)
      
      const startHours = String(initialDates.start.getHours()).padStart(2, '0')
      const startMinutes = String(initialDates.start.getMinutes()).padStart(2, '0')
      setStartTime(`${startHours}:${startMinutes}`)
      
      const endYear = initialDates.end.getFullYear()
      const endMonth = String(initialDates.end.getMonth() + 1).padStart(2, '0')
      const endDay = String(initialDates.end.getDate()).padStart(2, '0')
      const endHours = String(initialDates.end.getHours()).padStart(2, '0')
      const endMinutes = String(initialDates.end.getMinutes()).padStart(2, '0')
      setEndDate(`${endYear}-${endMonth}-${endDay}`)
      setEndTime(`${endHours}:${endMinutes}`)
    } else {
      // 완전 초기화
      setTitle("")
      setType("ACADEMIC")
      setStartDate("")
      setStartTime("")
      setEndDate("")
      setEndTime("")
      setTargetPostId("")
    }
  }, [event, initialDates, open])

  const handleSubmit = () => {
    if (!title.trim() || !startDate || !startTime || !endDate || !endTime) {
      const message = "모든 필수 항목을 입력해주세요."
      setErrorMessage(message)
      toast.error(message)
      return
    }

    if (!isValidTime(startTime) || !isValidTime(endTime)) {
      const message = "시간 형식이 올바르지 않습니다. HH:MM 형식으로 입력해주세요."
      setErrorMessage(message)
      toast.error(message)
      return
    }

    const start = new Date(`${startDate}T${startTime}`)
    const end = new Date(`${endDate}T${endTime}`)

    if (start > end) {
      const message = "시작 일시는 종료 일시보다 늦을 수 없습니다."
      setErrorMessage(message)
      toast.error(message)
      return
    }

    setErrorMessage(null)
    
    const data: CreateCalendarEventRequest | UpdateCalendarEventRequest = {
      title: title.trim(),
      type,
      start: start.toISOString(),
      end: end.toISOString(),
      ...(targetPostId.trim() !== "" && { targetPostId: targetPostId.trim() }),
    }

    onSubmit(data)
  }

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={event ? "일정 수정" : "일정 등록"}
      description={event ? "일정 정보를 수정합니다." : "새로운 일정을 등록합니다."}
      confirmText="저장"
      cancelText="취소"
      onConfirm={handleSubmit}
      isLoading={isLoading}
    >
      <div className="space-y-4">
        {errorMessage && <p className="text-sm text-destructive">{errorMessage}</p>}
        <div>
          <Label htmlFor="title">일정명 *</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="일정명을 입력하세요"
          />
        </div>

        <div>
          <Label htmlFor="type">일정 타입 *</Label>
          <Select value={type} onValueChange={(value) => setType(value as CalendarType)}>
            <SelectTrigger id="type">
              <SelectValue placeholder="일정 타입 선택" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ACADEMIC">학사일정</SelectItem>
              <SelectItem value="DEPARTMENT">학부행사</SelectItem>
              <SelectItem value="CCSSAA">CCSSAA</SelectItem>
              <SelectItem value="STUDENT_COUNCIL">학생회</SelectItem>
              <SelectItem value="HOLIDAY">공휴일</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>시작 일시 *</Label>
          <div className="grid grid-cols-2 gap-4">
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <Input
              type="text"
              inputMode="numeric"
              pattern="[0-2][0-9]:[0-5][0-9]"
              placeholder="HH:MM"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
            />
          </div>
        </div>

        <div>
          <Label>종료 일시 *</Label>
          <div className="grid grid-cols-2 gap-4">
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
            <Input
              type="text"
              inputMode="numeric"
              pattern="[0-2][0-9]:[0-5][0-9]"
              placeholder="HH:MM"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="targetPostId">연결 게시물 ID</Label>
          <Input
            id="targetPostId"
            type="text"
            value={targetPostId}
            onChange={(e) => setTargetPostId(e.target.value)}
            placeholder="게시물 ID (선택사항)"
          />
        </div>
      </div>
    </FormDialog>
  )
}
