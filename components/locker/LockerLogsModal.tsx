"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useLockerLogs } from "@/hooks/useLockerLogs"
import type { Locker, LockerNameV2 } from "@/types/locker"
import { FileText } from "lucide-react"

const ACTION_LABEL: Record<string, string> = {
  REGISTER: "배정",
  RETURN: "반납",
  EXTEND: "연장",
  REVOKE: "회수",
}

const ACTION_BADGE_VARIANT: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  REGISTER: "default",
  RETURN: "secondary",
  EXTEND: "outline",
  REVOKE: "destructive",
}

function formatDateTime(iso: string): string {
  const d = new Date(iso)
  const y = d.getFullYear()
  const M = String(d.getMonth() + 1).padStart(2, "0")
  const D = String(d.getDate()).padStart(2, "0")
  const h = String(d.getHours()).padStart(2, "0")
  const m = String(d.getMinutes()).padStart(2, "0")
  return `${y}.${M}.${D} ${h}:${m}`
}

function getActionLabel(action: string): string {
  return ACTION_LABEL[action] ?? action
}

function getActionBadgeVariant(action: string): "default" | "secondary" | "outline" | "destructive" {
  return ACTION_BADGE_VARIANT[action] ?? "outline"
}

/** 화면 표시 위치 문자열을 v2 API 위치 코드로 변환 */
function toLockerNameV2(location: string | undefined): LockerNameV2 | undefined {
  if (!location?.trim()) return undefined
  const s = location.trim()
  if (s === "SECOND" || s === "THIRD" || s === "FOURTH") return s as LockerNameV2
  const map: Record<string, LockerNameV2> = {
    "2층": "SECOND",
    "3층": "THIRD",
    "4층": "FOURTH",
  }
  return map[s] ?? undefined
}

interface LockerLogsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  locker: Locker | null
}

export function LockerLogsModal({
  open,
  onOpenChange,
  locker,
}: LockerLogsModalProps) {
  const [logPage, setLogPage] = useState(1)
  const pageSize = 10

  const locationNameV2 = locker ? toLockerNameV2(locker.location) : undefined
  const params = {
    page: logPage - 1,
    size: pageSize,
    lockerLocationName: locationNameV2,
    lockerNumber: locker?.number,
  }

  const enabled = open && !!locker && (!!locationNameV2 || locker.number != null)
  const { data, isLoading, error } = useLockerLogs(params, { enabled })
  const effectiveData = enabled ? data : undefined

  const handleOpenChange = (next: boolean) => {
    if (!next) setLogPage(1)
    onOpenChange(next)
  }

  const title = locker
    ? `${locker.location ?? ""} ${locker.number}번 로그`
    : "관련 로그"

  const cellClass = "px-3 py-2.5 text-sm align-middle"
  const headClass = "px-3 py-2.5 text-center align-middle font-semibold bg-muted/50 text-muted-foreground"

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col gap-0 p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle className="text-lg">{title}</DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-auto min-h-0 px-6 pb-6">
          {!enabled ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-full bg-muted p-3 mb-3">
                <FileText className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">사물함을 선택하면 해당 로그를 볼 수 있습니다.</p>
            </div>
          ) : error ? (
            <div className="py-8 text-center">
              <p className="text-sm text-destructive">로그를 불러오는 중 오류가 발생했습니다.</p>
            </div>
          ) : isLoading ? (
            <div className="space-y-2 py-4">
              <Skeleton className="h-9 w-full" />
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : !effectiveData || effectiveData.content.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-full bg-muted p-3 mb-3">
                <FileText className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium text-muted-foreground">해당 사물함 로그가 없습니다</p>
              <p className="text-xs text-muted-foreground mt-1">배정·반납·연장·회수 이력이 없습니다.</p>
            </div>
          ) : (
            <>
              <div className="rounded-lg border overflow-hidden my-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className={headClass} style={{ width: "22%" }}>시간</TableHead>
                      <TableHead className={headClass} style={{ width: "14%" }}>액션</TableHead>
                      <TableHead className={headClass} style={{ width: "28%" }}>사용자</TableHead>
                      <TableHead className={headClass} style={{ width: "36%" }}>메시지</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {effectiveData.content.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className={`${cellClass} text-muted-foreground tabular-nums whitespace-nowrap`}>
                          {formatDateTime(log.createdAt)}
                        </TableCell>
                        <TableCell className={cellClass}>
                          <Badge variant={getActionBadgeVariant(log.action)} className="font-normal text-xs">
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
                        <TableCell className={`${cellClass} text-muted-foreground`}>
                          <span className="line-clamp-2">{log.message}</span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-xs text-muted-foreground">
                  총 {effectiveData.totalElements}건
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setLogPage((p) => Math.max(1, p - 1))}
                    disabled={logPage <= 1}
                  >
                    이전
                  </Button>
                  <span className="text-xs text-muted-foreground tabular-nums min-w-[3rem] text-center">
                    {logPage} / {Math.max(1, effectiveData.totalPages)}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setLogPage((p) => p + 1)}
                    disabled={logPage >= effectiveData.totalPages}
                  >
                    다음
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
