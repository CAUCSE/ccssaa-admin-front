"use client"

import { useState, useCallback, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { useLockerLogs } from "@/hooks/useLockerLogs"
import type { LockerNameV2 } from "@/types/locker"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { ErrorMessage } from "@/components/ui/error-message"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Search, RotateCcw, FileText } from "lucide-react"

const ACTION_OPTIONS: { value: string; label: string; variant?: "default" | "secondary" | "outline" | "destructive" }[] = [
  { value: "", label: "전체 액션" },
  { value: "ENABLE", label: "사물함 활성화", variant: "default" },
  { value: "DISABLE", label: "사물함 비활성화", variant: "secondary" },
  { value: "REGISTER", label: "사물함 신청", variant: "default" },
  { value: "RETURN", label: "사물함 반납", variant: "secondary" },
  { value: "EXTEND", label: "사물함 연장", variant: "outline" },
  { value: "ADMIN_ASSIGN", label: "관리자 사물함 배정", variant: "default" },
  { value: "ADMIN_EXTEND", label: "관리자 사물함 연장", variant: "outline" },
  { value: "ADMIN_RELEASE", label: "관리자 사물함 회수", variant: "destructive" },
]

const LOCATION_OPTIONS: { value: "" | LockerNameV2; label: string }[] = [
  { value: "", label: "전체 위치" },
  { value: "SECOND", label: "2층" },
  { value: "THIRD", label: "3층" },
  { value: "FOURTH", label: "4층" },
]

function formatDateTime(iso: string): string {
  const d = new Date(iso)
  const y = d.getFullYear()
  const M = String(d.getMonth() + 1).padStart(2, "0")
  const D = String(d.getDate()).padStart(2, "0")
  const h = String(d.getHours()).padStart(2, "0")
  const m = String(d.getMinutes()).padStart(2, "0")
  return `${y}.${M}.${D} ${h}:${m}`
}

const ACTION_LABEL: Record<string, string> = {
  ENABLE: "사물함 활성화",
  DISABLE: "사물함 비활성화",
  REGISTER: "사물함 신청",
  RETURN: "사물함 반납",
  EXTEND: "사물함 연장",
  ADMIN_ASSIGN: "관리자 사물함 배정",
  ADMIN_EXTEND: "관리자 사물함 연장",
  ADMIN_RELEASE: "관리자 사물함 회수",
}

const ACTION_BADGE_VARIANT: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  ENABLE: "default",
  DISABLE: "secondary",
  REGISTER: "default",
  RETURN: "secondary",
  EXTEND: "outline",
  ADMIN_ASSIGN: "default",
  ADMIN_EXTEND: "outline",
  ADMIN_RELEASE: "destructive",
}

function getActionLabel(action: string): string {
  return ACTION_LABEL[action] ?? action
}

function getActionBadgeVariant(action: string): "default" | "secondary" | "outline" | "destructive" {
  return ACTION_BADGE_VARIANT[action] ?? "outline"
}

function LockerLogsPageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const [page, setPage] = useState(1)
  const [userKeyword, setUserKeyword] = useState(searchParams.get("userKeyword") ?? "")
  const [action, setAction] = useState(searchParams.get("action") ?? "")
  const [lockerLocationName, setLockerLocationName] = useState<
    "" | LockerNameV2
  >((searchParams.get("lockerLocationName") as "" | LockerNameV2) ?? "")
  const [lockerNumber, setLockerNumber] = useState(
    searchParams.get("lockerNumber") ?? ""
  )

  const params = {
    page: page - 1,
    size: 20,
    userKeyword: userKeyword.trim() || undefined,
    action: action || undefined,
    lockerLocationName: lockerLocationName || undefined,
    lockerNumber: lockerNumber.trim() || undefined,
  }

  const { data, isLoading, error } = useLockerLogs(params)

  const handleSearch = useCallback(() => {
    setPage(1)
    const p = new URLSearchParams()
    if (userKeyword.trim()) p.set("userKeyword", userKeyword.trim())
    if (action) p.set("action", action)
    if (lockerLocationName) p.set("lockerLocationName", lockerLocationName)
    if (lockerNumber.trim()) p.set("lockerNumber", lockerNumber.trim())
    router.push(`/lockers/logs?${p.toString()}`)
  }, [userKeyword, action, lockerLocationName, lockerNumber, router])

  const handleReset = useCallback(() => {
    setUserKeyword("")
    setAction("")
    setLockerLocationName("")
    setLockerNumber("")
    setPage(1)
    router.push("/lockers/logs")
  }, [router])

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const hasActiveFilters = !!(userKeyword.trim() || action || lockerLocationName || lockerNumber.trim())

  if (error) {
    return <ErrorMessage message="로그를 불러오는 중 오류가 발생했습니다." />
  }

  const cellClass = "px-4 py-3 text-sm align-middle text-left"
  const headClass = "px-4 py-3 text-left align-middle font-semibold bg-muted/50 text-muted-foreground"

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">로그 조회</h1>
        <p className="text-muted-foreground mt-1">
          사물함 배정·반납·연장·회수 이력을 검색합니다. 읽기 전용입니다.
        </p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">검색 조건</span>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={handleReset} className="text-muted-foreground gap-1.5">
                <RotateCcw className="h-3.5 w-3.5" />
                초기화
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 flex-wrap items-end">
            <div className="flex-1 min-w-[180px] space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">이름·이메일·학번</label>
              <Input
                placeholder="검색어 입력"
                value={userKeyword}
                onChange={(e) => setUserKeyword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>
            <div className="w-full sm:w-[130px] space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">액션</label>
              <Select value={action || "all"} onValueChange={(v) => setAction(v === "all" ? "" : v)}>
                <SelectTrigger>
                  <SelectValue placeholder="전체" />
                </SelectTrigger>
                <SelectContent>
                  {ACTION_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value || "all"} value={opt.value || "all"}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-full sm:w-[120px] space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">위치</label>
              <Select
                value={lockerLocationName || "all"}
                onValueChange={(v) =>
                  setLockerLocationName((v === "all" ? "" : v) as "" | LockerNameV2)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="전체" />
                </SelectTrigger>
                <SelectContent>
                  {LOCATION_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value || "all"} value={opt.value || "all"}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-full sm:w-28 space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">사물함 번호</label>
              <Input
                type="number"
                min={1}
                placeholder="번호"
                value={lockerNumber}
                onChange={(e) => setLockerNumber(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>
            <Button onClick={handleSearch} className="gap-2 shrink-0">
              <Search className="h-4 w-4" />
              검색
            </Button>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="rounded-lg border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                {["시간", "액션", "사용자", "사물함", "메시지"].map((label, i) => (
                  <TableHead key={i} className={headClass}>
                    <Skeleton className="h-4 w-16" />
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 8 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 5 }).map((_, j) => (
                    <TableCell key={j} className={cellClass}>
                      <Skeleton className="h-4 w-20" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : !data || data.content.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="rounded-full bg-muted p-4 mb-4">
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="font-medium text-muted-foreground">조건에 맞는 로그가 없습니다</p>
            <p className="text-sm text-muted-foreground mt-1">
              검색 조건을 바꾸거나 초기화 후 다시 검색해 보세요.
            </p>
            <Button variant="outline" size="sm" className="mt-4" onClick={handleReset}>
              검색 초기화
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              총 <span className="font-medium text-foreground">{data.totalElements}</span>건
              {data.totalElements > 0 && (
                <> · {data.number * data.size + 1}–{Math.min((data.number + 1) * data.size, data.totalElements)}번째 표시</>
              )}
            </p>
          </div>

          {/* Mobile: card view */}
          <div className="block md:hidden space-y-3">
            {data.content.map((log) => {
              const actionBadge = getActionBadgeVariant(log.action)
              return (
                <div key={log.id} className="rounded-lg border bg-card p-4">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <p className="text-sm font-medium tabular-nums">{formatDateTime(log.createdAt)}</p>
                    <Badge variant={actionBadge} className="whitespace-nowrap font-normal shrink-0">
                      {getActionLabel(log.action)}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                    <p className="text-muted-foreground">사용자</p>
                    <p className="font-medium truncate">{log.userName || "—"}</p>
                    <p className="text-muted-foreground">사물함</p>
                    <p className="tabular-nums">{log.lockerLocationName} {log.lockerNumber}번</p>
                    {log.userEmail && (<><p className="text-muted-foreground">이메일</p><p className="truncate text-xs">{log.userEmail}</p></>)}
                  </div>
                  {log.message && <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{log.message}</p>}
                </div>
              )
            })}
          </div>

          {/* Desktop: table view */}
          <div className="hidden md:block rounded-lg border overflow-x-auto">
            <Table className="table-fixed">
              <TableHeader>
                <TableRow>
                  <TableHead className={headClass} style={{ width: "14%" }}>시간</TableHead>
                  <TableHead className={headClass} style={{ width: "10%" }}>액션</TableHead>
                  <TableHead className={headClass} style={{ width: "22%" }}>사용자</TableHead>
                  <TableHead className={headClass} style={{ width: "14%" }}>사물함</TableHead>
                  <TableHead className={headClass} style={{ width: "40%" }}>메시지</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.content.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className={`${cellClass} whitespace-nowrap tabular-nums text-muted-foreground`}>
                      {formatDateTime(log.createdAt)}
                    </TableCell>
                    <TableCell className={cellClass}>
                      <Badge variant={getActionBadgeVariant(log.action)} className="font-normal whitespace-nowrap">
                        {getActionLabel(log.action)}
                      </Badge>
                    </TableCell>
                    <TableCell className={cellClass}>
                      <div className="flex flex-col min-w-0">
                        <span className="truncate font-medium">{log.userName || "—"}</span>
                        {log.userEmail ? (
                          <span className="text-xs text-muted-foreground truncate">{log.userEmail}</span>
                        ) : null}
                      </div>
                    </TableCell>
                    <TableCell className={`${cellClass} tabular-nums`}>
                      {log.lockerLocationName} {log.lockerNumber}번
                    </TableCell>
                    <TableCell className={`${cellClass} text-muted-foreground`}>
                      <span className="line-clamp-2">{log.message}</span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(page - 1)}
              disabled={page <= 1}
            >
              이전
            </Button>
            <span className="text-sm text-muted-foreground tabular-nums">
              {page} / {Math.max(1, data.totalPages)}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(page + 1)}
              disabled={page >= data.totalPages}
            >
              다음
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function LockerLogsPage() {
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
      <LockerLogsPageContent />
    </Suspense>
  )
}
