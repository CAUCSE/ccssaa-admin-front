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
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import type {
  CalendarEvent,
  CreateCalendarEventRequest,
  UpdateCalendarEventRequest,
  CalendarScope,
  CalendarActionType,
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
  const [description, setDescription] = useState("")
  const [date, setDate] = useState("")
  const [time, setTime] = useState("")
  const [scope, setScope] = useState<CalendarScope>("ALL")
  const [actionType, setActionType] = useState<CalendarActionType>("Notice")
  const [serviceLink, setServiceLink] = useState("")
  const [externalLink, setExternalLink] = useState("")
  const [notificationEnabled, setNotificationEnabled] = useState(false)

  useEffect(() => {
    if (event) {
      setTitle(event.title)
      setDescription(event.description || "")
      const eventDate = new Date(event.date)
      setDate(eventDate.toISOString().split("T")[0])
      setTime(
        `${String(eventDate.getHours()).padStart(2, "0")}:${String(eventDate.getMinutes()).padStart(2, "0")}`
      )
      setScope(event.scope)
      setActionType(event.actionType)
      setServiceLink(event.serviceLink || "")
      setExternalLink(event.externalLink || "")
      setNotificationEnabled(event.notificationEnabled)
    } else {
      // 초기화
      setTitle("")
      setDescription("")
      setDate("")
      setTime("")
      setScope("ALL")
      setActionType("Notice")
      setServiceLink("")
      setExternalLink("")
      setNotificationEnabled(false)
    }
  }, [event, open])

  const handleSubmit = () => {
    if (!title.trim() || !date || !time) {
      return
    }

    const dateTime = new Date(`${date}T${time}`)
    const data: CreateCalendarEventRequest | UpdateCalendarEventRequest = {
      title: title.trim(),
      description: description.trim() || undefined,
      date: dateTime.toISOString(),
      scope,
      actionType,
      serviceLink: actionType === "Service" ? serviceLink.trim() || undefined : undefined,
      externalLink: actionType === "Link" ? externalLink.trim() || undefined : undefined,
      notificationEnabled,
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
          <Label htmlFor="description">설명</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="일정 설명을 입력하세요"
            rows={3}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="date">날짜 *</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="time">시간 *</Label>
            <Input
              id="time"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="scope">스코프 *</Label>
            <Select value={scope} onValueChange={(value) => setScope(value as CalendarScope)}>
              <SelectTrigger id="scope">
                <SelectValue placeholder="스코프 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">전체</SelectItem>
                <SelectItem value="STUDENT">재학생</SelectItem>
                <SelectItem value="ALUMNI">졸업생</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="actionType">액션 타입 *</Label>
            <Select
              value={actionType}
              onValueChange={(value) => setActionType(value as CalendarActionType)}
            >
              <SelectTrigger id="actionType">
                <SelectValue placeholder="액션 타입 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Notice">일반</SelectItem>
                <SelectItem value="Service">서비스연결</SelectItem>
                <SelectItem value="Link">외부링크</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {actionType === "Service" && (
          <div>
            <Label htmlFor="serviceLink">서비스 연결</Label>
            <Input
              id="serviceLink"
              value={serviceLink}
              onChange={(e) => setServiceLink(e.target.value)}
              placeholder="/lockers/apply"
            />
          </div>
        )}

        {actionType === "Link" && (
          <div>
            <Label htmlFor="externalLink">외부 링크</Label>
            <Input
              id="externalLink"
              value={externalLink}
              onChange={(e) => setExternalLink(e.target.value)}
              placeholder="https://example.com"
            />
          </div>
        )}

        <div className="flex items-center space-x-2">
          <Checkbox
            id="notification"
            checked={notificationEnabled}
            onCheckedChange={(checked) => setNotificationEnabled(checked === true)}
          />
          <Label htmlFor="notification" className="cursor-pointer">
            알림 설정 (일정 시작 전 알림 발송)
          </Label>
        </div>
      </div>
    </FormDialog>
  )
}
