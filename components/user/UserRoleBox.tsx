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
  const EDITABLE_ROLES: UserRole[] = ["ADMIN", "COMMON", "NONE"]
  const primaryRole = user.roles?.[0] as UserRole | undefined
  const hasCurrentRole = Boolean(primaryRole)
  const [selectedRole, setSelectedRole] = useState<UserRole | undefined>(primaryRole)
  const [isEditing, setIsEditing] = useState(false)
  const updateRole = useUpdateUserRole()
  const roleOptions = EDITABLE_ROLES.map((role) => [role, USER_ROLE_CONFIG[role]] as [UserRole, string])

  const handleSave = () => {
    if (!primaryRole || !selectedRole) {
      setIsEditing(false)
      return
    }

    if (selectedRole === primaryRole) {
      setIsEditing(false)
      return
    }

    updateRole.mutate(
      { userId: user.id, currentRole: primaryRole, newRole: selectedRole },
      {
        onSuccess: () => {
          setIsEditing(false)
        },
      }
    )
  }

  const handleCancel = () => {
    setSelectedRole(primaryRole)
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
            {(user.roles ?? []).length > 0 ? (
              (user.roles ?? []).map((role) => (
                <Badge key={role} variant="secondary">
                  {USER_ROLE_CONFIG[role as UserRole] ?? role}
                </Badge>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">역할 없음</p>
            )}
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
            {(user.roles ?? []).length > 0 ? (
              (user.roles ?? []).map((role) => (
                <Badge key={role} variant="secondary">
                  {USER_ROLE_CONFIG[role as UserRole] ?? role}
                </Badge>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">역할 없음</p>
            )}
          </div>
          <p className="text-sm text-muted-foreground mb-2">역할 선택</p>
          <Select
            value={selectedRole && EDITABLE_ROLES.includes(selectedRole) ? selectedRole : undefined}
            onValueChange={(value) => setSelectedRole(value as UserRole)}
            disabled={!isEditing || !hasCurrentRole}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {roleOptions.map(([role, label]) => (
                <SelectItem key={role} value={role}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {isEditing ? (
          <div className="flex gap-2">
            <Button onClick={handleSave} disabled={updateRole.isPending || !hasCurrentRole || !selectedRole}>
              변경
            </Button>
            <Button variant="outline" onClick={handleCancel}>
              취소
            </Button>
          </div>
        ) : (
          <Button onClick={() => setIsEditing(true)} disabled={!hasCurrentRole}>
            역할 변경
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

