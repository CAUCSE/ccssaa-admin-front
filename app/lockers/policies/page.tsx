"use client"

import { useState, useEffect } from "react"
import {
  useLockerPolicyV2,
  useUpdateLockerPolicyRegisterPeriodV2,
  useUpdateLockerPolicyExtendPeriodV2,
  useUpdateLockerPolicyRegisterStatusV2,
  useUpdateLockerPolicyExtendStatusV2,
} from "@/hooks/useLockerPolicyV2"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { ErrorMessage } from "@/components/ui/error-message"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, Lock, Unlock } from "lucide-react"

function formatDateTime(iso: string): string {
  if (!iso) return "—"
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return "—"
  const y = d.getFullYear()
  const M = String(d.getMonth() + 1).padStart(2, "0")
  const D = String(d.getDate()).padStart(2, "0")
  const h = String(d.getHours()).padStart(2, "0")
  const m = String(d.getMinutes()).padStart(2, "0")
  return `${y}.${M}.${D} ${h}:${m}`
}

/** ISO 문자열을 datetime-local input value로 변환 */
function toDatetimeLocal(iso: string): string {
  if (!iso) return ""
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ""
  const y = d.getFullYear()
  const M = String(d.getMonth() + 1).padStart(2, "0")
  const D = String(d.getDate()).padStart(2, "0")
  const h = String(d.getHours()).padStart(2, "0")
  const m = String(d.getMinutes()).padStart(2, "0")
  return `${y}-${M}-${D}T${h}:${m}`
}

