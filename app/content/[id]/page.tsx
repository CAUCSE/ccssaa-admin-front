"use client"

import { useParams, useRouter } from "next/navigation"
import { PageHeader } from "@/components/layout/PageHeader"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { usePostDetail, useComments, useUpdatePostStatus, useTogglePostPin, useDeleteComment } from "@/hooks/usePosts"
import { AlertDialog } from "@/components/ui/alert-dialog"
import { useState } from "react"
import { Pin, EyeOff, Trash2, X } from "lucide-react"
import { getStatusBadge } from "@/lib/utils/status-badge"

export default function PostDetailPage() {
  const params = useParams()
  const router = useRouter()
  const postId = parseInt(params.id as string, 10)

  const { data: post, isLoading: postLoading } = usePostDetail(postId)
  const { data: comments, isLoading: commentsLoading } = useComments(postId)
  const updateStatus = useUpdatePostStatus()
  const togglePin = useTogglePostPin()
  const deleteComment = useDeleteComment()

  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean
    action: "hide" | "delete" | null
  }>({ open: false, action: null })

  // TODO: 실제 권한 체크 로직으로 교체
  const currentUserRole: "MASTER" | "STUDENT_COUNCIL" | "ALUMNI_COUNCIL" = "MASTER" // 임시로 MASTER로 설정
  const isStudentCouncil = currentUserRole === "STUDENT_COUNCIL"

  const handleHide = () => {
    if (!post) return
    updateStatus.mutate(
      { postId: post.id, status: "HIDDEN" },
      {
        onSuccess: () => {
          setConfirmDialog({ open: false, action: null })
        },
      }
    )
  }

  const handleDelete = () => {
    if (!post) return
    updateStatus.mutate(
      { postId: post.id, status: "DELETED" },
      {
        onSuccess: () => {
          setConfirmDialog({ open: false, action: null })
          router.push("/content")
        },
      }
    )
  }

  const handleTogglePin = () => {
    if (!post) return
    togglePin.mutate({ postId: post.id, isPinned: !post.isPinned })
  }

  const handleDeleteComment = (commentId: number) => {
    deleteComment.mutate(commentId)
  }

  if (postLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-muted animate-pulse rounded" />
        <div className="h-64 bg-muted animate-pulse rounded" />
      </div>
    )
  }

  if (!post) {
    return (
      <div className="rounded-md border p-12 text-center">
        <p className="text-destructive mb-4">게시글을 불러올 수 없습니다.</p>
        <Button variant="outline" onClick={() => router.push("/content")}>
          목록으로 돌아가기
        </Button>
      </div>
    )
  }

  const getStatusBadgeVariant = (status: typeof post.status) => {
    switch (status) {
      case "PUBLIC":
        return "success"
      case "HIDDEN":
        return "neutral"
      case "DELETED":
        return "danger"
      default:
        return "neutral"
    }
  }

  const getStatusLabel = (status: typeof post.status) => {
    switch (status) {
      case "PUBLIC":
        return "공개"
      case "HIDDEN":
        return "숨김"
      case "DELETED":
        return "삭제"
      default:
        return status
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="게시글 상세"
        description="게시글 내용을 확인하고 관리할 수 있습니다."
        backHref="/content"
        backLabel="게시판 관리"
        breadcrumbs={[{ label: "게시글 상세" }]}
      />

      {/* 우측 상단 액션 버튼 */}
      <div className="flex justify-end gap-2">
        <Button
          variant={post.isPinned ? "default" : "outline"}
          size="sm"
          onClick={handleTogglePin}
          disabled={togglePin.isPending}
        >
          <Pin className="mr-2 h-4 w-4" />
          {post.isPinned ? "고정 해제" : "공지 고정"}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setConfirmDialog({ open: true, action: "hide" })}
          disabled={updateStatus.isPending}
        >
          <EyeOff className="mr-2 h-4 w-4" />
          숨김 처리
        </Button>
        {!isStudentCouncil && (
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setConfirmDialog({ open: true, action: "delete" })}
            disabled={updateStatus.isPending}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            삭제
          </Button>
        )}
      </div>

      {/* 본문 미리보기 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">{post.title}</CardTitle>
            <Badge variant={getStatusBadgeVariant(post.status)}>
              {getStatusLabel(post.status)}
            </Badge>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>작성자: {post.author}</span>
            <span>게시판: {post.boardName}</span>
            <span>작성일: {new Date(post.createdAt).toLocaleDateString("ko-KR")}</span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="prose max-w-none whitespace-pre-wrap">{post.content}</div>
          {post.attachments && post.attachments.length > 0 && (
            <div className="mt-4">
              <Separator className="my-4" />
              <p className="text-sm font-semibold mb-2">첨부파일</p>
              <ul className="list-disc list-inside space-y-1">
                {post.attachments.map((file, index) => (
                  <li key={index} className="text-sm text-muted-foreground">
                    {file}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 댓글 목록 */}
      <Card>
        <CardHeader>
          <CardTitle>댓글 목록</CardTitle>
        </CardHeader>
        <CardContent>
          {commentsLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-muted animate-pulse rounded" />
              ))}
            </div>
          ) : comments && comments.length > 0 ? (
            <div className="space-y-4">
              {comments.map((comment) => (
                <div
                  key={comment.id}
                  className="flex items-start justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-semibold">{comment.author}</span>
                      <span className="text-sm text-muted-foreground">
                        {new Date(comment.createdAt).toLocaleDateString("ko-KR")}
                      </span>
                    </div>
                    <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteComment(comment.id)}
                    disabled={deleteComment.isPending}
                    className="ml-4"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-muted-foreground">
              댓글이 없습니다.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Confirm Dialogs */}
      <AlertDialog
        open={confirmDialog.open && confirmDialog.action === "hide"}
        onOpenChange={(open) =>
          setConfirmDialog({ open, action: confirmDialog.action })
        }
        title="게시글 숨김 처리"
        description="이 게시글을 숨김 처리하시겠습니까?"
        variant="default"
        confirmText="확인"
        cancelText="취소"
        onConfirm={handleHide}
        onCancel={() => setConfirmDialog({ open: false, action: null })}
      />

      <AlertDialog
        open={confirmDialog.open && confirmDialog.action === "delete"}
        onOpenChange={(open) =>
          setConfirmDialog({ open, action: confirmDialog.action })
        }
        title="게시글 삭제"
        description="이 게시글을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다."
        variant="destructive"
        confirmText="삭제"
        cancelText="취소"
        onConfirm={handleDelete}
        onCancel={() => setConfirmDialog({ open: false, action: null })}
      />
    </div>
  )
}

