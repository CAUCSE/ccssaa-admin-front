"use client"

import { useEffect, useState } from "react"
import { ArrowDown, ArrowUp, GripVertical } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { HomeEvent } from "@/types/home-event"

interface HomeEventOrderDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** 전체 이벤트 (displayOrder 오름차순) */
  events: HomeEvent[]
  isSaving: boolean
  /** 전체 이벤트 ID를 새 순서대로 전달 */
  onSave: (eventIds: string[]) => void
}

export function HomeEventOrderDialog({
  open,
  onOpenChange,
  events,
  isSaving,
  onSave,
}: HomeEventOrderDialogProps) {
  const [orderIds, setOrderIds] = useState<string[]>([])
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)

  useEffect(() => {
    if (open) setOrderIds(events.map((e) => e.id))
    // 다이얼로그를 열 때만 초기화 (열려 있는 동안 refetch 로 순서가 덮이지 않도록)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const eventById = (id: string) => events.find((e) => e.id === id)

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault()
    setDraggedIndex(null)
    const dragIndex = Number(e.dataTransfer.getData("text/plain"))
    if (Number.isNaN(dragIndex) || dragIndex === dropIndex) return
    setOrderIds((cur) => {
      const next = [...cur]
      const [removed] = next.splice(dragIndex, 1)
      next.splice(dropIndex, 0, removed)
      return next
    })
  }

  /** 터치 기기 등 드래그가 어려운 환경을 위한 위/아래 이동 */
  const move = (index: number, delta: -1 | 1) => {
    const target = index + delta
    if (target < 0 || target >= orderIds.length) return
    setOrderIds((cur) => {
      const next = [...cur]
      ;[next[index], next[target]] = [next[target], next[index]]
      return next
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>노출 순서 변경</DialogTitle>
          <DialogDescription>
            드래그하거나 화살표로 순서를 바꾼 뒤 저장하세요. 위에 있을수록 앱 홈에서 먼저
            보입니다.
          </DialogDescription>
        </DialogHeader>
        <ul className="max-h-[60vh] space-y-1 overflow-y-auto rounded-md border p-2">
          {orderIds.map((id, index) => {
            const event = eventById(id)
            return (
              <li
                key={id}
                draggable
                onDragStart={(e) => {
                  setDraggedIndex(index)
                  e.dataTransfer.effectAllowed = "move"
                  e.dataTransfer.setData("text/plain", String(index))
                }}
                onDragOver={(e) => {
                  e.preventDefault()
                  e.dataTransfer.dropEffect = "move"
                }}
                onDrop={(e) => handleDrop(e, index)}
                onDragEnd={() => setDraggedIndex(null)}
                className={`flex cursor-grab items-center gap-2 rounded-md border px-3 py-2 text-sm active:cursor-grabbing ${
                  draggedIndex === index ? "bg-muted opacity-50" : "bg-background"
                }`}
              >
                <GripVertical className="h-4 w-4 shrink-0 text-muted-foreground" />
                <span className="w-6 shrink-0 font-medium text-muted-foreground">
                  {index + 1}.
                </span>
                <span className="min-w-0 flex-1 truncate">{event?.title ?? id}</span>
                {event && !event.isActive && (
                  <Badge variant="muted" className="shrink-0 font-normal">
                    숨김
                  </Badge>
                )}
                <div className="flex shrink-0">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0"
                    disabled={index === 0}
                    onClick={() => move(index, -1)}
                    aria-label="위로 이동"
                  >
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0"
                    disabled={index === orderIds.length - 1}
                    onClick={() => move(index, 1)}
                    aria-label="아래로 이동"
                  >
                    <ArrowDown className="h-4 w-4" />
                  </Button>
                </div>
              </li>
            )
          })}
        </ul>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
            취소
          </Button>
          <Button onClick={() => onSave(orderIds)} disabled={isSaving}>
            {isSaving ? "저장 중..." : "저장"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
