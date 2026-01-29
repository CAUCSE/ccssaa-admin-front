"use client"

import { useParams, useRouter } from "next/navigation"
import { useBoardsV2, useUpdateBoardV2 } from "@/hooks/usePosts"
import { PageHeader } from "@/components/layout/PageHeader"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
  parseAdminUserIds,
  READ_SCOPES,
  WRITE_SCOPES,
  VISIBILITIES,
} from "@/lib/constants/board-v2-form"
import type {
  BoardCreateRequestV2,
  BoardListItemV2,
  BoardReadScope,
  BoardWriteScope,
  BoardVisibility,
} from "@/types/board-v2"
import { useState, useEffect } from "react"

function sortByDisplayOrder(items: BoardListItemV2[]): BoardListItemV2[] {
  return [...items].sort(
    (a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0)
  )
}

export default function BoardEditPage() {
  const params = useParams()
  const router = useRouter()
  const boardId = params.boardId as string

  const { data: boardsRaw, isLoading } = useBoardsV2()
  const boards = boardsRaw ? sortByDisplayOrder(boardsRaw) : []
  const board = boards.find((b) => b.boardId === boardId)

  const updateBoardV2 = useUpdateBoardV2()

  const [formData, setFormData] = useState<Omit<BoardCreateRequestV2, "boardId">>(defaultV2Form)
  const [adminUserIdsText, setAdminUserIdsText] = useState("")

  useEffect(() => {
    if (!board) return
    setFormData({
      ...defaultV2Form,
      name: board.name,
      description: board.description,
      isAnonymous: board.isAnonymous,
      readScope: board.readScope,
      writeScope: board.writeScope,
      isNotice: board.isNotice,
      visibility: board.visibility,
    })
    setAdminUserIdsText("")
  }, [board])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const adminUserIds = parseAdminUserIds(adminUserIdsText)
    updateBoardV2.mutate(
      {
        ...formData,
        boardId,
        adminUserIds,
      },
      {
        onSuccess: () => router.push("/content/boards"),
      }
    )
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
          <CardHeader>
            <CardTitle>게시판 설정</CardTitle>
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
              <Label htmlFor="edit-adminUserIds">
                관리자 ID (UUID, 쉼표 또는 줄바꿈 구분)
              </Label>
              <Textarea
                id="edit-adminUserIds"
                value={adminUserIdsText}
                onChange={(e) => setAdminUserIdsText(e.target.value)}
                placeholder="예: uuid1, uuid2"
                className="min-h-[60px]"
              />
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
                value={formData.writeScope}
                onValueChange={(value: BoardWriteScope) =>
                  setFormData({ ...formData, writeScope: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
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
    </div>
  )
}
