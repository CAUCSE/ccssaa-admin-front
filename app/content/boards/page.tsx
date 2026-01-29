"use client"

import { useState } from "react"
import {
  useBoardsV2,
  useCreateBoardV2,
  useUpdateBoardV2,
  useUpdateBoardOrdersV2,
  useDeleteBoard,
} from "@/hooks/usePosts"
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
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
import { Plus, Pencil, Trash2, GripVertical } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import type {
  BoardCreateRequestV2,
  BoardListItemV2,
  BoardReadScope,
  BoardWriteScope,
  BoardVisibility,
} from "@/types/board-v2"

/** BoardReadScope: ENROLLED 재학생, GRADUATED 졸업생, BOTH 모두 */
const READ_SCOPES: { value: BoardReadScope; label: string }[] = [
  { value: "BOTH", label: "모두" },
  { value: "ENROLLED", label: "재학생" },
  { value: "GRADUATED", label: "졸업생" },
]

/** BoardWriteScope: ALL_USER 일반 유저 작성 가능, ONLY_ADMIN 게시판 관리자만 작성 가능 */
const WRITE_SCOPES: { value: BoardWriteScope; label: string }[] = [
  { value: "ALL_USER", label: "일반 유저 작성 가능" },
  { value: "ONLY_ADMIN", label: "게시판 관리자만 작성 가능" },
]

/** BoardVisibility: VISIBLE 보임, HIDDEN 안 보임 */
const VISIBILITIES: { value: BoardVisibility; label: string }[] = [
  { value: "VISIBLE", label: "보임" },
  { value: "HIDDEN", label: "안 보임" },
]

function readScopeLabel(value: BoardReadScope): string {
  return READ_SCOPES.find((o) => o.value === value)?.label ?? value
}
function writeScopeLabel(value: BoardWriteScope): string {
  return WRITE_SCOPES.find((o) => o.value === value)?.label ?? value
}
function visibilityLabel(value: BoardVisibility): string {
  return VISIBILITIES.find((o) => o.value === value)?.label ?? value
}

const defaultV2Form: Omit<BoardCreateRequestV2, "boardId"> = {
  name: "",
  description: "",
  adminUserIds: [],
  isAnonymous: false,
  readScope: "BOTH",
  writeScope: "ONLY_ADMIN",
  isNotice: false,
  visibility: "VISIBLE",
}

function parseAdminUserIds(value: string): string[] {
  return value
    .split(/[\n,]+/)
    .map((s) => s.trim())
    .filter(Boolean)
}

/** display_order 기준 정렬 (없으면 0으로 처리) */
function sortByDisplayOrder(items: BoardListItemV2[]): BoardListItemV2[] {
  return [...items].sort(
    (a, b) => (a.display_order ?? 0) - (b.display_order ?? 0)
  )
}

