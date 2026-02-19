"use client"

import { useRouter } from "next/navigation"
import { PageHeader } from "@/components/layout/PageHeader"
import { LockerPolicyForm } from "@/components/locker/LockerPolicyForm"
import { useCreateLockerPolicy, useLockerPolicies } from "@/hooks/useLockerPolicies"
import { validateLockerPolicyForm } from "@/lib/utils/locker-policy-validation"
import type { LockerPolicyFormData } from "@/types/locker-policy"
import { toast } from "sonner"
import { isoToDatetimeLocal } from "@/lib/utils/datetime"

const emptyForm: LockerPolicyFormData = {
  version: "",
  applyStartAt: "",
  applyEndAt: "",
  applyExpiredAt: "",
  extendStartAt: null,
  extendEndAt: null,
  extendExpiredAt: null,
}

export default function NewLockerPolicyPage() {
  const router = useRouter()
  const { data: listData } = useLockerPolicies()
  const createMutation = useCreateLockerPolicy()

  const existingVersions = listData?.content?.map((p) => p.version) ?? []

  const handleSubmit = (form: LockerPolicyFormData) => {
    const errors = validateLockerPolicyForm(form, existingVersions)
    if (errors.length > 0) {
      toast.error(errors.map((e) => e.message).join("\n"))
      return
    }
    const payload: LockerPolicyFormData = {
      version: form.version.trim(),
      applyStartAt: new Date(form.applyStartAt).toISOString(),
      applyEndAt: new Date(form.applyEndAt).toISOString(),
      applyExpiredAt: new Date(form.applyExpiredAt).toISOString(),
      extendStartAt: form.extendStartAt ? new Date(form.extendStartAt).toISOString() : null,
      extendEndAt: form.extendEndAt ? new Date(form.extendEndAt).toISOString() : null,
      extendExpiredAt: form.extendExpiredAt ? new Date(form.extendExpiredAt).toISOString() : null,
    }
    createMutation.mutate(payload, {
      onSuccess: () => {
        router.push("/lockers/policies")
      },
    })
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="사물함 정책 등록"
        description="학기/기간별 사물함 신청·연장 정책을 등록합니다."
        backHref="/lockers/policies"
        backLabel="사물함 정책 관리"
        breadcrumbs={[{ label: "정책 등록" }]}
      />
      <LockerPolicyForm
        initialData={emptyForm}
        submitLabel="등록"
        isLoading={createMutation.isPending}
        onSubmit={handleSubmit}
        toDatetimeLocal={isoToDatetimeLocal}
      />
    </div>
  )
}
