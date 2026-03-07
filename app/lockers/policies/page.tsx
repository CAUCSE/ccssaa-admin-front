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
import { isoToDatetimeLocal, formatDateTime, fromDatetimeLocal } from "@/lib/utils/datetime"
import { toast } from "sonner"
import { AlertDialog } from "@/components/ui/alert-dialog"

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
  const [initialized, setInitialized] = useState(false)
  const [isDirty, setIsDirty] = useState(false)
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean
    title: string
    description: string
    variant: "default" | "destructive"
    action: (() => void) | null
  }>({
    open: false,
    title: "",
    description: "",
    variant: "default",
    action: null,
  })

  useEffect(() => {
    if (!policy) return
    // 이미 초기화되었고, 사용자가 값을 편집 중이면(refetch 등으로) 폼 값을 덮어쓰지 않음
    if (initialized && isDirty) return

    setRegisterStartAt(isoToDatetimeLocal(policy.registerStartAt))
    setRegisterEndAt(isoToDatetimeLocal(policy.registerEndAt))
    setExtendStartAt(isoToDatetimeLocal(policy.extendStartAt))
    setExtendEndAt(isoToDatetimeLocal(policy.extendEndAt))
    setNextExpiredAt(isoToDatetimeLocal(policy.nextExpiredAt))
    setExpiredAt(isoToDatetimeLocal(policy.expiredAt))
    setInitialized(true)
    setIsDirty(false)
  }, [policy, initialized, isDirty])

  const handleSaveRegisterPeriod = () => {
    if (!registerStartAt.trim() || !registerEndAt.trim() || !expiredAt.trim()) return
    registerMutation.mutate(
      {
        registerStartAt: fromDatetimeLocal(registerStartAt),
        registerEndAt: fromDatetimeLocal(registerEndAt),
        expiredAt: fromDatetimeLocal(expiredAt),
      },
      {
        onSuccess: () => {
          toast.success("저장되었습니다.")
          // 서버 값으로 다시 동기화할 수 있도록 초기화 플래그를 리셋
          setInitialized(false)
          setIsDirty(false)
        },
        onError: () => {
          toast.error("신청 기간 저장에 실패했습니다.")
        },
      }
    )
  }

  const handleSaveExtendPeriod = () => {
    if (!extendStartAt.trim() || !extendEndAt.trim() || !nextExpiredAt.trim()) return
    extendMutation.mutate(
      {
        extendStartAt: fromDatetimeLocal(extendStartAt),
        extendEndAt: fromDatetimeLocal(extendEndAt),
        nextExpiredAt: fromDatetimeLocal(nextExpiredAt),
      },
      {
        onSuccess: () => {
          toast.success("저장되었습니다.")
          setInitialized(false)
          setIsDirty(false)
        },
        onError: () => {
          toast.error("연장 기간 저장에 실패했습니다.")
        },
      }
    )
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
            <CardContent className="space-y-4 text-sm">
              {/* 1줄: 신청 기간, 만료일 */}
              <div className="flex flex-wrap items-start gap-6">
                <div>
                  <span className="text-muted-foreground">신청 기간</span>
                  <p className="font-medium mt-0.5 tabular-nums whitespace-nowrap">
                    {formatDateTime(policy.registerStartAt)} ~ {formatDateTime(policy.registerEndAt)}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">만료일</span>
                  <p className="font-medium mt-0.5 tabular-nums whitespace-nowrap">
                    {formatDateTime(policy.expiredAt)}
                  </p>
                </div>
              </div>
              {/* 2줄: 사물함 신청 상태 */}
              <div className="flex flex-col gap-2">
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
                  variant={policy.isLockerAccessEnabled ? "destructive" : "outline"}
                  size="sm"
                  className="w-fit"
                  disabled={registerStatusMutation.isPending}
                  onClick={() => {
                    const nextStatus = !policy.isLockerAccessEnabled
                    setConfirmDialog({
                      open: true,
                      title: nextStatus ? "사물함 신청 활성화" : "사물함 신청 중지",
                      description: nextStatus
                        ? "사물함 신청을 다시 활성화하시겠습니까?"
                        : "사물함 신청을 중지하시겠습니까?",
                      variant: nextStatus ? "default" : "destructive",
                      action: () => {
                        registerStatusMutation.mutate(
                          { status: nextStatus },
                          {
                            onSuccess: () => {
                              toast.success("신청 상태가 변경되었습니다.")
                              setConfirmDialog((prev) => ({
                                ...prev,
                                open: false,
                                action: null,
                                title: "",
                                description: "",
                              }))
                            },
                            onError: () => {
                              toast.error("신청 상태 변경에 실패했습니다.")
                            },
                          }
                        )
                      },
                    })
                  }}
                >
                  {policy.isLockerAccessEnabled ? "중지하기" : "활성화"}
                </Button>
              </div>
              {/* 3줄: 연장 기간, 연장 시 만료일 */}
              <div className="flex flex-wrap items-start gap-6">
                <div>
                  <span className="text-muted-foreground">연장 기간</span>
                  <p className="font-medium mt-0.5 tabular-nums whitespace-nowrap">
                    {formatDateTime(policy.extendStartAt)} ~ {formatDateTime(policy.extendEndAt)}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">연장 시 만료일</span>
                  <p className="font-medium mt-0.5 tabular-nums whitespace-nowrap">
                    {formatDateTime(policy.nextExpiredAt)}
                  </p>
                </div>
              </div>
              {/* 4줄: 사물함 연장 상태 */}
              <div className="flex flex-col gap-2">
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
                  variant={policy.isLockerExtendEnabled ? "destructive" : "outline"}
                  size="sm"
                  className="w-fit"
                  disabled={extendStatusMutation.isPending}
                  onClick={() => {
                    const nextStatus = !policy.isLockerExtendEnabled
                    setConfirmDialog({
                      open: true,
                      title: nextStatus ? "사물함 연장 활성화" : "사물함 연장 중지",
                      description: nextStatus
                        ? "사물함 연장을 다시 활성화하시겠습니까?"
                        : "사물함 연장을 중지하시겠습니까?",
                      variant: nextStatus ? "default" : "destructive",
                      action: () => {
                        extendStatusMutation.mutate(
                          { status: nextStatus },
                          {
                            onSuccess: () => {
                              toast.success("연장 상태가 변경되었습니다.")
                              setConfirmDialog((prev) => ({
                                ...prev,
                                open: false,
                                action: null,
                                title: "",
                                description: "",
                              }))
                            },
                            onError: () => {
                              toast.error("연장 상태 변경에 실패했습니다.")
                            },
                          }
                        )
                      },
                    })
                  }}
                >
                  {policy.isLockerExtendEnabled ? "중지하기" : "활성화"}
                </Button>
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
                    onChange={(e) => {
                      setIsDirty(true)
                      setRegisterStartAt(e.target.value)
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="registerEndAt">신청 종료일시</Label>
                  <Input
                    id="registerEndAt"
                    type="datetime-local"
                    value={registerEndAt}
                    onChange={(e) => {
                      setIsDirty(true)
                      setRegisterEndAt(e.target.value)
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expiredAt">만료일시</Label>
                  <Input
                    id="expiredAt"
                    type="datetime-local"
                    value={expiredAt}
                    onChange={(e) => {
                      setIsDirty(true)
                      setExpiredAt(e.target.value)
                    }}
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
                    onChange={(e) => {
                      setIsDirty(true)
                      setExtendStartAt(e.target.value)
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="extendEndAt">연장 종료일시</Label>
                  <Input
                    id="extendEndAt"
                    type="datetime-local"
                    value={extendEndAt}
                    onChange={(e) => {
                      setIsDirty(true)
                      setExtendEndAt(e.target.value)
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nextExpiredAt">연장 시 만료일시</Label>
                  <Input
                    id="nextExpiredAt"
                    type="datetime-local"
                    value={nextExpiredAt}
                    onChange={(e) => {
                      setIsDirty(true)
                      setNextExpiredAt(e.target.value)
                    }}
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

      {/* 공통 확인 다이얼로그 */}
      <AlertDialog
        open={confirmDialog.open}
        onOpenChange={(open) =>
          setConfirmDialog((prev) => ({
            ...prev,
            open,
          }))
        }
        title={confirmDialog.title}
        description={confirmDialog.description}
        variant={confirmDialog.variant}
        confirmText="확인"
        cancelText="취소"
        onConfirm={() => {
          if (confirmDialog.action) {
            confirmDialog.action()
          }
        }}
        onCancel={() =>
          setConfirmDialog({
            open: false,
            title: "",
            description: "",
            variant: "default",
            action: null,
          })
        }
      />
    </div>
  )
}
