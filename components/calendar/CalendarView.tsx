"use client"

import { Calendar, dateFnsLocalizer, View, ToolbarProps, Navigate, type Event as RBCEvent } from "react-big-calendar"
import { format, parse, startOfWeek, getDay } from "date-fns"
import { ko } from "date-fns/locale"
import type { CalendarEvent, CalendarType } from "@/types/calendar"
import { useState, useMemo, useCallback } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  AlertDialogRoot,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog"
import { Pencil, Trash2, ChevronLeft, ChevronRight } from "lucide-react"

const locales = {
  ko: ko,
}

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
})

interface CalendarViewProps {
  data: CalendarEvent[]
  onEdit: (event: CalendarEvent) => void
  onDelete: (eventId: string) => void
  onSelectSlot?: (slotInfo: { start: Date; end: Date }) => void
  onMonthChange?: (date: Date) => void
  selectedTypes?: CalendarType[]
  isLoading?: boolean
}

type CalendarRbcEvent = RBCEvent & { resource: CalendarEvent }

// 타입별 색상 매핑 (기존 Badge와 동일)
const getEventColor = (type: CalendarType): string => {
  switch (type) {
    case "ACADEMIC":
      return "#6B7280" // gray
    case "DEPARTMENT":
      return "#10B981" // success (green)
    case "CCSSAA":
      return "#F59E0B" // warning (amber)
    case "STUDENT_COUNCIL":
      return "#2563EB" // blue
    case "COMPETITION":
      return "#EF4444" // destructive (red)
    case "HOLIDAY":
      return "#7C3AED" // purple
    default:
      return "#6B7280"
  }
}

const getTypeLabel = (type: CalendarType): string => {
  switch (type) {
    case "ACADEMIC":
      return "학사일정"
    case "DEPARTMENT":
      return "학부행사"
    case "CCSSAA":
      return "CCSSAA"
    case "STUDENT_COUNCIL":
      return "학생회"
    case "COMPETITION":
      return "대회"
    case "HOLIDAY":
      return "공휴일"
    default:
      return type
  }
}

