"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import {
  useBoardsV2,
  useCreateBoardV2,
  useUpdateBoardOrdersV2,
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
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Plus, GripVertical, ChevronRight, Pencil } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import type {
  BoardAdminInfo,
  BoardListItemV2,
  BoardReadScope,
  BoardSearchCondition,
  BoardWriteScope,
  BoardVisibility,
} from "@/types/board-v2"
import {
  defaultV2Form,
  readScopeLabel,
  visibilityLabel,
  READ_SCOPES,
  WRITE_SCOPES,
  VISIBILITIES,
} from "@/lib/constants/board-v2-form"
import { BoardAdminEditModal } from "@/components/content/BoardAdminEditModal"
import { BoardOfficialProfileFields } from "@/components/content/BoardOfficialProfileFields"
import { BoardFilter, type BoardFilterValues } from "@/components/content/BoardFilter"
import { uploadStorageFileIdV2 } from "@/lib/api/v2/storage"
import { toast } from "sonner"

/** displayOrder 기준 정렬 */
function sortByDisplayOrder(items: BoardListItemV2[]): BoardListItemV2[] {
  return [...items].sort(
    (a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0)
  )
}

const defaultBoardFilter: BoardFilterValues = {
  nameKeyword: "",
  readScope: "ALL",
  writeScope: "ALL",
  isAnonymous: "ALL",
  isNotice: "ALL",
}

/** UI 필터 값을 API 검색 조건으로 변환 (ALL/빈값은 제외) */
function filterToSearchCondition(
  filter: BoardFilterValues
): BoardSearchCondition | undefined {
  const keyword =
    filter.nameKeyword.trim() !== ""
      ? filter.nameKeyword.trim()
      : undefined
  const readScope =
    filter.readScope !== "ALL" ? filter.readScope : undefined
  const writeScope =
    filter.writeScope !== "ALL" ? filter.writeScope : undefined
  const isAnonymous =
    filter.isAnonymous === "Y"
      ? true
      : filter.isAnonymous === "N"
        ? false
        : undefined
  const isNotice =
    filter.isNotice === "Y" ? true : filter.isNotice === "N" ? false : undefined
  if (
    keyword === undefined &&
    readScope === undefined &&
    writeScope === undefined &&
    isAnonymous === undefined &&
    isNotice === undefined
  ) {
    return undefined
  }
  return { keyword, readScope, writeScope, isAnonymous, isNotice }
}

const KEYWORD_DEBOUNCE_MS = 400

