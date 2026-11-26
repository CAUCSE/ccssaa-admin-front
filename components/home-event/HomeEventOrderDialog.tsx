"use client"

import { useEffect, useLayoutEffect, useRef, useState } from "react"
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
import { cn } from "@/lib/utils"
import type { HomeEvent } from "@/types/home-event"

const MOVE_ANIMATION_MS = 180

interface HomeEventOrderDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** 전체 이벤트 (displayOrder 오름차순) */
  events: HomeEvent[]
  isSaving: boolean
  /** 전체 이벤트 ID를 새 순서대로 전달 */
  onSave: (eventIds: string[]) => void
}

/** 사용자가 편집한 순서는 유지하고, 목록에서 사라진 ID는 빼고, 새 ID는 뒤에 붙인다 */
function reconcileOrder(current: string[], latestIds: string[]): string[] {
  const latest = new Set(latestIds)
  const kept = current.filter((id) => latest.has(id))
  const keptSet = new Set(kept)
  const added = latestIds.filter((id) => !keptSet.has(id))
  if (added.length === 0 && kept.length === current.length) return current
  return [...kept, ...added]
}

function moveItem(ids: string[], from: number, to: number): string[] {
  if (from === to || from < 0 || to < 0 || from >= ids.length || to >= ids.length) return ids
  const next = [...ids]
  const [moved] = next.splice(from, 1)
  next.splice(to, 0, moved)
  return next
}

export function HomeEventOrderDialog({
  open,
  onOpenChange,
  events,
  isSaving,
  onSave,
}: HomeEventOrderDialogProps) {
  const [orderIds, setOrderIds] = useState<string[]>([])
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const initializedRef = useRef(false)
  const itemRefs = useRef(new Map<string, HTMLLIElement>())
  const prevTops = useRef(new Map<string, number>())

  // 열릴 때 현재 목록으로 초기화하고, 열려 있는 동안 목록이 바뀌면 구성원만 반영
  useEffect(() => {
    if (!open) {
      initializedRef.current = false
      prevTops.current = new Map()
      setDraggingId(null)
      return
    }
    const latestIds = events.map((e) => e.id)
    // updater 는 나중에 실행될 수 있으므로 ref 값을 미리 읽어 둠
    const wasInitialized = initializedRef.current
    setOrderIds((cur) => (wasInitialized ? reconcileOrder(cur, latestIds) : latestIds))
    initializedRef.current = true
  }, [open, events])

  // FLIP 애니메이션: 순서가 바뀌면 이전 위치에서 새 위치로 미끄러지듯 이동
  useLayoutEffect(() => {
    const reduceMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const nextTops = new Map<string, number>()
    itemRefs.current.forEach((el, id) => {
      const top = el.offsetTop
      nextTops.set(id, top)
      const prevTop = prevTops.current.get(id)
      if (reduceMotion || prevTop == null || prevTop === top) return
      el.style.transition = "none"
      el.style.transform = `translateY(${prevTop - top}px)`
      void el.offsetHeight // 강제 리플로우 후 원위치로 트랜지션
      el.style.transition = `transform ${MOVE_ANIMATION_MS}ms ease`
      el.style.transform = ""
    })
    prevTops.current = nextTops
  }, [orderIds])

  const eventById = (id: string) => events.find((e) => e.id === id)

  /** 드래그 중인 항목을 hover 위치로 실시간 이동 (항목 절반을 넘었을 때만 → 떨림 방지) */
  const handleDragOver = (e: React.DragEvent<HTMLLIElement>, overIndex: number) => {
    if (isSaving || !draggingId) return // 저장 중이거나 외부에서 끌어온 드래그는 허용하지 않음
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
    const fromIndex = orderIds.indexOf(draggingId)
    if (fromIndex === -1 || fromIndex === overIndex) return
    const rect = e.currentTarget.getBoundingClientRect()
    const middle = rect.top + rect.height / 2
    if (fromIndex < overIndex && e.clientY < middle) return
    if (fromIndex > overIndex && e.clientY > middle) return
    setOrderIds((cur) => moveItem(cur, cur.indexOf(draggingId), overIndex))
  }

  /** 터치 기기 등 드래그가 어려운 환경을 위한 위/아래 이동 */
  const move = (index: number, delta: -1 | 1) => {
    setOrderIds((cur) => moveItem(cur, index, index + delta))
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
        <ul className="relative max-h-[60vh] space-y-1 overflow-y-auto rounded-md border p-2">
          {orderIds.map((id, index) => {
            const event = eventById(id)
            const isDragging = draggingId === id
            return (
              <li
                key={id}
                ref={(el) => {
                  if (el) itemRefs.current.set(id, el)
                  else itemRefs.current.delete(id)
                }}
                draggable={!isSaving}
                onDragStart={(e) => {
                  e.dataTransfer.effectAllowed = "move"
                  e.dataTransfer.setData("text/plain", id) // Firefox 드래그 시작용
                  setDraggingId(id)
                }}
                onDragOver={(e) => handleDragOver(e, index)}
                onDrop={(e) => {
                  if (draggingId) e.preventDefault() // 순서는 dragOver 에서 이미 반영됨
                }}
                onDragEnd={() => setDraggingId(null)}
                className={cn(
                  "flex cursor-grab items-center gap-2 rounded-md border px-3 py-2 text-sm transition-[opacity,background-color,box-shadow] active:cursor-grabbing",
                  isDragging
                    ? "border-dashed border-primary/50 bg-muted opacity-40"
                    : "bg-background hover:shadow-sm"
                )}
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
                    disabled={isSaving || index === 0}
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
                    disabled={isSaving || index === orderIds.length - 1}
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
          <Button
            onClick={() => onSave(reconcileOrder(orderIds, events.map((e) => e.id)))}
            disabled={isSaving || orderIds.length === 0}
          >
            {isSaving ? "저장 중..." : "저장"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
