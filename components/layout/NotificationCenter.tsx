"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Bell, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import {
  useLatestNotification,
  useMarkNotificationRead,
  useRecentNotificationFeed,
  useUnreadNotificationCount,
} from "@/hooks/useNotifications"
import {
  formatNotificationCount,
  formatNotificationTime,
  getNotificationHref,
  getNotificationTypeLabel,
} from "@/lib/utils/notification"

export function NotificationCenter() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const { data: latestNotification, isLoading: isLatestLoading } =
    useLatestNotification()
  const { data: unreadCountData, isLoading: isCountLoading } =
    useUnreadNotificationCount()
  const { data: recentNotifications, isLoading: isFeedLoading } =
    useRecentNotificationFeed(8)
  const markRead = useMarkNotificationRead()

  const unreadCount = unreadCountData?.notificationLogCount ?? 0
  const unreadBadge = formatNotificationCount(unreadCount)

  const latestPreview = useMemo(() => {
    if (!latestNotification) return null
    return `${latestNotification.title} · ${latestNotification.body}`
  }, [latestNotification])

  const handleNotificationClick = async (id: string, href: string, isRead: boolean) => {
    if (!isRead) {
      try {
        await markRead.mutateAsync(id)
      } catch {
        // ignore
      }
    }

    setOpen(false)
    router.push(href)
  }

  return (
    <div className="flex items-center gap-2">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-4 w-4" />
            {unreadBadge ? (
              <span className="absolute right-1 top-1 rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-semibold leading-none text-white">
                {unreadBadge}
              </span>
            ) : null}
          </Button>
        </DialogTrigger>

        <DialogContent className="left-auto right-0 top-0 h-full max-w-md translate-x-0 translate-y-0 rounded-none border-l p-0 pr-12 sm:max-w-md">
          <div className="flex h-full flex-col">
            <DialogHeader className="border-b px-5 py-4 pr-4 text-left">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <DialogTitle>알림 센터</DialogTitle>
                  <DialogDescription>
                    최근 7일 알림을 확인할 수 있습니다.
                  </DialogDescription>
                </div>
                <Badge variant="secondary">
                  읽지 않음 {unreadBadge ?? "0"}
                </Badge>
              </div>
            </DialogHeader>

            <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
              <section className="space-y-2">
                <div className="text-sm font-medium">최신 알림</div>
                {isLatestLoading ? (
                  <Skeleton className="h-24 w-full" />
                ) : latestNotification ? (
                  <button
                    type="button"
                    onClick={() =>
                      handleNotificationClick(
                        latestNotification.notificationLogId,
                        getNotificationHref(latestNotification),
                        latestNotification.isRead
                      )
                    }
                    className="w-full rounded-2xl border bg-slate-50 p-4 text-left transition-colors hover:border-primary"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <Badge variant="secondary">
                        {getNotificationTypeLabel(latestNotification.noticeType)}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatNotificationTime(latestNotification.createdAt)}
                      </span>
                    </div>
                    <p className="mt-3 font-medium">{latestNotification.title}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {latestNotification.body}
                    </p>
                  </button>
                ) : (
                  <div className="rounded-2xl border border-dashed px-4 py-6 text-sm text-muted-foreground">
                    새로운 알림이 없습니다.
                  </div>
                )}
              </section>

              <section className="space-y-2">
                <div className="text-sm font-medium">최근 알림</div>
                {isFeedLoading || isCountLoading ? (
                  <div className="space-y-2">
                    {Array.from({ length: 5 }, (_, index) => (
                      <Skeleton key={index} className="h-20 w-full" />
                    ))}
                  </div>
                ) : recentNotifications && recentNotifications.length > 0 ? (
                  recentNotifications.map((item) => (
                    <button
                      key={item.notificationLogId}
                      type="button"
                      onClick={() =>
                        handleNotificationClick(
                          item.notificationLogId,
                          getNotificationHref(item),
                          item.isRead
                        )
                      }
                      className="flex w-full items-start gap-3 rounded-2xl border px-4 py-3 text-left transition-colors hover:border-primary"
                    >
                      <span
                        className={[
                          "mt-1 h-2.5 w-2.5 shrink-0 rounded-full",
                          item.isRead ? "bg-slate-200" : "bg-red-500",
                        ].join(" ")}
                      />
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">
                            {getNotificationTypeLabel(item.noticeType)}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {formatNotificationTime(item.createdAt)}
                          </span>
                        </div>
                        <p className="truncate text-sm font-medium">{item.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.body}
                        </p>
                      </div>
                      <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground" />
                    </button>
                  ))
                ) : (
                  <div className="rounded-2xl border border-dashed px-4 py-6 text-sm text-muted-foreground">
                    최근 7일 알림이 없습니다.
                  </div>
                )}
              </section>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {latestPreview ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="hidden max-w-[280px] items-center gap-2 rounded-full border bg-background px-3 py-1.5 text-left text-xs text-muted-foreground transition-colors hover:border-primary xl:flex"
        >
          <Badge variant="secondary" className="shrink-0">
            새 알림
          </Badge>
          <span className="truncate">{latestPreview}</span>
        </button>
      ) : null}
    </div>
  )
}
