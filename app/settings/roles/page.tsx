"use client"

import { useState } from "react"
import { useRoles, useCreateRole, useUpdateRole, useDeleteRole, usePermissions } from "@/hooks/useSettings"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { FormDialog } from "@/components/ui/form-dialog"
import { AlertDialog } from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Plus, Pencil, Trash2 } from "lucide-react"
import type { Role } from "@/types/settings"

export default function RolesPage() {
  const { data: roles, isLoading } = useRoles()
  const { data: permissions } = usePermissions()
  const createRole = useCreateRole()
  const updateRole = useUpdateRole()
  const deleteRole = useDeleteRole()

  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    permissions: [] as string[],
  })

  const handleCreate = () => {
    setFormData({ name: "", description: "", permissions: [] })
    setCreateDialogOpen(true)
  }

  const handleEdit = (role: Role) => {
    setSelectedRole(role)
    setFormData({
      name: role.name,
      description: role.description,
      permissions: role.permissions,
    })
    setEditDialogOpen(true)
  }

  const handleDelete = (role: Role) => {
    setSelectedRole(role)
    setDeleteDialogOpen(true)
  }

  const handleCreateSubmit = () => {
    createRole.mutate(formData, {
      onSuccess: () => {
        setCreateDialogOpen(false)
        setFormData({ name: "", description: "", permissions: [] })
      },
    })
  }

  const handleEditSubmit = () => {
    if (!selectedRole) return
    updateRole.mutate(
      { roleId: selectedRole.id, data: formData },
      {
        onSuccess: () => {
          setEditDialogOpen(false)
          setSelectedRole(null)
          setFormData({ name: "", description: "", permissions: [] })
        },
      }
    )
  }

  const handleDeleteConfirm = () => {
    if (!selectedRole) return
    deleteRole.mutate(selectedRole.id, {
      onSuccess: () => {
        setDeleteDialogOpen(false)
        setSelectedRole(null)
      },
    })
  }

  const togglePermission = (permissionId: string) => {
    setFormData((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(permissionId)
        ? prev.permissions.filter((p) => p !== permissionId)
        : [...prev.permissions, permissionId],
    }))
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 bg-muted animate-pulse rounded" />
        <div className="h-64 bg-muted animate-pulse rounded" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">권한 및 역할 관리</h1>
          <p className="text-muted-foreground mt-1">역할을 생성, 수정, 삭제할 수 있습니다. (Master 전용)</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          역할 생성
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>역할 목록</CardTitle>
        </CardHeader>
        <CardContent>
          {!roles || roles.length === 0 ? (
            <div className="rounded-md border p-12 text-center">
              <p className="text-muted-foreground">등록된 역할이 없습니다.</p>
            </div>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-left">역할명</TableHead>
                    <TableHead className="text-left">설명</TableHead>
                    <TableHead className="text-center">권한 수</TableHead>
                    <TableHead className="text-center">사용자 수</TableHead>
                    <TableHead className="text-center">관리</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {roles.map((role) => (
                    <TableRow key={role.id}>
                      <TableCell className="text-left font-medium">{role.name}</TableCell>
                      <TableCell className="text-left text-muted-foreground">
                        {role.description}
                      </TableCell>
                      <TableCell className="text-center">
                        {role.permissions.includes("*") ? "전체" : role.permissions.length}
                      </TableCell>
                      <TableCell className="text-center">{role.userCount}</TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(role)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(role)}
                            disabled={role.userCount > 0}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 생성 모달 */}
      <FormDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        title="역할 생성"
        description="새로운 역할을 생성합니다."
        confirmText="생성"
        onConfirm={handleCreateSubmit}
        isLoading={createRole.isPending}
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="create-name">역할명 *</Label>
            <Input
              id="create-name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="역할명을 입력하세요"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="create-description">설명 *</Label>
            <Input
              id="create-description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="역할 설명을 입력하세요"
            />
          </div>
          <div className="space-y-2">
            <Label>권한 선택</Label>
            <div className="max-h-48 overflow-y-auto border rounded-md p-4 space-y-2">
              {permissions?.map((permission) => (
                <label
                  key={permission.id}
                  className="flex items-center gap-2 cursor-pointer hover:bg-muted p-2 rounded"
                >
                  <input
                    type="checkbox"
                    checked={formData.permissions.includes(permission.id)}
                    onChange={() => togglePermission(permission.id)}
                    className="rounded"
                  />
                  <div className="flex-1">
                    <div className="font-medium">{permission.name}</div>
                    <div className="text-sm text-muted-foreground">{permission.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>
      </FormDialog>

      {/* 수정 모달 */}
      <FormDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        title="역할 수정"
        description="역할 정보를 수정합니다."
        confirmText="수정"
        onConfirm={handleEditSubmit}
        isLoading={updateRole.isPending}
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-name">역할명 *</Label>
            <Input
              id="edit-name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="역할명을 입력하세요"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-description">설명 *</Label>
            <Input
              id="edit-description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="역할 설명을 입력하세요"
            />
          </div>
          <div className="space-y-2">
            <Label>권한 선택</Label>
            <div className="max-h-48 overflow-y-auto border rounded-md p-4 space-y-2">
              {permissions?.map((permission) => (
                <label
                  key={permission.id}
                  className="flex items-center gap-2 cursor-pointer hover:bg-muted p-2 rounded"
                >
                  <input
                    type="checkbox"
                    checked={formData.permissions.includes(permission.id)}
                    onChange={() => togglePermission(permission.id)}
                    className="rounded"
                  />
                  <div className="flex-1">
                    <div className="font-medium">{permission.name}</div>
                    <div className="text-sm text-muted-foreground">{permission.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>
      </FormDialog>

      {/* 삭제 확인 모달 */}
      <AlertDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="역할 삭제"
        description={`"${selectedRole?.name}" 역할을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`}
        confirmText="삭제"
        cancelText="취소"
        variant="destructive"
        onConfirm={handleDeleteConfirm}
      />
    </div>
  )
}
