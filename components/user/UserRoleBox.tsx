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
import { useUpdateUserRole } from "@/hooks/useUsers"
import { USER_ROLE_CONFIG } from "@/lib/constants"
import type { UserDetail, UserRole } from "@/types/user"

interface UserRoleBoxProps {
  user: UserDetail
  isMaster: boolean
}

export function UserRoleBox({ user, isMaster }: UserRoleBoxProps) {
  const [selectedRole, setSelectedRole] = useState<UserRole>(user.role)
  const [isEditing, setIsEditing] = useState(false)
  const updateRole = useUpdateUserRole()

  const handleSave = () => {
    if (selectedRole === user.role) {
      setIsEditing(false)
      return
    }

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
    setSelectedRole(user.role)
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
          <p className="font-medium">{USER_ROLE_CONFIG[user.role]}</p>
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

