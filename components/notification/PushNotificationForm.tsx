"use client"

import { Suspense, useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { PageHeader } from "@/components/layout/PageHeader"
import { usePushAdminNotification } from "@/hooks/useNotifications"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { FormField } from "@/components/ui/form-field"
import { FormDialog } from "@/components/ui/form-dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { AdminPushNotificationRequest } from "@/lib/api/v2/notifications"

interface PushNotificationFormProps {
  initialUserId?: string
  isLoading?: boolean
  resetSignal?: number
  onSubmit: (data: AdminPushNotificationRequest) => void
}

export function PushNotificationForm({
  initialUserId = "",
  isLoading,
  resetSignal = 0,
  onSubmit,
}: PushNotificationFormProps) {
  const [userId, setUserId] = useState(initialUserId)
  const [title, setTitle] = useState("")
  const [body, setBody] = useState("")
  const [saveNotification, setSaveNotification] = useState(true)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [errors, setErrors] = useState<{
    userId?: string
    title?: string
    body?: string
  }>({})

  useEffect(() => {
    if (initialUserId) {
      setUserId(initialUserId)
    }
  }, [initialUserId])

  useEffect(() => {
    if (resetSignal === 0) {
      return
    }
    setTitle("")
    setBody("")
    setSaveNotification(true)
    setErrors({})
    setConfirmOpen(false)
    if (!initialUserId) {
      setUserId("")
    }
  }, [resetSignal, initialUserId])

  const validate = () => {
    const nextErrors: typeof errors = {}
    if (!userId.trim()) {
      nextErrors.userId = "수신 유저 ID를 입력해주세요."
    }
    if (!title.trim()) {
      nextErrors.title = "알림 제목을 입력해주세요."
    }
    if (!body.trim()) {
      nextErrors.body = "알림 내용을 입력해주세요."
    }
    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const buildPayload = (): AdminPushNotificationRequest => ({
    userId: userId.trim(),
    title: title.trim(),
    body: body.trim(),
    saveNotification,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) {
      return
    }
    setConfirmOpen(true)
  }

  const handleConfirm = () => {
    onSubmit(buildPayload())
  }

  return (
    <>
      <form onSubmit={handleSubmit}>
        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>알림 내용</CardTitle>
            <CardDescription>
              지정한 회원에게 커스텀 푸시 알림을 전송합니다.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              id="userId"
              label="수신 유저 ID *"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="UUID"
              error={errors.userId}
              helperText="회원 상세 페이지의 유저 ID를 입력하세요."
              disabled={isLoading}
            />

            <FormField
              id="title"
              label="알림 제목 *"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="알림 제목"
              error={errors.title}
              disabled={isLoading}
            />

            <div className="space-y-2">
              <Label htmlFor="body" className={errors.body ? "text-red-500" : undefined}>
                알림 내용 *
              </Label>
              <Textarea
                id="body"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="알림 내용"
                rows={5}
                disabled={isLoading}
                className={errors.body ? "border-red-500 focus-visible:ring-red-500" : undefined}
                aria-invalid={!!errors.body}
              />
              {errors.body && (
                <p className="text-sm text-red-500">{errors.body}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="saveNotification">알림함 저장</Label>
              <p className="text-sm text-muted-foreground">
                체크 시 알림함에 저장되며, 해제 시 푸시만 전송됩니다.
              </p>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="saveNotification"
                  checked={saveNotification}
                  onCheckedChange={setSaveNotification}
                  disabled={isLoading}
                />
                <Label htmlFor="saveNotification" className="font-normal cursor-pointer">
                  알림함에 저장
                </Label>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "전송 중..." : "알림 전송"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>

      <FormDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="알림 전송 확인"
        description="아래 내용으로 알림을 전송합니다. 계속하시겠습니까?"
        confirmText="전송"
        cancelText="취소"
        onConfirm={handleConfirm}
        isLoading={isLoading}
      >
        <dl className="space-y-3 text-sm">
          <div>
            <dt className="text-muted-foreground">수신 유저 ID</dt>
            <dd className="mt-1 font-medium">{userId.trim()}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">제목</dt>
            <dd className="mt-1 font-medium">{title.trim()}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">내용</dt>
            <dd className="mt-1 font-medium whitespace-pre-wrap">{body.trim()}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">알림함 저장</dt>
            <dd className="mt-1 font-medium">
              {saveNotification ? "저장 후 전송" : "푸시만 전송"}
            </dd>
          </div>
        </dl>
      </FormDialog>
    </>
  )
}

function PushNotificationPageContent() {
  const searchParams = useSearchParams()
  const initialUserId = searchParams.get("userId") ?? ""
  const pushMutation = usePushAdminNotification()

  const [resetSignal, setResetSignal] = useState(0)

  const handleSubmit = (data: AdminPushNotificationRequest) => {
    pushMutation.mutate(data, {
      onSuccess: () => {
        setResetSignal((prev) => prev + 1)
      },
    })
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="알림 발송"
        description="특정 회원에게 커스텀 푸시 알림을 전송합니다."
        breadcrumbs={[{ label: "알림 발송" }]}
      />
      <PushNotificationForm
        initialUserId={initialUserId}
        isLoading={pushMutation.isPending}
        resetSignal={resetSignal}
        onSubmit={handleSubmit}
      />
    </div>
  )
}

export function PushNotificationPage() {
  return (
    <Suspense fallback={<div className="p-6 text-muted-foreground">로딩 중...</div>}>
      <PushNotificationPageContent />
    </Suspense>
  )
}