export default function BoardsPage() {
  const [filter, setFilter] = useState<BoardFilterValues>(defaultBoardFilter)
  const [debouncedKeyword, setDebouncedKeyword] = useState("")

  useEffect(() => {
    if (filter.nameKeyword.trim() === "") {
      setDebouncedKeyword("")
      return
    }
    const t = setTimeout(() => setDebouncedKeyword(filter.nameKeyword.trim()), KEYWORD_DEBOUNCE_MS)
    return () => clearTimeout(t)
  }, [filter.nameKeyword])

  const apiCondition = filterToSearchCondition({
    ...filter,
    nameKeyword: debouncedKeyword,
  })
  const { data: boardsRaw, isLoading } = useBoardsV2(apiCondition)
  const { data: fullBoardsRaw } = useBoardsV2(undefined) // 정렬 다이얼로그용 전체 목록
  const boards = boardsRaw ? sortByDisplayOrder(boardsRaw) : []
  const fullBoards = fullBoardsRaw ? sortByDisplayOrder(fullBoardsRaw) : []
  const createBoardV2 = useCreateBoardV2()
  const updateBoardOrdersV2 = useUpdateBoardOrdersV2()

  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [createAdminModalOpen, setCreateAdminModalOpen] = useState(false)
  const [orderDialogOpen, setOrderDialogOpen] = useState(false)
  const [orderBoardIds, setOrderBoardIds] = useState<string[]>([])
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)

  const [formData, setFormData] = useState(defaultV2Form)
  const [createAdmins, setCreateAdmins] = useState<BoardAdminInfo[]>([])
  const [officialProfileFile, setOfficialProfileFile] = useState<File | null>(null)
  const [isUploadingOfficialProfile, setIsUploadingOfficialProfile] = useState(false)

  const handleCreate = () => {
    setFormData(defaultV2Form)
    setCreateAdmins([])
    setOfficialProfileFile(null)
    setCreateDialogOpen(true)
  }

  const handleOrderOpen = () => {
    setOrderBoardIds(fullBoards.map((b) => b.boardId))
    setOrderDialogOpen(true)
  }

  const handleOrderSave = () => {
    updateBoardOrdersV2.mutate(orderBoardIds, {
      onSuccess: () => setOrderDialogOpen(false),
    })
  }

  const boardById = (id: string) =>
    fullBoards.find((b) => b.boardId === id) ?? boards.find((b) => b.boardId === id)

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

  const handleCreateSubmit = async () => {
    if (isUploadingOfficialProfile || createBoardV2.isPending) return

    setIsUploadingOfficialProfile(true)
    try {
      const officialProfileImageId = officialProfileFile
        ? await uploadStorageFileIdV2(officialProfileFile, "ETC")
        : formData.officialProfileImageId
      const adminUserIds = createAdmins.map((a) => a.id)

      createBoardV2.mutate(
        {
          ...formData,
          officialNickname: formData.officialNickname?.trim() || null,
          officialProfileImageId: officialProfileImageId || null,
          adminUserIds,
        },
        {
          onSuccess: () => {
            setCreateDialogOpen(false)
            setFormData(defaultV2Form)
            setCreateAdmins([])
            setOfficialProfileFile(null)
          },
          onSettled: () => setIsUploadingOfficialProfile(false),
        }
      )
    } catch (error) {
      setIsUploadingOfficialProfile(false)
      toast.error(
        error instanceof Error ? error.message : "프로필 이미지 업로드에 실패했습니다."
      )
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end gap-2">
        <Button variant="outline" size="sm" onClick={handleOrderOpen} disabled={!fullBoards?.length}>
          <GripVertical className="mr-1.5 h-4 w-4" />
          정렬 수정
        </Button>
        <Button size="sm" onClick={handleCreate}>
          <Plus className="mr-1.5 h-4 w-4" />
          게시판 생성
        </Button>
      </div>

      <BoardFilter value={filter} onChange={setFilter} />

      <Card>
        <CardHeader>
          <CardTitle>게시판 목록</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    {Array.from({ length: 9 }).map((_, i) => (
                      <TableHead key={i}>
                        <div className="h-4 w-20 bg-muted animate-pulse rounded" />
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 9 }).map((_, j) => (
                        <TableCell key={j}>
                          <div className="h-4 w-24 bg-muted animate-pulse rounded" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : !boards || boards.length === 0 ? (
            <div className="rounded-md border p-12 text-center">
              <p className="text-muted-foreground">
                {apiCondition
                  ? "조건에 맞는 게시판이 없습니다."
                  : "등록된 게시판이 없습니다."}
              </p>
            </div>
          ) : (
            <div className="rounded-lg border overflow-x-auto bg-card [&_tbody_td]:py-3">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="text-center w-12">No</TableHead>
                    <TableHead className="text-left w-52 min-w-[160px]">게시판명</TableHead>
                    <TableHead className="text-left min-w-[200px]">설명</TableHead>
                    <TableHead className="text-center w-20">익명</TableHead>
                    <TableHead className="text-center w-24 whitespace-nowrap">읽기 권한</TableHead>
                    <TableHead className="text-center w-24 whitespace-nowrap">쓰기 권한</TableHead>
                    <TableHead className="text-center w-20 whitespace-nowrap">공식 계정</TableHead>
                    <TableHead className="text-center w-20">노출</TableHead>
                    <TableHead className="text-center min-w-[100px] shrink-0">관리</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {boards.map((board, index) => (
                    <TableRow key={board.boardId}>
                      <TableCell className="text-center w-12 text-muted-foreground font-medium">
                        {board.no ?? index + 1}
                      </TableCell>
                      <TableCell className="text-left w-52 min-w-[160px] font-medium">
                        <span className="block truncate max-w-[200px]" title={board.name}>
                          {board.name}
                        </span>
                      </TableCell>
                      <TableCell className="text-left min-w-[200px] text-muted-foreground text-sm">
                        <span className="line-clamp-2" title={board.description ?? undefined}>
                          {board.description}
                        </span>
                      </TableCell>
                      <TableCell className="text-center w-20">
                        {board.isAnonymous ? (
                          <Badge variant="info" className="font-normal">
                            익명
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground text-sm">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center w-24">
                        <Badge
                          variant={
                            board.readScope === "BOTH"
                              ? "info"
                              : board.readScope === "ENROLLED"
                                ? "success"
                                : "warning"
                          }
                          className="font-normal whitespace-nowrap"
                        >
                          {readScopeLabel(board.readScope)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center w-24">
                        <Badge
                          variant={board.writeScope === "ONLY_ADMIN" ? "warning" : "info"}
                          className="font-normal whitespace-nowrap"
                        >
                          {board.writeScope === "ONLY_ADMIN" ? "관리자만" : "일반 유저"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center w-20">
                        {board.isNotice ? (
                          <Badge variant="neutral" className="font-normal">
                            공식
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground text-sm">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center w-20">
                        <Badge
                          variant={board.visibility === "VISIBLE" ? "success" : "muted"}
                          className="font-normal"
                        >
                          {visibilityLabel(board.visibility)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center min-w-[100px] shrink-0 whitespace-nowrap">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="gap-1 shrink-0 whitespace-nowrap"
                          asChild
                          aria-label="상세보기"
                        >
                          <Link href={`/content/boards/${board.boardId}/edit`} className="inline-flex items-center gap-1">
                            상세보기
                            <ChevronRight className="h-4 w-4 shrink-0" />
                          </Link>
                        </Button>
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
        description="새로운 게시판을 생성합니다."
        confirmText="생성"
        onConfirm={handleCreateSubmit}
        isLoading={createBoardV2.isPending || isUploadingOfficialProfile}
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
          <BoardOfficialProfileFields
            inputIdPrefix="create"
            officialNickname={formData.officialNickname ?? ""}
            previewUrl={formData.officialProfileImageId ?? null}
            selectedFile={officialProfileFile}
            selectedFileName={officialProfileFile?.name}
            disabled={isUploadingOfficialProfile || createBoardV2.isPending}
            onNicknameChange={(value) =>
              setFormData({ ...formData, officialNickname: value })
            }
            onFileChange={setOfficialProfileFile}
          />
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <Label>관리자</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-1"
                onClick={() => setCreateAdminModalOpen(true)}
                aria-label="관리자 수정"
              >
                <Pencil className="h-3.5 w-3.5" />
                수정
              </Button>
            </div>
            <div className="rounded-md border bg-muted/30 px-3 py-2 min-h-[44px]">
              {createAdmins.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  등록된 관리자가 없습니다. 수정 버튼에서 추가할 수 있습니다.
                </p>
              ) : (
                <ul className="text-sm space-y-1">
                  {createAdmins.map((admin) => (
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
          <div className="flex items-center gap-2">
            <Checkbox
              id="create-isNotice"
              checked={formData.isNotice}
              onCheckedChange={(checked) => {
                const isNotice = checked === true
                setFormData({
                  ...formData,
                  isNotice,
                  writeScope: isNotice ? "ONLY_ADMIN" : formData.writeScope,
                })
              }}
            />
            <Label htmlFor="create-isNotice" className="cursor-pointer">
              공식 계정 게시판
            </Label>
          </div>
          <div className="space-y-2">
            <Label className={formData.isNotice ? "text-muted-foreground" : undefined}>
              쓰기 권한{formData.isNotice && <span className="text-xs ml-1">(공식 계정 게시판은 관리자만 작성 가능)</span>}
            </Label>
            <Select
              value={formData.writeScope}
              onValueChange={(value: BoardWriteScope) =>
                setFormData({ ...formData, writeScope: value })
              }
              disabled={formData.isNotice}
            >
              <SelectTrigger className={formData.isNotice ? "opacity-60 cursor-not-allowed" : undefined}>
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

      <BoardAdminEditModal
        open={createAdminModalOpen}
        onOpenChange={setCreateAdminModalOpen}
        admins={createAdmins}
        onApply={setCreateAdmins}
      />

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
    </div>
  )
}
