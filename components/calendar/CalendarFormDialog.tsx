"use client"

import { useState, useEffect } from "react"
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
  onSubmit,
  isLoading,
}: CalendarFormDialogProps) {
  const [title, setTitle] = useState("")
  const [type, setType] = useState<CalendarType>("ACADEMIC")
  const [startDate, setStartDate] = useState("")
  const [startTime, setStartTime] = useState("")
  const [endDate, setEndDate] = useState("")
  const [endTime, setEndTime] = useState("")

  useEffect(() => {
    if (event) {
      setTitle(event.title)
      setType(event.type)
      
      // ISO 문자열에서 날짜/시간 직접 추출 (타임존 변환 방지)
      const startParts = event.start.split("T")
      setStartDate(startParts[0])
      setStartTime(startParts[1].substring(0, 5))
      
      const endParts = event.end.split("T")
      setEndDate(endParts[0])
      setEndTime(endParts[1].substring(0, 5))
    } else {
      // 초기화
      setTitle("")
      setType("ACADEMIC")
      setStartDate("")
      setStartTime("")
      setEndDate("")
      setEndTime("")
    }
  }, [event, open])

  const handleSubmit = () => {
    if (!title.trim() || !startDate || !startTime || !endDate || !endTime) {
      return
    }

    const start = new Date(`${startDate}T${startTime}`)
    const end = new Date(`${endDate}T${endTime}`)
    
    const data: CreateCalendarEventRequest | UpdateCalendarEventRequest = {
      title: title.trim(),
      type,
      start: start.toISOString(),
      end: end.toISOString(),
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
              <SelectItem value="COMPETITION">대회</SelectItem>
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
              type="time"
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
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
            />
          </div>
        </div>
      </div>
    </FormDialog>
  )
}
