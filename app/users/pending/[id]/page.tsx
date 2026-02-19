"use client"

import { useParams, useRouter } from "next/navigation"
import { useAdmissionDetail } from "@/hooks/useAdmissions"
import { AdmissionProfileCard } from "@/components/admission/AdmissionProfileCard"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/layout/PageHeader"

export default function AdmissionDetailPage() {
  const params = useParams()
  const router = useRouter()
  const admissionId = params.id as string

  const { data: admission, isLoading, error } = useAdmissionDetail(admissionId)

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-muted animate-pulse rounded" />
        <div className="h-64 bg-muted animate-pulse rounded" />
      </div>
    )
  }

  if (error || !admission) {
    return (
      <div className="rounded-md border p-12 text-center">
        <p className="text-destructive mb-4">
          신청 정보를 불러올 수 없습니다.
        </p>
        <Button
          variant="outline"
          onClick={() => router.push("/users/pending")}
        >
          목록으로 돌아가기
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="인증 신청 상세"
        description="신청자의 상세 정보를 확인하고 승인 또는 거절할 수 있습니다."
        backHref="/users/pending"
        backLabel="가입 인증 심사"
        breadcrumbs={[{ label: admission.userName }]}
      />

      <AdmissionProfileCard admission={admission} />
    </div>
  )
}
