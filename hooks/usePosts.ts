import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { useApiErrorDialog } from "@/components/ApiErrorDialog"
import { postApi } from "@/lib/api/posts"
import {
  createBoardV2,
  deleteBoardV2,
  getBoardV2,
  getBoardsV2,
  updateBoardOrdersV2,
  updateBoardV2,
} from "@/lib/api/v2/boards"
import type { BoardCreateRequestV2, BoardSearchCondition } from "@/types/board-v2"
import type {
  AdminPostListParams,
  CommentAdminStatus,
  PostAdminStatus,
  PostCategory,
} from "@/types/post"

export function usePosts(params: AdminPostListParams) {
  return useQuery({ queryKey: ["admin-posts", params], queryFn: () => postApi.getPosts(params) })
}

export function usePostDetail(postId: string) {
  return useQuery({
    queryKey: ["admin-post", postId],
    queryFn: () => postApi.getPostDetail(postId),
    enabled: Boolean(postId),
  })
}

export function usePostBoardOptions() {
  return useQuery({ queryKey: ["admin-boards-v2", "post-filter"], queryFn: () => getBoardsV2() })
}

export function useBoardsV2(condition?: BoardSearchCondition) {
  const showError = useApiErrorDialog()
  return useQuery({
    queryKey: ["admin-boards-v2", condition],
    queryFn: async () => {
      try { return await getBoardsV2(condition) }
      catch (error) { showError?.(error); throw error }
    },
  })
}

export function useBoardV2(boardId: string | undefined) {
  const showError = useApiErrorDialog()
  return useQuery({
    queryKey: ["admin-board-v2", boardId],
    queryFn: async () => {
      try { return await getBoardV2(boardId!) }
      catch (error) { showError?.(error); throw error }
    },
    enabled: Boolean(boardId),
  })
}

export function useCreateBoardV2() {
  const queryClient = useQueryClient()
  const showError = useApiErrorDialog()
  return useMutation({
    mutationFn: (data: Omit<BoardCreateRequestV2, "boardId">) => createBoardV2(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-boards-v2"] })
      toast.success("게시판이 생성되었습니다.")
    },
    onError: (error) => showError?.(error),
  })
}

export function useUpdateBoardV2() {
  const queryClient = useQueryClient()
  const showError = useApiErrorDialog()
  return useMutation({
    mutationFn: (data: BoardCreateRequestV2 & { boardId: string }) => updateBoardV2(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin-boards-v2"] })
      queryClient.invalidateQueries({ queryKey: ["admin-board-v2", variables.boardId] })
      toast.success("게시판이 수정되었습니다.")
    },
    onError: (error) => showError?.(error),
  })
}

export function useUpdateBoardOrdersV2() {
  const queryClient = useQueryClient()
  const showError = useApiErrorDialog()
  return useMutation({
    mutationFn: (boardIds: string[]) => updateBoardOrdersV2(boardIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-boards-v2"] })
      toast.success("게시판 순서가 저장되었습니다.")
    },
    onError: (error) => showError?.(error),
  })
}

export function useDeleteBoardV2() {
  const queryClient = useQueryClient()
  const showError = useApiErrorDialog()
  return useMutation({
    mutationFn: (boardId: string) => deleteBoardV2(boardId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-boards-v2"] })
      queryClient.invalidateQueries({ queryKey: ["admin-board-v2"] })
      toast.success("게시판이 삭제되었습니다.")
    },
    onError: (error) => showError?.(error),
  })
}

export function useComments(postId: string, page: number, size = 20) {
  return useQuery({
    queryKey: ["admin-comments", postId, page, size],
    queryFn: () => postApi.getComments(postId, page, size),
    enabled: Boolean(postId),
  })
}

export function useUpdatePostStatus() {
  const queryClient = useQueryClient()
  const showError = useApiErrorDialog()
  return useMutation({
    mutationFn: ({ postId, status }: { postId: string; status: PostAdminStatus }) =>
      postApi.updatePostStatus(postId, status),
    onSuccess: (_, { postId }) => {
      queryClient.invalidateQueries({ queryKey: ["admin-posts"] })
      queryClient.invalidateQueries({ queryKey: ["admin-post", postId] })
      toast.success("게시물 상태가 변경되었습니다.")
    },
    onError: (error) => showError?.(error),
  })
}

export function useUpdatePostCategory() {
  const queryClient = useQueryClient()
  const showError = useApiErrorDialog()
  return useMutation({
    mutationFn: ({ postId, category }: { postId: string; category: PostCategory | null }) =>
      postApi.updatePostCategory(postId, category),
    onSuccess: (_, { postId }) => {
      queryClient.invalidateQueries({ queryKey: ["admin-posts"] })
      queryClient.invalidateQueries({ queryKey: ["admin-post", postId] })
      queryClient.invalidateQueries({ queryKey: ["admin-posts-uncategorized"] })
      toast.success("게시물 카테고리가 변경되었습니다.")
    },
    onError: (error) => showError?.(error),
  })
}

export function useUpdateCommentStatus(postId: string) {
  const queryClient = useQueryClient()
  const showError = useApiErrorDialog()
  return useMutation({
    mutationFn: ({ commentId, status }: { commentId: string; status: CommentAdminStatus }) =>
      postApi.updateCommentStatus(commentId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-comments", postId] })
      queryClient.invalidateQueries({ queryKey: ["admin-post", postId] })
      queryClient.invalidateQueries({ queryKey: ["admin-posts"] })
      toast.success("댓글 상태가 변경되었습니다.")
    },
    onError: (error) => showError?.(error),
  })
}
