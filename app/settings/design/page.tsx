"use client"

import { useState } from "react"
import { useBanners, useCreateBanner, useUpdateBanner, useDeleteBanner } from "@/hooks/useSettings"
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
import { Plus, Pencil, Trash2, Image as ImageIcon } from "lucide-react"
import type { Banner } from "@/types/settings"

export default function DesignPage() {
  const { data: banners, isLoading } = useBanners()
  const createBanner = useCreateBanner()
  const updateBanner = useUpdateBanner()
  const deleteBanner = useDeleteBanner()

  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedBanner, setSelectedBanner] = useState<Banner | null>(null)

  const [formData, setFormData] = useState({
    title: "",
    imageUrl: "",
    linkUrl: "",
    order: 1,
    isActive: true,
    startDate: "",
    endDate: "",
  })

  const handleCreate = () => {
    setFormData({
      title: "",
      imageUrl: "",
      linkUrl: "",
      order: banners ? banners.length + 1 : 1,
      isActive: true,
      startDate: "",
      endDate: "",
    })
    setCreateDialogOpen(true)
  }

  const handleEdit = (banner: Banner) => {
    setSelectedBanner(banner)
    setFormData({
      title: banner.title,
      imageUrl: banner.imageUrl,
      linkUrl: banner.linkUrl || "",
      order: banner.order,
      isActive: banner.isActive,
      startDate: banner.startDate ? banner.startDate.split("T")[0] : "",
      endDate: banner.endDate ? banner.endDate.split("T")[0] : "",
    })
    setEditDialogOpen(true)
  }

  const handleDelete = (banner: Banner) => {
    setSelectedBanner(banner)
    setDeleteDialogOpen(true)
  }

  const handleCreateSubmit = () => {
    createBanner.mutate(
      {
        ...formData,
        startDate: formData.startDate ? `${formData.startDate}T00:00:00Z` : undefined,
        endDate: formData.endDate ? `${formData.endDate}T23:59:59Z` : undefined,
      },
      {
        onSuccess: () => {
          setCreateDialogOpen(false)
          setFormData({
            title: "",
            imageUrl: "",
            linkUrl: "",
            order: 1,
            isActive: true,
            startDate: "",
            endDate: "",
          })
        },
      }
    )
  }

  const handleEditSubmit = () => {
    if (!selectedBanner) return
    updateBanner.mutate(
      {
        bannerId: selectedBanner.id,
        data: {
          ...formData,
          startDate: formData.startDate ? `${formData.startDate}T00:00:00Z` : undefined,
          endDate: formData.endDate ? `${formData.endDate}T23:59:59Z` : undefined,
        },
      },
      {
        onSuccess: () => {
          setEditDialogOpen(false)
          setSelectedBanner(null)
          setFormData({
            title: "",
            imageUrl: "",
            linkUrl: "",
            order: 1,
            isActive: true,
            startDate: "",
            endDate: "",
          })
        },
      }
    )
  }

  const handleDeleteConfirm = () => {
    if (!selectedBanner) return
    deleteBanner.mutate(selectedBanner.id, {
      onSuccess: () => {
        setDeleteDialogOpen(false)
        setSelectedBanner(null)
      },
    })
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return "-"
    const date = new Date(dateString)
    return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, "0")}.${String(date.getDate()).padStart(2, "0")}`
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
          <h1 className="text-2xl font-bold">디자인 / 배너 관리</h1>
          <p className="text-muted-foreground mt-1">배너를 생성, 수정, 삭제할 수 있습니다.</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          배너 생성
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>배너 목록</CardTitle>
        </CardHeader>
        <CardContent>
          {!banners || banners.length === 0 ? (
            <div className="rounded-md border p-12 text-center">
              <p className="text-muted-foreground">등록된 배너가 없습니다.</p>
            </div>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-center w-16">순서</TableHead>
                    <TableHead className="text-left">제목</TableHead>
                    <TableHead className="text-center">이미지</TableHead>
                    <TableHead className="text-center">링크</TableHead>
                    <TableHead className="text-center">시작일</TableHead>
                    <TableHead className="text-center">종료일</TableHead>
                    <TableHead className="text-center">상태</TableHead>
                    <TableHead className="text-center">관리</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {banners.map((banner) => (
                    <TableRow key={banner.id}>
                      <TableCell className="text-center">{banner.order}</TableCell>
                      <TableCell className="text-left font-medium">{banner.title}</TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center">
                          <ImageIcon className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        {banner.linkUrl ? (
                          <a
                            href={banner.linkUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                          >
                            링크
                          </a>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell className="text-center">{formatDate(banner.startDate)}</TableCell>
                      <TableCell className="text-center">{formatDate(banner.endDate)}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant={banner.isActive ? "success" : "neutral"}>
                          {banner.isActive ? "활성" : "비활성"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(banner)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(banner)}
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
        title="배너 생성"
        description="새로운 배너를 생성합니다."
        confirmText="생성"
        onConfirm={handleCreateSubmit}
        isLoading={createBanner.isPending}
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="create-title">제목 *</Label>
            <Input
              id="create-title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="배너 제목을 입력하세요"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="create-image">이미지 URL *</Label>
            <Input
              id="create-image"
              value={formData.imageUrl}
              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
              placeholder="이미지 URL을 입력하세요"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="create-link">링크 URL</Label>
            <Input
              id="create-link"
              value={formData.linkUrl}
              onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })}
              placeholder="클릭 시 이동할 URL (선택사항)"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="create-start-date">시작일</Label>
              <Input
                id="create-start-date"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-end-date">종료일</Label>
              <Input
                id="create-end-date"
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              />
            </div>
          </div>
        </div>
      </FormDialog>

      {/* 수정 모달 */}
      <FormDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        title="배너 수정"
        description="배너 정보를 수정합니다."
        confirmText="수정"
        onConfirm={handleEditSubmit}
        isLoading={updateBanner.isPending}
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-title">제목 *</Label>
            <Input
              id="edit-title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="배너 제목을 입력하세요"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-image">이미지 URL *</Label>
            <Input
              id="edit-image"
              value={formData.imageUrl}
              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
              placeholder="이미지 URL을 입력하세요"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-link">링크 URL</Label>
            <Input
              id="edit-link"
              value={formData.linkUrl}
              onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })}
              placeholder="클릭 시 이동할 URL (선택사항)"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-start-date">시작일</Label>
              <Input
                id="edit-start-date"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-end-date">종료일</Label>
              <Input
                id="edit-end-date"
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              />
            </div>
          </div>
        </div>
      </FormDialog>

      {/* 삭제 확인 모달 */}
      <AlertDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="배너 삭제"
        description={`"${selectedBanner?.title}" 배너를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`}
        confirmText="삭제"
        cancelText="취소"
        variant="destructive"
        onConfirm={handleDeleteConfirm}
      />
    </div>
  )
}