export function CalendarView({
  data,
  onEdit,
  onDelete,
  onSelectSlot,
  onMonthChange,
  selectedTypes,
  isLoading,
}: CalendarViewProps) {
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false)
  const [currentDate, setCurrentDate] = useState(new Date())

  // CalendarEvent를 react-big-calendar 형식으로 변환 및 타입 필터링
  const events = useMemo(() => {
    const filteredData = selectedTypes && selectedTypes.length > 0
      ? data.filter(event => selectedTypes.includes(event.type))
      : data
    
    return filteredData.map((event): CalendarRbcEvent => ({
      id: event.id,
      title: event.title,
      start: new Date(event.start),
      end: new Date(event.end),
      resource: event, // 원본 데이터 저장
    }))
  }, [data, selectedTypes])

  const handleSelectEvent = useCallback((event: CalendarRbcEvent) => {
    setSelectedEvent(event.resource)
    setIsEventDialogOpen(true)
  }, [])

  const handleSelectSlot = useCallback(
    (slotInfo: { start: Date; end: Date }) => {
      if (onSelectSlot) {
        onSelectSlot(slotInfo)
      }
    },
    [onSelectSlot]
  )

  const handleEdit = () => {
    if (selectedEvent) {
      onEdit(selectedEvent)
      setIsEventDialogOpen(false)
    }
  }

  const handleDelete = () => {
    if (selectedEvent) {
      onDelete(selectedEvent.id)
      setIsEventDialogOpen(false)
    }
  }

  // 이벤트 스타일링
  const eventStyleGetter = useCallback((event: CalendarRbcEvent) => {
    const backgroundColor = getEventColor(event.resource.type)
    return {
      style: {
        backgroundColor,
        borderRadius: "4px",
        opacity: 0.9,
        color: "white",
        border: "0px",
        display: "block",
        fontSize: "0.875rem",
        padding: "2px 4px",
      },
    }
  }, [])

  // 커스텀 툴바 컴포넌트
  const CustomToolbar = ({ date, onNavigate }: ToolbarProps) => {
    const goToBack = () => {
      const newDate = new Date(date.getFullYear(), date.getMonth() - 1, 1)
      setCurrentDate(newDate)
      if (onMonthChange) {
        onMonthChange(newDate)
      }
      onNavigate(Navigate.PREVIOUS)
    }

    const goToNext = () => {
      const newDate = new Date(date.getFullYear(), date.getMonth() + 1, 1)
      setCurrentDate(newDate)
      if (onMonthChange) {
        onMonthChange(newDate)
      }
      onNavigate(Navigate.NEXT)
    }

    const goToCurrent = () => {
      const newDate = new Date()
      setCurrentDate(newDate)
      if (onMonthChange) {
        onMonthChange(newDate)
      }
      onNavigate(Navigate.TODAY)
    }

    return (
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={goToBack}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={goToCurrent}>
            이번 달
          </Button>
          <Button variant="outline" size="sm" onClick={goToNext}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <h2 className="text-lg font-semibold">
          {format(date, "yyyy년 M월", { locale: ko })}
        </h2>
        <div className="w-[120px]" /> {/* 레이아웃 균형을 위한 스페이서 */}
      </div>
    )
  }

  // 달력 메시지 한글화
  const messages = {
    date: "날짜",
    time: "시간",
    event: "일정",
    allDay: "종일",
    week: "주",
    work_week: "주간",
    day: "일",
    month: "월",
    previous: "이전",
    next: "다음",
    yesterday: "어제",
    tomorrow: "내일",
    today: "오늘",
    agenda: "일정",
    noEventsInRange: "해당 기간에 일정이 없습니다.",
    showMore: (total: number) => `+${total}개 더보기`,
  }

  const formats = {
    timeGutterFormat: "HH:mm",
    eventTimeRangeFormat: ({ start, end }: { start: Date; end: Date }, culture?: string, localizer?: any) =>
      `${localizer?.format(start, "HH:mm", culture)} - ${localizer?.format(end, "HH:mm", culture)}`,
    agendaTimeFormat: "HH:mm",
    agendaTimeRangeFormat: ({ start, end }: { start: Date; end: Date }, culture?: string, localizer?: any) =>
      `${localizer?.format(start, "HH:mm", culture)} - ${localizer?.format(end, "HH:mm", culture)}`,
  }

  return (
    <>
      <div className="bg-white rounded-lg border p-4" style={{ height: "700px" }}>
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: "100%" }}
          onSelectEvent={handleSelectEvent}
          onSelectSlot={handleSelectSlot}
          selectable
          eventPropGetter={eventStyleGetter}
          messages={messages}
          formats={formats}
          culture="ko"
          views={["month"]}
          defaultView="month"
          date={currentDate}
          onNavigate={(newDate) => {
            setCurrentDate(newDate)
            if (onMonthChange) {
              onMonthChange(newDate)
            }
          }}
          components={{
            toolbar: CustomToolbar,
          }}
        />
      </div>

      {/* 이벤트 상세 모달 */}
      <AlertDialogRoot open={isEventDialogOpen} onOpenChange={setIsEventDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              {selectedEvent?.title}
              <Badge
                variant={
                  selectedEvent?.type === "DEPARTMENT"
                    ? "success"
                    : selectedEvent?.type === "CCSSAA"
                    ? "warning"
                    : selectedEvent?.type === "COMPETITION"
                    ? "destructive"
                    : selectedEvent?.type === "STUDENT_COUNCIL"
                    ? "secondary"
                    : "default"
                }
              >
                {selectedEvent && getTypeLabel(selectedEvent.type)}
              </Badge>
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-2">
                <div>
                  <span className="font-semibold">시작:</span>{" "}
                  {selectedEvent &&
                    format(new Date(selectedEvent.start), "yyyy.MM.dd HH:mm", {
                      locale: ko,
                    })}
                </div>
                <div>
                  <span className="font-semibold">종료:</span>{" "}
                  {selectedEvent &&
                    format(new Date(selectedEvent.end), "yyyy.MM.dd HH:mm", {
                      locale: ko,
                    })}
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>닫기</AlertDialogCancel>
            <Button variant="outline" onClick={handleEdit}>
              <Pencil className="mr-2 h-4 w-4" />
              수정
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              <Trash2 className="mr-2 h-4 w-4" />
              삭제
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogRoot>
    </>
  )
}
