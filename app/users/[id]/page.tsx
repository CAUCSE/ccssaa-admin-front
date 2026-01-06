"use client"

import { useParams, useRouter } from "next/navigation"
import { UserProfileCard } from "@/components/user/UserProfileCard"
import { UserRoleBox } from "@/components/user/UserRoleBox"
import { UserActionFooter } from "@/components/user/UserActionFooter"
import { useUserDetail } from "@/hooks/useUsers"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/layout/PageHeader"

export default function UserDetailPage() {
  const params = useParams()
  const router = useRouter()
  const userId = parseInt(params.id as string, 10)

  const { data: user, isLoading, error } = useUserDetail(userId)

  // TODO: 실제 권한 체크 로직으로 교체
  const currentUserRole = "MASTER" // 임시로 MASTER로 설정
  const isMaster = currentUserRole === "MASTER"

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-muted animate-pulse rounded" />
        <div className="h-64 bg-muted animate-pulse rounded" />
      </div>
    )
  }

  if (error || !user) {
    return (
      <div className="rounded-md border p-12 text-center">
        <p className="text-destructive mb-4">회원 정보를 불러올 수 없습니다.</p>
        <Button variant="outline" onClick={() => router.push("/users")}>
          목록으로 돌아가기
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="회원 상세"
        description="회원 정보를 확인하고 관리할 수 있습니다."
        backHref="/users"
        backLabel="Users"
        breadcrumbs={[{ label: "회원 상세" }]}
      />

      <div className="grid gap-6 md:grid-cols-2">
        <UserProfileCard user={user} />
        <UserRoleBox user={user} isMaster={isMaster} />
      </div>

      <UserActionFooter user={user} isMaster={isMaster} />
    </div>
  )
}

