"use client"

import { Suspense, useCallback, useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { FileText, RotateCcw, Search } from "lucide-react"
import { useAdminAuditLogs } from "@/hooks/useAdminAuditLogs"
import type { AdminAuditLogActionType } from "@/types/admin-audit-log"
import { formatDateTime, fromDatetimeLocal } from "@/lib/utils/datetime"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { ErrorMessage } from "@/components/ui/error-message"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const ACTION_OPTIONS: Array<{
  value: "" | AdminAuditLogActionType
  label: string
  variant: "default" | "secondary" | "outline" | "destructive"
}> = [
  { value: "", label: "전체 액션", variant: "outline" },
  { value: "DROP", label: "유저 추방", variant: "destructive" },
  { value: "RESTORE", label: "추방 유저 복구", variant: "secondary" },
  { value: "ROLE_CHANGE", label: "유저 역할 변경", variant: "outline" },
]

const ACTION_LABEL: Record<string, string> = {
  DROP: "유저 추방",
  RESTORE: "추방 유저 복구",
  ROLE_CHANGE: "유저 역할 변경",
}

const ACTION_BADGE_VARIANT: Record<
  string,
  "default" | "secondary" | "outline" | "destructive"
> = {
  DROP: "destructive",
  RESTORE: "secondary",
  ROLE_CHANGE: "outline",
}

function toDatetimeLocal(value: string | null): string {
  if (!value) return ""
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return ""
  const y = d.getFullYear()
  const M = String(d.getMonth() + 1).padStart(2, "0")
  const D = String(d.getDate()).padStart(2, "0")
  const h = String(d.getHours()).padStart(2, "0")
  const m = String(d.getMinutes()).padStart(2, "0")
  return `${y}-${M}-${D}T${h}:${m}`
}

function getActionLabel(actionType: string, fallback?: string): string {
  return ACTION_LABEL[actionType] ?? fallback ?? actionType
}

function getActionVariant(
  actionType: string
): "default" | "secondary" | "outline" | "destructive" {
  return ACTION_BADGE_VARIANT[actionType] ?? "outline"
}

function formatMetadataValue(value?: string | null): string {
  if (!value) return "-"
  return value
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean)
    .join(", ")
}

function buildKoreanSummary(
  actionType: string,
  actorEmail: string,
  targetEmail: string
): string {
  const action = getActionLabel(actionType)
  return `${actorEmail} 관리자가 ${targetEmail} 사용자의 ${action} 작업을 수행했습니다.`
}

function AuditLogsPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const initialPage = Number(searchParams.get("page") ?? "1")
  const [page, setPage] = useState(Number.isFinite(initialPage) && initialPage > 0 ? initialPage : 1)
  const [from, setFrom] = useState(toDatetimeLocal(searchParams.get("from")))
  const [to, setTo] = useState(toDatetimeLocal(searchParams.get("to")))
  const [actionType, setActionType] = useState<"" | AdminAuditLogActionType>(
    (searchParams.get("actionType") as "" | AdminAuditLogActionType) ?? ""
  )
  const [keyword, setKeyword] = useState(searchParams.get("keyword") ?? "")
  const [validationMessage, setValidationMessage] = useState("")

  const queryParams = useMemo(
    () => ({
      from: from ? fromDatetimeLocal(from).replace("Z", "") : undefined,
      to: to ? fromDatetimeLocal(to).replace("Z", "") : undefined,
      category: "USER" as const,
      actionType: actionType || undefined,
      keyword: keyword.trim() || undefined,
      page: page - 1,
      size: 10,
    }),
    [actionType, from, keyword, page, to]
  )

  const { data, isLoading, error, refetch } = useAdminAuditLogs(queryParams)

  const hasActiveFilters = !!(from || to || actionType || keyword.trim())

  const syncUrl = useCallback(
    (nextPage: number) => {
      const params = new URLSearchParams()
      if (from) params.set("from", fromDatetimeLocal(from).replace("Z", ""))
      if (to) params.set("to", fromDatetimeLocal(to).replace("Z", ""))
      if (actionType) params.set("actionType", actionType)
      if (keyword.trim()) params.set("keyword", keyword.trim())
      if (nextPage > 1) params.set("page", String(nextPage))
      const query = params.toString()
      router.push(query ? `/admin/audit-logs?${query}` : "/admin/audit-logs")
    },
    [actionType, from, keyword, router, to]
  )

  const validateRange = useCallback(() => {
    if (from && to && new Date(from).getTime() > new Date(to).getTime()) {
      setValidationMessage("조회 시작 시각은 종료 시각보다 늦을 수 없습니다.")
      return false
    }
    setValidationMessage("")
    return true
  }, [from, to])

  const handleSearch = useCallback(() => {
    if (!validateRange()) return
    setPage(1)
    syncUrl(1)
  }, [syncUrl, validateRange])

  const handleReset = useCallback(() => {
    setFrom("")
    setTo("")
    setActionType("")
    setKeyword("")
    setValidationMessage("")
    setPage(1)
    router.push("/admin/audit-logs")
  }, [router])

  const handlePageChange = (nextPage: number) => {
    setPage(nextPage)
    syncUrl(nextPage)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  if (error) {
    return (
      <ErrorMessage
        message="감사 로그를 불러오는 중 오류가 발생했습니다. 권한 또는 검색 조건을 확인해 주세요."
        onRetry={() => refetch()}
      />
    )
  }

  const headClass = "px-4 py-3 text-left align-middle font-semibold bg-muted/50 text-muted-foreground"
  const cellClass = "px-4 py-3 text-sm align-top text-left"

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">감사 로그</h1>
        <p className="mt-1 text-muted-foreground">
          회원 추방, 복구, 역할 변경 등 관리자 작업 이력을 조회합니다.
        </p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">검색 조건</span>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={handleReset} className="gap-1.5 text-muted-foreground">
                <RotateCcw className="h-3.5 w-3.5" />
                초기화
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-[minmax(150px,1fr)_minmax(150px,1fr)_160px_minmax(180px,1fr)_auto] md:items-end">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">시작 시각</label>
              <Input type="datetime-local" value={from} onChange={(e) => setFrom(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">종료 시각</label>
              <Input type="datetime-local" value={to} onChange={(e) => setTo(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">액션</label>
              <Select
                value={actionType || "all"}
                onValueChange={(value) =>
                  setActionType(value === "all" ? "" : (value as AdminAuditLogActionType))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="전체" />
                </SelectTrigger>
                <SelectContent>
                  {ACTION_OPTIONS.map((option) => (
                    <SelectItem key={option.value || "all"} value={option.value || "all"}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">이메일 검색</label>
              <Input
                placeholder="관리자 또는 대상 이메일"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>
            <Button onClick={handleSearch} className="gap-2">
              <Search className="h-4 w-4" />
              검색
            </Button>
          </div>
          {validationMessage && (
            <p className="text-sm font-medium text-destructive">{validationMessage}</p>
          )}
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                {["시간", "액션", "수행자", "대상", "변경 내용"].map((label) => (
                  <TableHead key={label} className={headClass}>
                    <Skeleton className="h-4 w-16" />
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 8 }).map((_, index) => (
                <TableRow key={index}>
                  {Array.from({ length: 5 }).map((__, cellIndex) => (
                    <TableCell key={cellIndex} className={cellClass}>
                      <Skeleton className="h-4 w-24" />
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
            <div className="mb-4 rounded-full bg-muted p-4">
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="font-medium text-muted-foreground">조건에 맞는 감사 로그가 없습니다</p>
            <p className="mt-1 text-sm text-muted-foreground">
              검색 조건을 바꾸거나 초기화 후 다시 조회해 보세요.
            </p>
            <Button variant="outline" size="sm" className="mt-4" onClick={handleReset}>
              검색 초기화
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            총 <span className="font-medium text-foreground">{data.totalElements}</span>건
            {data.totalElements > 0 && (
              <> · {data.currentPage * data.size + 1}-{Math.min((data.currentPage + 1) * data.size, data.totalElements)}번째 표시</>
            )}
          </p>

          <div className="block space-y-3 md:hidden">
            {data.content.map((log) => (
              <div key={log.id} className="rounded-lg border bg-card p-4">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <p className="text-sm font-medium tabular-nums">{formatDateTime(log.createdAt ?? "")}</p>
                  <Badge variant={getActionVariant(log.actionType)} className="font-normal">
                    {getActionLabel(log.actionType, log.actionDescription)}
                  </Badge>
                </div>
                <div className="grid grid-cols-[72px_minmax(0,1fr)] gap-x-3 gap-y-1 text-sm">
                  <span className="text-muted-foreground">수행자</span>
                  <span className="truncate">{log.actor.email}</span>
                  <span className="text-muted-foreground">대상</span>
                  <Link href={`/users/${log.target.id}`} className="truncate text-primary hover:underline">
                    {log.target.email}
                  </Link>
                  <span className="text-muted-foreground">상태</span>
                  <span>{formatMetadataValue(log.metadata.beforeState)} → {formatMetadataValue(log.metadata.afterState)}</span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  {buildKoreanSummary(log.actionType, log.actor.email, log.target.email)}
                </p>
                {log.metadata.reason && (
                  <p className="mt-1 text-sm text-muted-foreground">사유: {log.metadata.reason}</p>
                )}
              </div>
            ))}
          </div>

          <div className="hidden overflow-x-auto rounded-lg border md:block">
            <Table className="table-fixed">
              <TableHeader>
                <TableRow>
                  <TableHead className={headClass} style={{ width: "14%" }}>시간</TableHead>
                  <TableHead className={headClass} style={{ width: "12%" }}>액션</TableHead>
                  <TableHead className={headClass} style={{ width: "20%" }}>수행자</TableHead>
                  <TableHead className={headClass} style={{ width: "20%" }}>대상</TableHead>
                  <TableHead className={headClass} style={{ width: "34%" }}>변경 내용</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.content.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className={`${cellClass} whitespace-nowrap tabular-nums text-muted-foreground`}>
                      {formatDateTime(log.createdAt ?? "")}
                    </TableCell>
                    <TableCell className={cellClass}>
                      <Badge variant={getActionVariant(log.actionType)} className="font-normal">
                        {getActionLabel(log.actionType, log.actionDescription)}
                      </Badge>
                    </TableCell>
                    <TableCell className={cellClass}>
                      <div className="min-w-0">
                        <p className="truncate font-medium">{log.actor.email}</p>
                        <p className="truncate text-xs text-muted-foreground">{log.actor.userId}</p>
                      </div>
                    </TableCell>
                    <TableCell className={cellClass}>
                      <div className="min-w-0">
                        <Link href={`/users/${log.target.id}`} className="truncate font-medium text-primary hover:underline">
                          {log.target.email}
                        </Link>
                        <p className="truncate text-xs text-muted-foreground">{log.target.id}</p>
                      </div>
                    </TableCell>
                    <TableCell className={cellClass}>
                      <div className="space-y-1 text-muted-foreground">
                        <p className="line-clamp-2 text-foreground">
                          {buildKoreanSummary(log.actionType, log.actor.email, log.target.email)}
                        </p>
                        <p className="text-xs">
                          상태: {formatMetadataValue(log.metadata.beforeState)} → {formatMetadataValue(log.metadata.afterState)}
                        </p>
                        <p className="text-xs">
                          권한: {formatMetadataValue(log.metadata.beforeRoles)} → {formatMetadataValue(log.metadata.afterRoles)}
                        </p>
                        {log.metadata.reason && (
                          <p className="text-xs">사유: {log.metadata.reason}</p>
                        )}
                      </div>
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
              disabled={page <= 1 || !data.hasPrev}
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
              disabled={!data.hasNext}
            >
              다음
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function AdminAuditLogsPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-6">
          <div>
            <Skeleton className="mb-2 h-8 w-48" />
            <Skeleton className="h-4 w-80" />
          </div>
          <Skeleton className="h-64 w-full" />
        </div>
      }
    >
      <AuditLogsPageContent />
    </Suspense>
  )
}

