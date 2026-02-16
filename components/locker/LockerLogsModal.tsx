"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
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

const ACTION_LABEL: Record<string, string> = {
  REGISTER: "배정",
  RETURN: "반납",
  EXTEND: "연장",
  REVOKE: "회수",
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
    ? `관련 로그 — ${locker.location ?? ""} ${locker.number}번`
    : "관련 로그"

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-auto min-h-0">
          {!enabled ? (
            <p className="text-sm text-muted-foreground py-4">
              사물함을 선택하면 해당 사물함의 로그를 볼 수 있습니다.
            </p>
          ) : error ? (
            <p className="text-sm text-destructive py-4">
              로그를 불러오는 중 오류가 발생했습니다.
            </p>
          ) : isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-8 w-full" />
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : !effectiveData || effectiveData.content.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4">
              해당 사물함에 대한 로그가 없습니다.
            </p>
          ) : (
            <>
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[140px]">시간</TableHead>
                      <TableHead className="w-[80px]">액션</TableHead>
                      <TableHead className="w-[160px]">사용자</TableHead>
                      <TableHead className="min-w-0">메시지</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {effectiveData.content.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="text-sm whitespace-nowrap">
                          {formatDateTime(log.createdAt)}
                        </TableCell>
                        <TableCell className="text-sm">
                          {getActionLabel(log.action)}
                        </TableCell>
                        <TableCell className="text-sm whitespace-nowrap">
                          {log.userName}
                          {log.userEmail ? (
                            <span className="text-muted-foreground">
                              {" "}({log.userEmail})
                            </span>
                          ) : null}
                        </TableCell>
                        <TableCell className="text-sm">
                          {log.message}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="flex items-center justify-between pt-3">
                <span className="text-sm text-muted-foreground">
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
                  <span className="text-sm">
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
