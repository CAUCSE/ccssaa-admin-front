"use client"

import { useEffect, useState } from "react"
import { FormDialog } from "@/components/ui/form-dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import type { HomeEvent, HomeEventRequest } from "@/types/home-event"

const TITLE_MAX = 255
const URL_MAX = 2048
/** 백엔드 EventCreateRequest/EventUpdateRequest 의 @Pattern 과 동일 */
const LANDING_URL_PATTERN = /^https?:\/\/.+/

const emptyForm: HomeEventRequest = { title: "", landingUrl: "", isActive: true }

function validate(form: HomeEventRequest) {
  const title = form.title.trim()
  const landingUrl = form.landingUrl.trim()
  return {
    title: !title
      ? "제목을 입력하세요."
      : title.length > TITLE_MAX
        ? `제목은 ${TITLE_MAX}자 이하여야 합니다.`
        : null,
    landingUrl: !landingUrl
      ? "랜딩 링크를 입력하세요."
      : landingUrl.length > URL_MAX
        ? `링크는 ${URL_MAX}자 이하여야 합니다.`
        : !LANDING_URL_PATTERN.test(landingUrl)
          ? "링크는 http:// 또는 https:// 로 시작해야 합니다."
          : null,
  }
}

interface HomeEventFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** 수정 대상. null 이면 등록 모드 */
  event: HomeEvent | null
  isLoading: boolean
  onSubmit: (data: HomeEventRequest) => void
}

export function HomeEventFormDialog({
  open,
  onOpenChange,
  event,
  isLoading,
  onSubmit,
}: HomeEventFormDialogProps) {
  const [form, setForm] = useState<HomeEventRequest>(emptyForm)
  const [touched, setTouched] = useState({ title: false, landingUrl: false })

  useEffect(() => {
    if (!open) return
    setForm(
      event
        ? { title: event.title, landingUrl: event.landingUrl, isActive: event.isActive }
        : emptyForm
    )
    setTouched({ title: false, landingUrl: false })
  }, [open, event])

  const errors = validate(form)
  const isValid = !errors.title && !errors.landingUrl

  const handleConfirm = () => {
    setTouched({ title: true, landingUrl: true })
    if (!isValid) return
    onSubmit({
      title: form.title.trim(),
      landingUrl: form.landingUrl.trim(),
      isActive: form.isActive,
    })
  }

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={event ? "이벤트 수정" : "이벤트 등록"}
      description={
        event
          ? "제목, 랜딩 링크, 노출 여부를 수정합니다."
          : "등록한 이벤트는 노출 순서 맨 뒤에 추가됩니다."
      }
      confirmText={event ? "수정" : "등록"}
      onConfirm={handleConfirm}
      isLoading={isLoading}
    >
      <div className="space-y-2">
        <Label htmlFor="home-event-title">
          제목 <span className="text-destructive">*</span>
        </Label>
        <Input
          id="home-event-title"
          value={form.title}
          maxLength={TITLE_MAX}
          onChange={(e) => setForm((cur) => ({ ...cur, title: e.target.value }))}
          onBlur={() => setTouched((cur) => ({ ...cur, title: true }))}
          placeholder="예) 2학기 ICT 위원회 백엔드 신청"
          aria-invalid={touched.title && !!errors.title}
        />
        <div className="flex justify-between gap-2 text-xs">
          <span className="text-destructive">{touched.title ? errors.title : null}</span>
          <span className="text-muted-foreground">
            {form.title.length}/{TITLE_MAX}
          </span>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="home-event-landing-url">
          랜딩 링크 <span className="text-destructive">*</span>
        </Label>
        <Input
          id="home-event-landing-url"
          type="url"
          inputMode="url"
          value={form.landingUrl}
          maxLength={URL_MAX}
          onChange={(e) => setForm((cur) => ({ ...cur, landingUrl: e.target.value }))}
          onBlur={() => setTouched((cur) => ({ ...cur, landingUrl: true }))}
          placeholder="https://"
          aria-invalid={touched.landingUrl && !!errors.landingUrl}
        />
        {touched.landingUrl && errors.landingUrl ? (
          <p className="text-xs text-destructive">{errors.landingUrl}</p>
        ) : (
          <p className="text-xs text-muted-foreground">
            앱 홈에서 이벤트를 누르면 이동할 주소입니다.
          </p>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Checkbox
          id="home-event-is-active"
          checked={form.isActive}
          onCheckedChange={(checked) =>
            setForm((cur) => ({ ...cur, isActive: checked === true }))
          }
        />
        <Label htmlFor="home-event-is-active" className="cursor-pointer">
          홈 화면에 노출
        </Label>
      </div>
    </FormDialog>
  )
}
