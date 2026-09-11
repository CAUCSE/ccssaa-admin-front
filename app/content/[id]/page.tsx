"use client"

import { useState } from "react"
import { Eye, EyeOff, RotateCcw, Trash2 } from "lucide-react"
import { useParams, useRouter } from "next/navigation"

import { PageHeader } from "@/components/layout/PageHeader"
import { PostImageGallery } from "@/components/content/PostImageGallery"
import { PostContent } from "@/components/content/PostContent"
import { AlertDialog } from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useComments, usePostDetail, useUpdateCommentStatus, useUpdatePostCategory, useUpdatePostStatus } from "@/hooks/usePosts"
import { getPostCategoryLabel, getPostStatusLabel, getPostWriterLabel, POST_CATEGORIES } from "@/lib/utils/post-admin"
import type { AdminComment, PostAdminStatus } from "@/types/post"

const statusVariant = (status: PostAdminStatus) => status === "VISIBLE" ? "success" : status === "DELETED" ? "danger" : "neutral"

function CommentItem({ comment, onChange, pending, nested = false }: { comment: AdminComment; onChange: (comment: AdminComment) => void; pending: boolean; nested?: boolean }) {
  return <div className={nested ? "ml-6 border-l pl-4" : "rounded-lg border p-4"}>
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0 flex-1">
        <div className="mb-2 flex flex-wrap items-center gap-2"><span className="font-medium">{getPostWriterLabel(comment)}</span><Badge variant={comment.status === "DELETED" ? "danger" : "success"}>{comment.status === "DELETED" ? "삭제" : "공개"}</Badge><span className="text-xs text-muted-foreground">{new Date(comment.createdAt).toLocaleString("ko-KR")}</span></div>
        <p className="whitespace-pre-wrap text-sm">{comment.content}</p>
      </div>
      <Button variant={comment.status === "DELETED" ? "outline" : "destructive"} size="sm" disabled={pending} onClick={() => onChange(comment)}>{comment.status === "DELETED" ? <RotateCcw className="mr-1 h-4 w-4" /> : <Trash2 className="mr-1 h-4 w-4" />}{comment.status === "DELETED" ? "복구" : "삭제"}</Button>
    </div>
    {comment.children.length > 0 && <div className="mt-4 space-y-3">{comment.children.map((child) => <CommentItem key={child.commentId} comment={child} onChange={onChange} pending={pending} nested />)}</div>}
  </div>
}

