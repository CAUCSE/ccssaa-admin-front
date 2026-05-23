"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getStatusBadge } from "@/lib/utils/status-badge"
import type { UserDetail, AcademicStatus } from "@/types/user"
import { ACADEMIC_STATUS_CONFIG, DEPARTMENT_CONFIG } from "@/types/user"
import { StorageImage } from "@/components/ui/storage-image"

interface UserProfileCardProps {
  user: UserDetail
}

export function UserProfileCard({ user }: UserProfileCardProps) {
  const statusBadge = getStatusBadge(user.state)

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, "0")}.${String(date.getDate()).padStart(2, "0")}`
  }

  const getDepartmentLabel = (code: string) => {
    return DEPARTMENT_CONFIG[code as keyof typeof DEPARTMENT_CONFIG] ?? code
  }

  const getAcademicStatusLabel = (status: AcademicStatus) => {
    return ACADEMIC_STATUS_CONFIG[status] ?? ""
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <CardTitle>회원 정보</CardTitle>
          <Badge variant={statusBadge.variant}>{statusBadge.label}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 프로필 이미지 */}
        {user.profileImageUrl && (
          <div className="flex justify-center mb-4">
            <div className="relative h-24 w-24 overflow-hidden rounded-full border bg-muted">
              <StorageImage
                src={user.profileImageUrl}
                alt={`${user.name} 프로필`}
                fill
                className="object-cover"
              />
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground mb-1">이름</p>
            <p className="font-medium">{user.name}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">닉네임</p>
            <p className="font-medium">{user.nickname}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">학번</p>
            <p className="font-mono font-medium">{user.studentId}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">학부</p>
            <p className="font-medium">{getDepartmentLabel(user.department)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">학적 상태</p>
            <p className="font-medium">{getAcademicStatusLabel(user.academicStatus)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">상태</p>
            <p className="font-medium">{statusBadge.label}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">연락처</p>
            <p className="font-medium">{user.phoneNumber}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">이메일</p>
            <p className="font-medium">{user.email}</p>
          </div>
          {(user.state === "REJECT" || user.state === "DROP") && user.rejectionOrDropReason && (
            <div className="col-span-2">
              <p className="text-sm text-muted-foreground mb-1">
                {user.state === "REJECT" ? "거부 사유" : "추방 사유"}
              </p>
              <p className="rounded-md border border-[hsl(var(--danger-border))] bg-[hsl(var(--danger-background))] px-3 py-2 text-sm font-medium text-[hsl(var(--danger))]">{user.rejectionOrDropReason}</p>
            </div>
          )}
          <div>
            <p className="text-sm text-muted-foreground mb-1">가입일</p>
            <p className="font-medium">{formatDate(user.createdAt)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

