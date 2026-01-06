"use client"

import { useState } from "react"
import { useBoards, useCreateBoard, useUpdateBoard, useDeleteBoard } from "@/hooks/usePosts"
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
import { Plus, Pencil, Trash2 } from "lucide-react"
import type { Board } from "@/types/post"

export default function BoardsPage() {
  const { data: boards, isLoading } = useBoards()
  const createBoard = useCreateBoard()
  const updateBoard = useUpdateBoard()
  const deleteBoard = useDeleteBoard()

  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedBoard, setSelectedBoard] = useState<Board | null>(null)

  const [formData, setFormData] = useState({ name: "", description: "" })

  const handleCreate = () => {
    setFormData({ name: "", description: "" })
    setCreateDialogOpen(true)
  }

  const handleEdit = (board: Board) => {
    setSelectedBoard(board)
    setFormData({ name: board.name, description: board.description })
    setEditDialogOpen(true)
  }

  const handleDelete = (board: Board) => {
    setSelectedBoard(board)
    setDeleteDialogOpen(true)
  }

  const handleCreateSubmit = () => {
    createBoard.mutate(formData, {
      onSuccess: () => {
        setCreateDialogOpen(false)
        setFormData({ name: "", description: "" })
      },
    })
  }

  const handleEditSubmit = () => {
    if (!selectedBoard) return
    updateBoard.mutate(
      { boardId: selectedBoard.id, data: formData },
      {
        onSuccess: () => {
          setEditDialogOpen(false)
          setSelectedBoard(null)
          setFormData({ name: "", description: "" })
        },
      }
    )
  }

  const handleDeleteConfirm = () => {
    if (!selectedBoard) return
    deleteBoard.mutate(selectedBoard.id, {
      onSuccess: () => {
        setDeleteDialogOpen(false)
        setSelectedBoard(null)
      },
    })
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, "0")}.${String(date.getDate()).padStart(2, "0")}`
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
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          게시판 생성
        </Button>
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
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-center w-16">No</TableHead>
                    <TableHead className="text-left">게시판명</TableHead>
                    <TableHead className="text-left">설명</TableHead>
                    <TableHead className="text-center">게시글 수</TableHead>
                    <TableHead className="text-center">생성일</TableHead>
                    <TableHead className="text-center">관리</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {boards.map((board, index) => (
                    <TableRow key={board.id}>
                      <TableCell className="text-center">{index + 1}</TableCell>
                      <TableCell className="text-left font-medium">{board.name}</TableCell>
                      <TableCell className="text-left text-muted-foreground">
                        {board.description}
                      </TableCell>
                      <TableCell className="text-center">{board.postCount}</TableCell>
                      <TableCell className="text-center">{formatDate(board.createdAt)}</TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(board)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(board)}
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
        title="게시판 생성"
        description="새로운 게시판을 생성합니다."
        confirmText="생성"
        onConfirm={handleCreateSubmit}
        isLoading={createBoard.isPending}
      >
        <div className="space-y-4">
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
        </div>
      </FormDialog>

      {/* 수정 모달 */}
      <FormDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        title="게시판 수정"
        description="게시판 정보를 수정합니다."
        confirmText="수정"
        onConfirm={handleEditSubmit}
        isLoading={updateBoard.isPending}
      >
        <div className="space-y-4">
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
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="게시판 설명을 입력하세요"
            />
          </div>
        </div>
      </FormDialog>

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