export default function PostDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [commentPage, setCommentPage] = useState(1)
  const [nextStatus, setNextStatus] = useState<PostAdminStatus | null>(null)
  const { data: post, isLoading, error } = usePostDetail(id)
  const comments = useComments(id, commentPage - 1)
  const updateStatus = useUpdatePostStatus()
  const updateCategory = useUpdatePostCategory()
  const updateCommentStatus = useUpdateCommentStatus(id)

  if (isLoading) return <div className="space-y-6"><div className="h-10 w-64 animate-pulse rounded bg-muted" /><div className="h-80 animate-pulse rounded bg-muted" /></div>
  if (error || !post) return <div className="rounded-md border p-12 text-center"><p className="mb-4 text-destructive">게시물을 불러올 수 없습니다.</p><Button variant="outline" onClick={() => router.push("/content")}>목록으로 돌아가기</Button></div>

  const confirmStatus = () => {
    if (!nextStatus) return
    updateStatus.mutate({ postId: post.postId, status: nextStatus }, { onSuccess: () => setNextStatus(null) })
  }
  const changeCommentStatus = (comment: AdminComment) => updateCommentStatus.mutate({ commentId: comment.commentId, status: comment.status === "DELETED" ? "VISIBLE" : "DELETED" })

  return <div className="space-y-6">
    <PageHeader title="게시물 상세" description="게시물 내용과 댓글을 확인하고 공개 상태를 관리합니다." backHref="/content" backLabel="게시물 관리" breadcrumbs={[{ label: "게시물 상세" }]} />
    <div className="flex flex-wrap justify-end gap-2">
      {post.status !== "VISIBLE" && <Button variant="outline" onClick={() => setNextStatus("VISIBLE")}><Eye className="mr-2 h-4 w-4" />공개로 복구</Button>}
      {post.status !== "HIDDEN" && <Button variant="outline" onClick={() => setNextStatus("HIDDEN")}><EyeOff className="mr-2 h-4 w-4" />숨김 처리</Button>}
      {post.status !== "DELETED" && <Button variant="destructive" onClick={() => setNextStatus("DELETED")}><Trash2 className="mr-2 h-4 w-4" />삭제 처리</Button>}
    </div>
    <Card>
      <CardHeader><div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div><CardTitle className="text-xl">{post.title || "제목 없음"}</CardTitle><p className="mt-2 text-sm text-muted-foreground">{post.boardName} · {getPostWriterLabel(post)} · {new Date(post.createdAt).toLocaleString("ko-KR")}</p></div><Badge variant={statusVariant(post.status)}>{getPostStatusLabel(post.status)}</Badge></div></CardHeader>
      <CardContent className="space-y-5">
        <div className="flex flex-wrap items-center gap-3"><span className="text-sm font-medium">카테고리</span>{post.isCrawled ? <Select value={post.category ?? "UNCATEGORIZED"} disabled={updateCategory.isPending} onValueChange={(value) => updateCategory.mutate({ postId: post.postId, category: value === "UNCATEGORIZED" ? null : value as typeof post.category })}><SelectTrigger className="w-44"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="UNCATEGORIZED">미분류</SelectItem>{POST_CATEGORIES.map((item) => <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>)}</SelectContent></Select> : <Badge variant="outline">{getPostCategoryLabel(post.category)}</Badge>}<span className="text-xs text-muted-foreground">{post.isCrawled ? "크롤링 게시물" : "일반 게시물"}</span></div>
        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground"><span>댓글 {post.commentCount}</span><span>좋아요 {post.likeCount}</span><span>조회 {post.viewCount}</span><span>수정 {new Date(post.updatedAt).toLocaleString("ko-KR")}</span></div>
        <PostContent content={post.content} isCrawled={post.isCrawled} />
        <PostImageGallery imageUrls={post.imageUrls} postTitle={post.title} />
      </CardContent>
    </Card>
    <Card>
      <CardHeader><CardTitle>댓글 관리</CardTitle></CardHeader>
      <CardContent className="space-y-4">{comments.isLoading ? <p className="py-8 text-center text-muted-foreground">댓글을 불러오는 중입니다.</p> : comments.error ? <p className="py-8 text-center text-destructive">댓글을 불러오는 중 오류가 발생했습니다.</p> : !comments.data?.content.length ? <p className="py-8 text-center text-muted-foreground">댓글이 없습니다.</p> : comments.data.content.map((comment) => <CommentItem key={comment.commentId} comment={comment} onChange={changeCommentStatus} pending={updateCommentStatus.isPending} />)}
        {comments.data && comments.data.totalPages > 1 && <div className="flex items-center justify-center gap-3"><Button variant="outline" size="sm" disabled={!comments.data.hasPrev} onClick={() => setCommentPage((value) => value - 1)}>이전</Button><span className="text-sm">{commentPage} / {comments.data.totalPages}</span><Button variant="outline" size="sm" disabled={!comments.data.hasNext} onClick={() => setCommentPage((value) => value + 1)}>다음</Button></div>}
      </CardContent>
    </Card>
    <AlertDialog open={nextStatus !== null} onOpenChange={(open) => !open && setNextStatus(null)} title={nextStatus === "DELETED" ? "게시물 삭제" : nextStatus === "HIDDEN" ? "게시물 숨김" : "게시물 복구"} description={`이 게시물을 ${nextStatus === "DELETED" ? "삭제" : nextStatus === "HIDDEN" ? "숨김" : "공개"} 상태로 변경하시겠습니까?`} variant={nextStatus === "DELETED" ? "destructive" : "default"} confirmText="변경" cancelText="취소" onConfirm={confirmStatus} onCancel={() => setNextStatus(null)} />
  </div>
}
