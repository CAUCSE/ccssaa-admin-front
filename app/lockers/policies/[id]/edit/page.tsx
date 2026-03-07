"use client"

import { useParams, useRouter } from "next/navigation"
import { PageHeader } from "@/components/layout/PageHeader"
import { LockerPolicyForm } from "@/components/locker/LockerPolicyForm"
import { useLockerPolicy, useUpdateLockerPolicy, useLockerPolicies } from "@/hooks/useLockerPolicies"
import { validateLockerPolicyForm } from "@/lib/utils/locker-policy-validation"
import type { LockerPolicyFormData } from "@/types/locker-policy"
import { toast } from "sonner"
import { ErrorMessage } from "@/components/ui/error-message"
import { Skeleton } from "@/components/ui/skeleton"
import { isoToDatetimeLocal } from "@/lib/utils/datetime"

export default function EditLockerPolicyPage() {
  const params = useParams()
  const router = useRouter()
  const id = parseInt(params.id as string, 10)

  const { data: policy, isLoading: policyLoading, error: policyError } = useLockerPolicy(id)
  const { data: listData } = useLockerPolicies()
  const updateMutation = useUpdateLockerPolicy()

  const existingVersions =
    listData?.content?.filter((p) => p.id !== id).map((p) => p.version) ?? []

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
    updateMutation.mutate(
      { id, data: payload },
      {
        onSuccess: () => {
          router.push("/lockers/policies")
        },
      }
    )
  }

  if (policyLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (policyError || !policy) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="사물함 정책 수정"
          backHref="/lockers/policies"
          backLabel="사물함 정책 관리"
        />
        <ErrorMessage message="정책을 불러오지 못했습니다." />
      </div>
    )
  }

  const initialData: LockerPolicyFormData = {
    version: policy.version,
    applyStartAt: policy.applyStartAt,
    applyEndAt: policy.applyEndAt,
    applyExpiredAt: policy.applyExpiredAt,
    extendStartAt: policy.extendStartAt,
    extendEndAt: policy.extendEndAt,
    extendExpiredAt: policy.extendExpiredAt,
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="사물함 정책 수정"
        description="정책 내용을 수정합니다. ACTIVE 상태인 정책도 수정할 수 있습니다."
        backHref="/lockers/policies"
        backLabel="사물함 정책 관리"
        breadcrumbs={[{ label: "정책 수정" }]}
      />
      <LockerPolicyForm
        initialData={initialData}
        submitLabel="저장"
        isLoading={updateMutation.isPending}
        onSubmit={handleSubmit}
        toDatetimeLocal={isoToDatetimeLocal}
      />
    </div>
  )
}
