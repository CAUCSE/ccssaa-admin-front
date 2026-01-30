"use client"

import { useParams, useRouter } from "next/navigation"
import { useBoardV2, useUpdateBoardV2, useDeleteBoard } from "@/hooks/usePosts"
import { AlertDialog } from "@/components/ui/alert-dialog"
import { PageHeader } from "@/components/layout/PageHeader"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  defaultV2Form,
  READ_SCOPES,
  WRITE_SCOPES,
  VISIBILITIES,
} from "@/lib/constants/board-v2-form"
import type {
  BoardAdminInfo,
  BoardCreateRequestV2,
  BoardReadScope,
  BoardWriteScope,
  BoardVisibility,
} from "@/types/board-v2"
import { useState, useEffect } from "react"
import { Trash2, Pencil } from "lucide-react"
import { BoardAdminEditModal } from "@/components/content/BoardAdminEditModal"

export default function BoardEditPage() {
  const params = useParams()
  const router = useRouter()
  const boardId = params.boardId as string

  const { data: board, isLoading } = useBoardV2(boardId)
  const updateBoardV2 = useUpdateBoardV2()
  const deleteBoard = useDeleteBoard()

  const [formData, setFormData] = useState<Omit<BoardCreateRequestV2, "boardId">>(defaultV2Form)
  const [admins, setAdmins] = useState<BoardAdminInfo[]>([])
  const [formSynced, setFormSynced] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [adminModalOpen, setAdminModalOpen] = useState(false)

  useEffect(() => {
    if (!board) return
    const writeScope: BoardWriteScope = WRITE_SCOPES.some((o) => o.value === board.writeScope)
      ? board.writeScope
      : defaultV2Form.writeScope
    const readScope: BoardReadScope = READ_SCOPES.some((o) => o.value === board.readScope)
      ? board.readScope
      : defaultV2Form.readScope
    const visibility: BoardVisibility = VISIBILITIES.some((o) => o.value === board.visibility)
      ? board.visibility
      : defaultV2Form.visibility
    setFormData({
      ...defaultV2Form,
      name: board.name,
      description: board.description,
      isAnonymous: board.isAnonymous,
      readScope,
      writeScope,
      isNotice: board.isNotice,
      visibility,
    })
    setAdmins(board.admins ?? [])
    setFormSynced(true)
  }, [board])

  // boardId가 바뀌면 동기화 플래그 리셋 (다른 게시판으로 이동 시)
  useEffect(() => {
    if (!board) setFormSynced(false)
  }, [boardId, board])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const adminUserIds = admins.map((a) => a.id)
    updateBoardV2.mutate({
      ...formData,
      boardId,
      adminUserIds,
    })
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-muted animate-pulse rounded" />
        <div className="h-64 bg-muted animate-pulse rounded" />
      </div>
    )
  }

  if (!board) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="게시판 수정"
          description="게시판 설정을 수정합니다."
          backHref="/content/boards"
          backLabel="게시판 관리"
          breadcrumbs={[{ label: "게시판 수정" }]}
        />
        <div className="rounded-md border p-12 text-center">
          <p className="text-destructive mb-4">게시판을 찾을 수 없습니다.</p>
          <Button variant="outline" onClick={() => router.push("/content/boards")}>
            목록으로 돌아가기
          </Button>
        </div>
      </div>
    )
  }

  // formData가 board와 동기화된 뒤에만 폼 렌더 (Select value가 올바르게 표시되도록)
  if (!formSynced) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-muted animate-pulse rounded" />
        <div className="h-64 bg-muted animate-pulse rounded" />
      </div>
    )
  }

  const handleDeleteConfirm = () => {
    deleteBoard.mutate(Number(boardId), {
      onSuccess: () => router.push("/content/boards"),
    })
    setDeleteDialogOpen(false)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="게시판 수정"
        description="게시판 설정을 수정합니다. (v2 API)"
        backHref="/content/boards"
        backLabel="게시판 관리"
        breadcrumbs={[{ label: board.name }, { label: "수정" }]}
      />

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle>게시판 설정</CardTitle>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="gap-1"
              onClick={() => setDeleteDialogOpen(true)}
              aria-label="게시판 삭제"
            >
              <Trash2 className="h-4 w-4" />
              게시판 삭제
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">게시판명 *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="게시판명을 입력하세요"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">설명 *</Label>
              <Input
                id="edit-description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="게시판 설명을 입력하세요"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <Label>관리자</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-1"
                  onClick={() => setAdminModalOpen(true)}
                  aria-label="관리자 수정"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  수정
                </Button>
              </div>
              <div className="rounded-md border bg-muted/30 px-3 py-2 min-h-[44px]">
                {admins.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    등록된 관리자가 없습니다. 수정 버튼에서 추가할 수 있습니다.
                  </p>
                ) : (
                  <ul className="text-sm space-y-1">
                    {admins.map((admin) => (
                      <li key={admin.id}>
                        {admin.adminEmail?.trim()
                          ? `${admin.adminName}(${admin.adminEmail})`
                          : admin.adminName}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="edit-isAnonymous"
                checked={formData.isAnonymous}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isAnonymous: checked === true })
                }
              />
              <Label htmlFor="edit-isAnonymous" className="cursor-pointer">
                익명 게시판
              </Label>
            </div>
            <div className="space-y-2">
              <Label>읽기 권한</Label>
              <Select
                value={formData.readScope}
                onValueChange={(value: BoardReadScope) =>
                  setFormData({ ...formData, readScope: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {READ_SCOPES.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>쓰기 권한</Label>
              <Select
                value={formData.writeScope ?? defaultV2Form.writeScope}
                onValueChange={(value: BoardWriteScope) =>
                  setFormData({ ...formData, writeScope: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="쓰기 권한 선택" />
                </SelectTrigger>
                <SelectContent>
                  {WRITE_SCOPES.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="edit-isNotice"
                checked={formData.isNotice}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isNotice: checked === true })
                }
              />
              <Label htmlFor="edit-isNotice" className="cursor-pointer">
                알림 가능 게시판
              </Label>
            </div>
            <div className="space-y-2">
              <Label>노출 여부</Label>
              <Select
                value={formData.visibility}
                onValueChange={(value: BoardVisibility) =>
                  setFormData({ ...formData, visibility: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {VISIBILITIES.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/content/boards")}
              >
                취소
              </Button>
              <Button type="submit" disabled={updateBoardV2.isPending}>
                {updateBoardV2.isPending ? "저장 중..." : "수정"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>

      <BoardAdminEditModal
        open={adminModalOpen}
        onOpenChange={setAdminModalOpen}
        admins={admins}
        onApply={setAdmins}
      />

      <AlertDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="게시판 삭제"
        description={`"${board.name}" 게시판을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`}
        confirmText="삭제"
        cancelText="취소"
        variant="destructive"
        onConfirm={handleDeleteConfirm}
      />
    </div>
  )
}
