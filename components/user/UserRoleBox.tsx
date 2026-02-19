"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useUpdateUserRole } from "@/hooks/useUsers"
import { USER_ROLE_CONFIG } from "@/types/user"
import type { UserDetail, UserRole } from "@/types/user"

interface UserRoleBoxProps {
  user: UserDetail
  isMaster: boolean
}

export function UserRoleBox({ user, isMaster }: UserRoleBoxProps) {
  // roles 배열의 첫 번째 역할을 기본값으로 사용 (또는 가장 높은 권한)
  const primaryRole: UserRole = (user.roles && user.roles.length > 0 ? user.roles[0] : "USER") as UserRole
  const [selectedRole, setSelectedRole] = useState<UserRole>(primaryRole)
  const [isEditing, setIsEditing] = useState(false)
  const updateRole = useUpdateUserRole()

  const handleSave = () => {
    if (selectedRole === primaryRole) {
      setIsEditing(false)
      return
    }

    // TODO: API가 string ID를 받도록 수정 필요
    updateRole.mutate(
      { userId: user.id, role: selectedRole },
      {
        onSuccess: () => {
          setIsEditing(false)
        },
      }
    )
  }

  const handleCancel = () => {
    setSelectedRole(primaryRole as UserRole)
    setIsEditing(false)
  }

  if (!isMaster) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>역할</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-2">현재 역할</p>
          <div className="flex flex-wrap gap-1">
            {(user.roles ?? []).map((role) => (
              <Badge key={role} variant="secondary">
                {USER_ROLE_CONFIG[role as UserRole] ?? role}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>역할 관리</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm text-muted-foreground mb-2">현재 역할</p>
          <div className="flex flex-wrap gap-1 mb-4">
            {user.roles.map((role) => (
              <Badge key={role} variant="secondary">
                {role}
              </Badge>
            ))}
          </div>
          <p className="text-sm text-muted-foreground mb-2">역할 선택</p>
          <Select
            value={selectedRole}
            onValueChange={(value) => setSelectedRole(value as UserRole)}
            disabled={!isEditing}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="USER">{USER_ROLE_CONFIG.USER}</SelectItem>
              <SelectItem value="ADMIN">{USER_ROLE_CONFIG.ADMIN}</SelectItem>
              <SelectItem value="MASTER">{USER_ROLE_CONFIG.MASTER}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {isEditing ? (
          <div className="flex gap-2">
            <Button onClick={handleSave} disabled={updateRole.isPending}>
              변경
            </Button>
            <Button variant="outline" onClick={handleCancel}>
              취소
            </Button>
          </div>
        ) : (
          <Button onClick={() => setIsEditing(true)}>역할 변경</Button>
        )}
      </CardContent>
    </Card>
  )
}

