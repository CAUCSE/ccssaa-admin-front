"use client"

import { useRouter } from "next/navigation"
import { useDashboard } from "@/hooks/useDashboard"
import {
  useLatestNotification,
  useMarkNotificationRead,
  useRecentNotificationFeed,
  useUnreadNotificationCount,
} from "@/hooks/useNotifications"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Calendar, ChevronRight, Search, Users, UserPlus } from "lucide-react"
import {
  formatNotificationCount,
  formatNotificationTime,
  getNotificationHref,
  getNotificationTypeLabel,
} from "@/lib/utils/notification"

function formatDateLabel(value: string) {
  return new Date(value).toLocaleDateString("ko-KR", {
    month: "long",
    day: "numeric",
    weekday: "short",
  })
}

function DashboardCardSkeleton() {
  return <Skeleton className="h-[156px] w-full" />
}

export default function DashboardPage() {
  const router = useRouter()
  const { data, isLoading, error } = useDashboard()
  const { data: latestNotification, isLoading: isLatestNotificationLoading } =
    useLatestNotification()
  const { data: unreadCountData, isLoading: isUnreadCountLoading } =
    useUnreadNotificationCount()
  const { data: notificationFeed, isLoading: isNotificationFeedLoading } =
    useRecentNotificationFeed(6)
  const markRead = useMarkNotificationRead()

  const handleNotificationClick = async (
    notificationId: string,
    href: string,
    isRead: boolean
  ) => {
    if (!isRead) {
      try {
        await markRead.mutateAsync(notificationId)
      } catch {
        // ignore
      }
    }

    router.push(href)
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-5">
      <section className="flex flex-col gap-3 rounded-2xl border bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          {data && (
            <span className="text-sm text-muted-foreground">
              기준일 {data.targetDate}
            </span>
          )}
          {error && (
            <span className="text-sm text-amber-600">
              일부 지표는 대체 값으로 표시 중
            </span>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/users")}
          >
            <Search className="mr-2 h-4 w-4" />
            유저 검색
          </Button>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-12">
        {isLoading || !data ? (
          <>
            <div className="xl:col-span-7">
              <DashboardCardSkeleton />
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:col-span-5 xl:grid-cols-1">
              <DashboardCardSkeleton />
              <DashboardCardSkeleton />
            </div>
          </>
        ) : (
          <>
            <Card
              className="cursor-pointer border-slate-200 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white transition-all hover:-translate-y-0.5 hover:shadow-lg xl:col-span-7"
              onClick={() => router.push("/users")}
            >
              <CardContent className="flex h-full flex-col justify-between gap-8 p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-3">
                    <Badge className="bg-white/12 text-white hover:bg-white/12" variant="secondary">
                      전체 사용자
                    </Badge>
                    <div>
                      <p className="text-sm text-slate-300">총 사용자 수</p>
                      <p className="mt-2 text-4xl font-semibold tracking-tight sm:text-5xl">
                        {data.stats.totalUsers.toLocaleString()}명
                      </p>
                    </div>
                  </div>
                  <div className="rounded-full bg-white/10 p-3 text-slate-100">
                    <Users className="h-5 w-5" />
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm text-slate-300">
                  <span>회원 관리로 이동</span>
                  <ChevronRight className="h-4 w-4" />
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-2 xl:col-span-5 xl:grid-cols-1">
              <Card
                className="cursor-pointer border-slate-200 transition-all hover:-translate-y-0.5 hover:border-primary hover:shadow-md"
                onClick={() => router.push("/users")}
              >
                <CardContent className="flex h-full items-start justify-between gap-4 p-6">
                  <div className="space-y-3">
                    <div className="inline-flex rounded-full bg-blue-50 p-2 text-blue-600">
                      <UserPlus className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        일일 신규 가입
                      </p>
                      <p className="mt-2 text-3xl font-semibold tracking-tight">
                        +{data.stats.newUsersToday.toLocaleString()}명
                      </p>
                      <p className="mt-2 text-sm text-muted-foreground">
                        {formatDateLabel(data.targetDate)}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </CardContent>
              </Card>

              <Card
                className="cursor-pointer border-slate-200 transition-all hover:-translate-y-0.5 hover:border-primary hover:shadow-md"
                onClick={() => router.push("/events")}
              >
                <CardContent className="flex h-full items-start justify-between gap-4 p-6">
                  <div className="space-y-3">
                    <div className="inline-flex rounded-full bg-orange-50 p-2 text-orange-600">
                      <Calendar className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm text-muted-foreground">
                          미처리 경조사
                        </p>
                        {data.stats.pendingEvents > 0 ? (
                          <Badge variant="warning">확인 필요</Badge>
                        ) : null}
                      </div>
                      <p className="mt-2 text-3xl font-semibold tracking-tight">
                        {data.stats.pendingEvents.toLocaleString()}건
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </section>

      <section className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
        <Card className="border-slate-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium">읽지 않은 알림</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  가장 최근에 도착한 읽지 않은 알림입니다.
                </p>
              </div>
              <Badge variant="secondary">
                {formatNotificationCount(
                  unreadCountData?.notificationLogCount
                ) ?? "0"}
              </Badge>
            </div>

            <div className="mt-5">
              {isLatestNotificationLoading || isUnreadCountLoading ? (
                <Skeleton className="h-28 w-full" />
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
                    <Badge variant="outline">
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
                <div className="rounded-2xl border border-dashed px-4 py-8 text-sm text-muted-foreground">
                  읽지 않은 최신 알림이 없습니다.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium">최근 7일 알림</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  최근 발생한 알림을 시간순으로 확인합니다.
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {isNotificationFeedLoading ? (
                Array.from({ length: 4 }, (_, index) => (
                  <Skeleton key={index} className="h-20 w-full" />
                ))
              ) : notificationFeed && notificationFeed.length > 0 ? (
                notificationFeed.map((item) => (
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
                      <p className="truncate text-sm text-muted-foreground">
                        {item.body}
                      </p>
                    </div>
                    <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground" />
                  </button>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed px-4 py-8 text-sm text-muted-foreground">
                  최근 7일 알림이 없습니다.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
