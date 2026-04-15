"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { LockerPolicyFormData } from "@/types/locker-policy"

export interface LockerPolicyFormProps {
  initialData: LockerPolicyFormData
  submitLabel: string
  isLoading?: boolean
  onSubmit: (data: LockerPolicyFormData) => void
  /** ISO 문자열을 datetime-local value로 변환 */
  toDatetimeLocal: (iso: string) => string
}

export function LockerPolicyForm({
  initialData,
  submitLabel,
  isLoading,
  onSubmit,
  toDatetimeLocal,
}: LockerPolicyFormProps) {
  const [version, setVersion] = useState(initialData.version)
  const [applyStartAt, setApplyStartAt] = useState(
    initialData.applyStartAt ? toDatetimeLocal(initialData.applyStartAt) : ""
  )
  const [applyEndAt, setApplyEndAt] = useState(
    initialData.applyEndAt ? toDatetimeLocal(initialData.applyEndAt) : ""
  )
  const [applyExpiredAt, setApplyExpiredAt] = useState(
    initialData.applyExpiredAt ? toDatetimeLocal(initialData.applyExpiredAt) : ""
  )
  const [extendStartAt, setExtendStartAt] = useState(
    initialData.extendStartAt ? toDatetimeLocal(initialData.extendStartAt) : ""
  )
  const [extendEndAt, setExtendEndAt] = useState(
    initialData.extendEndAt ? toDatetimeLocal(initialData.extendEndAt) : ""
  )
  const [extendExpiredAt, setExtendExpiredAt] = useState(
    initialData.extendExpiredAt ? toDatetimeLocal(initialData.extendExpiredAt) : ""
  )

  useEffect(() => {
    setVersion(initialData.version)
    setApplyStartAt(initialData.applyStartAt ? toDatetimeLocal(initialData.applyStartAt) : "")
    setApplyEndAt(initialData.applyEndAt ? toDatetimeLocal(initialData.applyEndAt) : "")
    setApplyExpiredAt(initialData.applyExpiredAt ? toDatetimeLocal(initialData.applyExpiredAt) : "")
    setExtendStartAt(initialData.extendStartAt ? toDatetimeLocal(initialData.extendStartAt) : "")
    setExtendEndAt(initialData.extendEndAt ? toDatetimeLocal(initialData.extendEndAt) : "")
    setExtendExpiredAt(initialData.extendExpiredAt ? toDatetimeLocal(initialData.extendExpiredAt) : "")
  }, [initialData, toDatetimeLocal])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      version,
      applyStartAt,
      applyEndAt,
      applyExpiredAt,
      extendStartAt: extendStartAt || null,
      extendEndAt: extendEndAt || null,
      extendExpiredAt: extendExpiredAt || null,
    })
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>정책 정보</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="version">버전 *</Label>
            <Input
              id="version"
              value={version}
              onChange={(e) => setVersion(e.target.value)}
              placeholder="예: 2025-1"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <Label htmlFor="applyStartAt">신청 시작일시 *</Label>
              <Input
                id="applyStartAt"
                type="datetime-local"
                value={applyStartAt}
                onChange={(e) => setApplyStartAt(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="applyEndAt">신청 종료일시 *</Label>
              <Input
                id="applyEndAt"
                type="datetime-local"
                value={applyEndAt}
                onChange={(e) => setApplyEndAt(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="applyExpiredAt">신청 만료일시 *</Label>
              <Input
                id="applyExpiredAt"
                type="datetime-local"
                value={applyExpiredAt}
                onChange={(e) => setApplyExpiredAt(e.target.value)}
              />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <Label htmlFor="extendStartAt">연장 시작일시 (선택)</Label>
              <Input
                id="extendStartAt"
                type="datetime-local"
                value={extendStartAt}
                onChange={(e) => setExtendStartAt(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="extendEndAt">연장 종료일시 (선택)</Label>
              <Input
                id="extendEndAt"
                type="datetime-local"
                value={extendEndAt}
                onChange={(e) => setExtendEndAt(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="extendExpiredAt">연장 만료일시 (선택)</Label>
              <Input
                id="extendExpiredAt"
                type="datetime-local"
                value={extendExpiredAt}
                onChange={(e) => setExtendExpiredAt(e.target.value)}
              />
            </div>
          </div>
          <div className="flex justify-end pt-4">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "저장 중..." : submitLabel}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  )
}
