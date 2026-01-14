"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getStatusBadge } from "@/lib/utils/status-badge"
import type { UserDetail } from "@/types/user"

interface UserProfileCardProps {
  user: UserDetail
}

export function UserProfileCard({ user }: UserProfileCardProps) {
  const statusBadge = getStatusBadge(user.status)

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, "0")}.${String(date.getDate()).padStart(2, "0")}`
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>회원 정보</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground mb-1">이름</p>
            <p className="font-medium">{user.name}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">학번</p>
            <p className="font-mono font-medium">{user.studentNo}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">학과</p>
            <p className="font-medium">{user.department}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">상태</p>
            <Badge variant={statusBadge.variant}>
              {statusBadge.label}
            </Badge>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">연락처</p>
            <p className="font-medium">{user.phone}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">이메일</p>
            <p className="font-medium">{user.email}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">가입일</p>
            <p className="font-medium">{formatDate(user.joinedAt)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