export default function BoardsPage() {
  const { data: boardsRaw, isLoading } = useBoardsV2()
  const boards = boardsRaw ? sortByDisplayOrder(boardsRaw) : []
  const createBoardV2 = useCreateBoardV2()
  const updateBoardV2 = useUpdateBoardV2()
  const updateBoardOrdersV2 = useUpdateBoardOrdersV2()
  const deleteBoard = useDeleteBoard()

  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [orderDialogOpen, setOrderDialogOpen] = useState(false)
  const [orderBoardIds, setOrderBoardIds] = useState<string[]>([])
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [selectedBoard, setSelectedBoard] = useState<BoardListItemV2 | null>(null)

  const [formData, setFormData] = useState(defaultV2Form)
  const [adminUserIdsText, setAdminUserIdsText] = useState("")
  const [editFormData, setEditFormData] = useState(defaultV2Form)
  const [editAdminUserIdsText, setEditAdminUserIdsText] = useState("")

  const handleCreate = () => {
    setFormData(defaultV2Form)
    setAdminUserIdsText("")
    setCreateDialogOpen(true)
  }

  const handleEdit = (board: BoardListItemV2) => {
    setSelectedBoard(board)
    setEditFormData({
      ...defaultV2Form,
      name: board.name,
      description: board.description,
      isAnonymous: board.isAnonymous,
      readScope: board.readScope,
      writeScope: board.writeScope,
      isNotice: board.isNotice,
      visibility: board.visibility,
    })
    setEditAdminUserIdsText("")
    setEditDialogOpen(true)
  }

  const handleDelete = (board: BoardListItemV2) => {
    setSelectedBoard(board)
    setDeleteDialogOpen(true)
  }

  const handleOrderOpen = () => {
    setOrderBoardIds(boards.map((b) => b.boardId))
    setOrderDialogOpen(true)
  }

  const handleOrderSave = () => {
    updateBoardOrdersV2.mutate(orderBoardIds, {
      onSuccess: () => setOrderDialogOpen(false),
    })
  }

  const boardById = (id: string) => boards.find((b) => b.boardId === id)

  const handleOrderDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index)
    e.dataTransfer.effectAllowed = "move"
    e.dataTransfer.setData("text/plain", String(index))
  }

  const handleOrderDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
  }

  const handleOrderDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault()
    setDraggedIndex(null)
    const dragIndex = Number(e.dataTransfer.getData("text/plain"))
    if (Number.isNaN(dragIndex) || dragIndex === dropIndex) return
    const next = [...orderBoardIds]
    const [removed] = next.splice(dragIndex, 1)
    next.splice(dropIndex, 0, removed)
    setOrderBoardIds(next)
  }

  const handleCreateSubmit = () => {
    const adminUserIds = parseAdminUserIds(adminUserIdsText)
    createBoardV2.mutate(
      { ...formData, adminUserIds },
      {
        onSuccess: () => {
          setCreateDialogOpen(false)
          setFormData(defaultV2Form)
          setAdminUserIdsText("")
        },
      }
    )
  }

  const handleEditSubmit = () => {
    if (!selectedBoard) return
    const adminUserIds = parseAdminUserIds(editAdminUserIdsText)
    updateBoardV2.mutate(
      {
        ...editFormData,
        boardId: selectedBoard.boardId,
        adminUserIds,
      },
      {
        onSuccess: () => {
          setEditDialogOpen(false)
          setSelectedBoard(null)
          setEditFormData(defaultV2Form)
          setEditAdminUserIdsText("")
        },
      }
    )
  }

  const handleDeleteConfirm = () => {
    if (!selectedBoard) return
    deleteBoard.mutate(Number(selectedBoard.boardId), {
      onSuccess: () => {
        setDeleteDialogOpen(false)
        setSelectedBoard(null)
      },
    })
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                {Array.from({ length: 5 }).map((_, i) => (
                  <TableHead key={i}>
                    <div className="h-4 w-20 bg-muted animate-pulse rounded" />
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 5 }).map((_, j) => (
                    <TableCell key={j}>
                      <div className="h-4 w-24 bg-muted animate-pulse rounded" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">게시판 관리</h1>
          <p className="text-muted-foreground mt-1">게시판을 생성, 수정, 삭제할 수 있습니다.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleOrderOpen} disabled={!boards?.length}>
            <GripVertical className="mr-2 h-4 w-4" />
            정렬 수정
          </Button>
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" />
            게시판 생성
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>게시판 목록</CardTitle>
        </CardHeader>
        <CardContent>
          {!boards || boards.length === 0 ? (
            <div className="rounded-md border p-12 text-center">
              <p className="text-muted-foreground">등록된 게시판이 없습니다.</p>
            </div>
          ) : (
            <div className="rounded-lg border overflow-x-auto bg-card [&_tbody_td]:py-5">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="text-center w-12">No</TableHead>
                    <TableHead className="text-left w-48 min-w-[160px]">게시판명</TableHead>
                    <TableHead className="text-left min-w-[240px]">설명</TableHead>
                    <TableHead className="text-center w-20">익명</TableHead>
                    <TableHead className="text-center w-28 whitespace-nowrap">읽기 권한</TableHead>
                    <TableHead className="text-center w-32 whitespace-nowrap">쓰기 권한</TableHead>
                    <TableHead className="text-center w-20">알림</TableHead>
                    <TableHead className="text-center w-24">노출</TableHead>
                    <TableHead className="text-center w-[88px] shrink-0">관리</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {boards.map((board, index) => (
                    <TableRow key={board.boardId}>
                      <TableCell className="text-center w-12 text-muted-foreground font-medium">
                        {index + 1}
                      </TableCell>
                      <TableCell className="text-left w-48 min-w-[160px] font-medium">
                        {board.name}
                      </TableCell>
                      <TableCell className="text-left min-w-[240px] text-muted-foreground text-sm">
                        {board.description}
                      </TableCell>
                      <TableCell className="text-center w-20">
                        <Badge variant="outline" className="font-normal">
                          {board.isAnonymous ? "Y" : "N"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center w-28 whitespace-nowrap">
                        <Badge variant="secondary" className="font-normal">
                          {readScopeLabel(board.readScope)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center w-32 whitespace-nowrap">
                        <Badge variant="secondary" className="font-normal">
                          {writeScopeLabel(board.writeScope)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center w-20">
                        <Badge variant="outline" className="font-normal">
                          {board.isNotice ? "Y" : "N"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center w-24">
                        <Badge
                          variant={board.visibility === "VISIBLE" ? "default" : "outline"}
                          className="font-normal"
                        >
                          {visibilityLabel(board.visibility)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center w-[88px] shrink-0">
                        <div className="flex items-center justify-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleEdit(board)}
                            aria-label="수정"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => handleDelete(board)}
                            aria-label="삭제"
                          >
                            <Trash2 className="h-4 w-4" />
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

      {/* v2 게시판 생성 모달 */}
      <FormDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        title="게시판 생성"
        description="새로운 게시판을 생성합니다. (v2 API)"
        confirmText="생성"
        onConfirm={handleCreateSubmit}
        isLoading={createBoardV2.isPending}
      >
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
          <div className="space-y-2">
            <Label htmlFor="create-name">게시판명 *</Label>
            <Input
              id="create-name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="게시판명을 입력하세요"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="create-description">설명 *</Label>
            <Input
              id="create-description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="게시판 설명을 입력하세요"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="create-adminUserIds">관리자 ID (UUID, 쉼표 또는 줄바꿈 구분)</Label>
            <Textarea
              id="create-adminUserIds"
              value={adminUserIdsText}
              onChange={(e) => setAdminUserIdsText(e.target.value)}
              placeholder="예: uuid1, uuid2"
              className="min-h-[60px]"
            />
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="create-isAnonymous"
              checked={formData.isAnonymous}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, isAnonymous: checked === true })
              }
            />
            <Label htmlFor="create-isAnonymous" className="cursor-pointer">
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
              id="create-isNotice"
              checked={formData.isNotice}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, isNotice: checked === true })
              }
            />
            <Label htmlFor="create-isNotice" className="cursor-pointer">
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
        </div>
      </FormDialog>

      {/* 수정 모달 (v2 API: PUT /api/v2/admin/boards) */}
      <FormDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        title="게시판 수정"
        description="게시판 설정을 수정합니다. (v2 API)"
        confirmText="수정"
        onConfirm={handleEditSubmit}
        isLoading={updateBoardV2.isPending}
      >
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
          <div className="space-y-2">
            <Label htmlFor="edit-name">게시판명 *</Label>
            <Input
              id="edit-name"
              value={editFormData.name}
              onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
              placeholder="게시판명을 입력하세요"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-description">설명 *</Label>
            <Input
              id="edit-description"
              value={editFormData.description}
              onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
              placeholder="게시판 설명을 입력하세요"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-adminUserIds">관리자 ID (UUID, 쉼표 또는 줄바꿈 구분)</Label>
            <Textarea
              id="edit-adminUserIds"
              value={editAdminUserIdsText}
              onChange={(e) => setEditAdminUserIdsText(e.target.value)}
              placeholder="예: uuid1, uuid2"
              className="min-h-[60px]"
            />
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="edit-isAnonymous"
              checked={editFormData.isAnonymous}
              onCheckedChange={(checked) =>
                setEditFormData({ ...editFormData, isAnonymous: checked === true })
              }
            />
            <Label htmlFor="edit-isAnonymous" className="cursor-pointer">
              익명 게시판
            </Label>
          </div>
          <div className="space-y-2">
            <Label>읽기 권한</Label>
            <Select
              value={editFormData.readScope}
              onValueChange={(value: BoardReadScope) =>
                setEditFormData({ ...editFormData, readScope: value })
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
              value={editFormData.writeScope}
              onValueChange={(value: BoardWriteScope) =>
                setEditFormData({ ...editFormData, writeScope: value })
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
              checked={editFormData.isNotice}
              onCheckedChange={(checked) =>
                setEditFormData({ ...editFormData, isNotice: checked === true })
              }
            />
            <Label htmlFor="edit-isNotice" className="cursor-pointer">
              알림 가능 게시판
            </Label>
          </div>
          <div className="space-y-2">
            <Label>노출 여부</Label>
            <Select
              value={editFormData.visibility}
              onValueChange={(value: BoardVisibility) =>
                setEditFormData({ ...editFormData, visibility: value })
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
        </div>
      </FormDialog>

      {/* 정렬 수정 다이얼로그 */}
      <Dialog open={orderDialogOpen} onOpenChange={setOrderDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>게시판 순서 수정</DialogTitle>
            <DialogDescription>
              드래그하여 순서를 변경한 뒤 저장하세요.
            </DialogDescription>
          </DialogHeader>
          <ul className="space-y-1 rounded-md border p-2 max-h-[60vh] overflow-y-auto">
            {orderBoardIds.map((boardId, index) => (
              <li
                key={boardId}
                draggable
                onDragStart={(e) => handleOrderDragStart(e, index)}
                onDragOver={handleOrderDragOver}
                onDrop={(e) => handleOrderDrop(e, index)}
                onDragEnd={() => setDraggedIndex(null)}
                className={`
                  flex items-center gap-2 rounded-md border px-3 py-2 text-sm
                  ${draggedIndex === index ? "opacity-50 bg-muted" : "bg-background"}
                  cursor-grab active:cursor-grabbing
                `}
              >
                <GripVertical className="h-4 w-4 shrink-0 text-muted-foreground" />
                <span className="w-6 shrink-0 font-medium text-muted-foreground">
                  {index + 1}.
                </span>
                <span className="min-w-0 truncate">
                  {boardById(boardId)?.name ?? boardId}
                </span>
              </li>
            ))}
          </ul>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOrderDialogOpen(false)}>
              취소
            </Button>
            <Button
              onClick={handleOrderSave}
              disabled={updateBoardOrdersV2.isPending}
            >
              {updateBoardOrdersV2.isPending ? "저장 중..." : "저장"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 삭제 확인 모달 */}
      <AlertDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="게시판 삭제"
        description={`"${selectedBoard?.name}" 게시판을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`}
        confirmText="삭제"
        cancelText="취소"
        variant="destructive"
        onConfirm={handleDeleteConfirm}
      />
    </div>
  )
}