export default function LockerPoliciesPage() {
  const { data: policy, isLoading, error } = useLockerPolicyV2()
  const registerMutation = useUpdateLockerPolicyRegisterPeriodV2()
  const extendMutation = useUpdateLockerPolicyExtendPeriodV2()
  const registerStatusMutation = useUpdateLockerPolicyRegisterStatusV2()
  const extendStatusMutation = useUpdateLockerPolicyExtendStatusV2()

  const [registerStartAt, setRegisterStartAt] = useState("")
  const [registerEndAt, setRegisterEndAt] = useState("")
  const [extendStartAt, setExtendStartAt] = useState("")
  const [extendEndAt, setExtendEndAt] = useState("")
  const [nextExpiredAt, setNextExpiredAt] = useState("")
  const [expiredAt, setExpiredAt] = useState("")

  useEffect(() => {
    if (!policy) return
    setRegisterStartAt(toDatetimeLocal(policy.registerStartAt))
    setRegisterEndAt(toDatetimeLocal(policy.registerEndAt))
    setExtendStartAt(toDatetimeLocal(policy.extendStartAt))
    setExtendEndAt(toDatetimeLocal(policy.extendEndAt))
    setNextExpiredAt(toDatetimeLocal(policy.nextExpiredAt))
    setExpiredAt(toDatetimeLocal(policy.expiredAt))
  }, [policy])

  const handleSaveRegisterPeriod = () => {
    if (!registerStartAt.trim() || !registerEndAt.trim() || !expiredAt.trim()) return
    registerMutation.mutate({
      registerStartAt: new Date(registerStartAt).toISOString(),
      registerEndAt: new Date(registerEndAt).toISOString(),
      expiredAt: new Date(expiredAt).toISOString(),
    })
  }

  const handleSaveExtendPeriod = () => {
    if (!extendStartAt.trim() || !extendEndAt.trim() || !nextExpiredAt.trim()) return
    extendMutation.mutate({
      extendStartAt: new Date(extendStartAt).toISOString(),
      extendEndAt: new Date(extendEndAt).toISOString(),
      nextExpiredAt: new Date(nextExpiredAt).toISOString(),
    })
  }

  if (error) {
    return <ErrorMessage message="정책을 불러오는 중 오류가 발생했습니다." />
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">신청 정책 관리</h1>
        <p className="text-muted-foreground mt-1">
          사물함 신청 기간, 연장 기간, 만료일을 설정합니다.
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-40 w-full rounded-lg" />
          <Skeleton className="h-52 w-full rounded-lg" />
          <Skeleton className="h-52 w-full rounded-lg" />
          <Skeleton className="h-40 w-full rounded-lg" />
        </div>
      ) : policy ? (
        <>
          {/* 현재 설정 요약 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                현재 설정
              </CardTitle>
              <CardDescription>조회된 정책 값입니다. 아래 카드에서 수정할 수 있습니다.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">신청 기간</span>
                  <p className="font-medium mt-0.5 tabular-nums">
                    {formatDateTime(policy.registerStartAt)} ~ {formatDateTime(policy.registerEndAt)}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">만료일</span>
                  <p className="font-medium mt-0.5 tabular-nums">
                    {formatDateTime(policy.expiredAt)}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">연장 기간</span>
                  <p className="font-medium mt-0.5 tabular-nums">
                    {formatDateTime(policy.extendStartAt)} ~ {formatDateTime(policy.extendEndAt)}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">연장 시 만료일</span>
                  <p className="font-medium mt-0.5 tabular-nums">
                    {formatDateTime(policy.nextExpiredAt)}
                  </p>
                </div>
                <div className="flex flex-col gap-2 sm:col-span-2 lg:col-span-3">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">사물함 신청</span>
                    <Badge variant={policy.isLockerAccessEnabled ? "default" : "secondary"}>
                      {policy.isLockerAccessEnabled ? (
                        <><Unlock className="h-3 w-3 mr-1" /> 사용 가능</>
                      ) : (
                        <><Lock className="h-3 w-3 mr-1" /> 중지</>
                      )}
                    </Badge>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-fit"
                    disabled={registerStatusMutation.isPending}
                    onClick={() =>
                      registerStatusMutation.mutate({
                        status: !policy.isLockerAccessEnabled,
                      })
                    }
                  >
                    {policy.isLockerAccessEnabled ? "중지하기" : "활성화"}
                  </Button>
                </div>
                <div className="flex flex-col gap-2 sm:col-span-2 lg:col-span-3">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">사물함 연장</span>
                    <Badge variant={policy.isLockerExtendEnabled ? "default" : "secondary"}>
                      {policy.isLockerExtendEnabled ? (
                        <><Unlock className="h-3 w-3 mr-1" /> 사용 가능</>
                      ) : (
                        <><Lock className="h-3 w-3 mr-1" /> 중지</>
                      )}
                    </Badge>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-fit"
                    disabled={extendStatusMutation.isPending}
                    onClick={() =>
                      extendStatusMutation.mutate({
                        status: !policy.isLockerExtendEnabled,
                      })
                    }
                  >
                    {policy.isLockerExtendEnabled ? "중지하기" : "활성화"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 신청 기간 + 만료일 설정 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                신청 기간 · 만료일
              </CardTitle>
              <CardDescription>
                사물함 신청 접수 기간과 배정 기본 만료일을 설정합니다.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="registerStartAt">신청 시작일시</Label>
                  <Input
                    id="registerStartAt"
                    type="datetime-local"
                    value={registerStartAt}
                    onChange={(e) => setRegisterStartAt(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="registerEndAt">신청 종료일시</Label>
                  <Input
                    id="registerEndAt"
                    type="datetime-local"
                    value={registerEndAt}
                    onChange={(e) => setRegisterEndAt(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expiredAt">만료일시</Label>
                  <Input
                    id="expiredAt"
                    type="datetime-local"
                    value={expiredAt}
                    onChange={(e) => setExpiredAt(e.target.value)}
                  />
                </div>
              </div>
              <Button
                onClick={handleSaveRegisterPeriod}
                disabled={
                  registerMutation.isPending ||
                  !registerStartAt.trim() ||
                  !registerEndAt.trim() ||
                  !expiredAt.trim()
                }
              >
                {registerMutation.isPending ? "저장 중…" : "저장"}
              </Button>
            </CardContent>
          </Card>

          {/* 연장 기간 설정 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                연장 기간
              </CardTitle>
              <CardDescription>
                사물함 연장 신청 기간과 연장 시 적용될 만료일을 설정합니다.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="extendStartAt">연장 시작일시</Label>
                  <Input
                    id="extendStartAt"
                    type="datetime-local"
                    value={extendStartAt}
                    onChange={(e) => setExtendStartAt(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="extendEndAt">연장 종료일시</Label>
                  <Input
                    id="extendEndAt"
                    type="datetime-local"
                    value={extendEndAt}
                    onChange={(e) => setExtendEndAt(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nextExpiredAt">연장 시 만료일시</Label>
                  <Input
                    id="nextExpiredAt"
                    type="datetime-local"
                    value={nextExpiredAt}
                    onChange={(e) => setNextExpiredAt(e.target.value)}
                  />
                </div>
              </div>
              <Button
                onClick={handleSaveExtendPeriod}
                disabled={
                  extendMutation.isPending ||
                  !extendStartAt.trim() ||
                  !extendEndAt.trim() ||
                  !nextExpiredAt.trim()
                }
              >
                {extendMutation.isPending ? "저장 중…" : "저장"}
              </Button>
            </CardContent>
          </Card>
        </>
      ) : (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center text-muted-foreground">
            정책 데이터를 불러올 수 없습니다.
          </CardContent>
        </Card>
      )}
    </div>
  )
}
