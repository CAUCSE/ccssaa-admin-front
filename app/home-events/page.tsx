"use client"

import { useState } from "react"
import { format } from "date-fns"
import { ko } from "date-fns/locale"
import { Eye, EyeOff, ExternalLink, GripVertical, Info, Pencil, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogRoot,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { HomeEventFormDialog } from "@/components/home-event/HomeEventFormDialog"
import { HomeEventOrderDialog } from "@/components/home-event/HomeEventOrderDialog"
import {
  useCreateHomeEvent,
  useDeleteHomeEvent,
  useHomeEvents,
  useUpdateHomeEvent,
  useUpdateHomeEventOrders,
} from "@/hooks/useHomeEvents"
import type { HomeEvent, HomeEventRequest } from "@/types/home-event"

const formatDateTime = (value: string) => {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? "-" : format(date, "yyyy.MM.dd HH:mm", { locale: ko })
}

function ActiveBadge({ isActive }: { isActive: boolean }) {
  return (
    <Badge variant={isActive ? "success" : "muted"} className="shrink-0 font-normal">
      {isActive ? "노출 중" : "숨김"}
    </Badge>
  )
}

export default function HomeEventsPage() {
  const { data: events = [], isLoading, isError, refetch } = useHomeEvents()
  const createEvent = useCreateHomeEvent()
  const updateEvent = useUpdateHomeEvent()
  const updateOrders = useUpdateHomeEventOrders()
  const deleteEvent = useDeleteHomeEvent()

  const [formOpen, setFormOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<HomeEvent | null>(null)
  const [orderOpen, setOrderOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<HomeEvent | null>(null)

  const activeCount = events.filter((e) => e.isActive).length

  const openCreate = () => {
    setEditingEvent(null)
    setFormOpen(true)
  }

  const openEdit = (event: HomeEvent) => {
    setEditingEvent(event)
    setFormOpen(true)
  }

  const handleSubmit = (data: HomeEventRequest) => {
    const onSuccess = () => setFormOpen(false)
    if (editingEvent) updateEvent.mutate({ id: editingEvent.id, data }, { onSuccess })
    else createEvent.mutate(data, { onSuccess })
  }

  /** PUT 은 전체 필드를 받으므로 기존 제목·링크를 함께 전송 */
  const handleToggleActive = (event: HomeEvent) => {
    const isActive = !event.isActive
    updateEvent.mutate({
      id: event.id,
      data: { title: event.title, landingUrl: event.landingUrl, isActive },
      message: isActive ? "홈 화면에 노출합니다." : "홈 화면에서 숨겼습니다.",
    })
  }

  const handleSaveOrder = (eventIds: string[]) => {
    updateOrders.mutate(eventIds, { onSuccess: () => setOrderOpen(false) })
  }

  /** 같은 수정 mutation 이 겹치지 않도록 요청 중에는 노출 전환·수정 진입을 막음 */
  const isUpdating = updateEvent.isPending

  const renderActions = (event: HomeEvent, fullWidth = false) => (
    <div className={fullWidth ? "grid grid-cols-3 gap-2" : "flex justify-end gap-2"}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleToggleActive(event)}
        disabled={isUpdating}
        className="whitespace-nowrap"
      >
        {event.isActive ? (
          <>
            <EyeOff className="mr-1 h-4 w-4" />
            숨기기
          </>
        ) : (
          <>
            <Eye className="mr-1 h-4 w-4" />
            노출
          </>
        )}
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => openEdit(event)}
        disabled={isUpdating}
        className="whitespace-nowrap"
      >
        <Pencil className="mr-1 h-4 w-4" />
        수정
      </Button>
      <Button
        variant="destructive"
        size="sm"
        onClick={() => setDeleteTarget(event)}
        className="whitespace-nowrap"
      >
        <Trash2 className="mr-1 h-4 w-4" />
        삭제
      </Button>
    </div>
  )

  const renderLink = (url: string) => (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex max-w-full items-center gap-1 text-sm text-muted-foreground hover:text-foreground hover:underline"
      title={url}
    >
      <span className="truncate">{url}</span>
      <ExternalLink className="h-3.5 w-3.5 shrink-0" />
    </a>
  )

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-end gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setOrderOpen(true)}
          disabled={events.length < 2}
        >
          <GripVertical className="mr-1.5 h-4 w-4" />
          순서 변경
        </Button>
        <Button size="sm" onClick={openCreate}>
          <Plus className="mr-1.5 h-4 w-4" />
          이벤트 등록
        </Button>
      </div>

      <div className="flex items-start gap-2 rounded-md border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
        <Info className="mt-0.5 h-4 w-4 shrink-0" />
        <p>
          앱 홈 화면의 이벤트 섹션에 <b className="text-foreground">노출 중</b>인 이벤트만 아래
          순서대로 표시됩니다. 노출 중인 이벤트가 없으면 앱에는 &lsquo;이벤트 없음&rsquo; 화면이
          보입니다.
          {!isLoading && !isError && (
            <span className="ml-1 text-foreground">
              (현재 노출 중 {activeCount}개 / 전체 {events.length}개)
            </span>
          )}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>이벤트 목록</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-12 animate-pulse rounded bg-muted" />
              ))}
            </div>
          ) : isError ? (
            <div className="rounded-md border p-12 text-center">
              <p className="mb-4 text-destructive">이벤트 목록을 불러오지 못했습니다.</p>
              <Button variant="outline" onClick={() => refetch()}>
                다시 시도
              </Button>
            </div>
          ) : events.length === 0 ? (
            <div className="rounded-md border p-12 text-center text-muted-foreground">
              등록된 이벤트가 없습니다.
            </div>
          ) : (
            <>
              {/* Mobile: card view */}
              <div className="block space-y-3 md:hidden">
                {events.map((event, index) => (
                  <div key={event.id} className="rounded-lg border bg-card p-4">
                    <div className="mb-1 flex items-start justify-between gap-2">
                      <p className="text-base font-semibold">
                        <span className="mr-1.5 text-muted-foreground">{index + 1}.</span>
                        {event.title}
                      </p>
                      <ActiveBadge isActive={event.isActive} />
                    </div>
                    <div className="mb-1 min-w-0">{renderLink(event.landingUrl)}</div>
                    <p className="mb-3 text-xs text-muted-foreground">
                      수정 {formatDateTime(event.updatedAt)}
                    </p>
                    {renderActions(event, true)}
                  </div>
                ))}
              </div>

              {/* Desktop: table view */}
              <div className="hidden overflow-x-auto rounded-lg border bg-card md:block [&_tbody_td]:py-3">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="w-16 text-center">순서</TableHead>
                      <TableHead className="min-w-[200px]">제목</TableHead>
                      <TableHead className="min-w-[200px]">랜딩 링크</TableHead>
                      <TableHead className="w-24 text-center">노출</TableHead>
                      <TableHead className="w-36 whitespace-nowrap">수정일</TableHead>
                      <TableHead className="w-[260px] text-right">관리</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {events.map((event, index) => (
                      <TableRow key={event.id} className={event.isActive ? undefined : "opacity-70"}>
                        <TableCell className="text-center font-medium text-muted-foreground">
                          {index + 1}
                        </TableCell>
                        <TableCell className="font-medium">
                          <span className="line-clamp-2" title={event.title}>
                            {event.title}
                          </span>
                        </TableCell>
                        <TableCell className="max-w-[320px]">{renderLink(event.landingUrl)}</TableCell>
                        <TableCell className="text-center">
                          <ActiveBadge isActive={event.isActive} />
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                          {formatDateTime(event.updatedAt)}
                        </TableCell>
                        <TableCell>{renderActions(event)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <HomeEventFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        event={editingEvent}
        isLoading={createEvent.isPending || updateEvent.isPending}
        onSubmit={handleSubmit}
      />

      <HomeEventOrderDialog
        open={orderOpen}
        onOpenChange={setOrderOpen}
        events={events}
        isSaving={updateOrders.isPending}
        onSave={handleSaveOrder}
      />

      <AlertDialogRoot
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>이벤트를 삭제할까요?</AlertDialogTitle>
            <AlertDialogDescription>
              &lsquo;{deleteTarget?.title}&rsquo; 이벤트가 앱 홈 화면과 목록에서 사라집니다. 잠시
              내리기만 하려면 &lsquo;숨기기&rsquo;를 사용하세요.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <Button
              variant="destructive"
              disabled={deleteEvent.isPending}
              onClick={() =>
                deleteTarget &&
                deleteEvent.mutate(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) })
              }
            >
              {deleteEvent.isPending ? "삭제 중..." : "삭제"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogRoot>
    </div>
  )
}
