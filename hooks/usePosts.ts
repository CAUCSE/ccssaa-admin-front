import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { postApi } from "@/lib/api/posts"
import type { PostListParams, PostStatus } from "@/types/post"
import { toast } from "sonner"

// 게시글 리스트 조회
export function usePosts(params: PostListParams) {
  return useQuery({
    queryKey: ["admin-posts", params],
    queryFn: () => postApi.getPosts(params),
  })
}

// 게시글 상세 조회
export function usePostDetail(postId: number) {
  return useQuery({
    queryKey: ["admin-post", postId],
    queryFn: () => postApi.getPostDetail(postId),
    enabled: !!postId,
  })
}

// 게시판 목록 조회
export function useBoards() {
  return useQuery({
    queryKey: ["admin-boards"],
    queryFn: () => postApi.getBoards(),
  })
}

// 댓글 목록 조회
export function useComments(postId: number) {
  return useQuery({
    queryKey: ["admin-comments", postId],
    queryFn: () => postApi.getComments(postId),
    enabled: !!postId,
  })
}

// 게시글 상태 변경
export function useUpdatePostStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ postId, status }: { postId: number; status: PostStatus }) =>
      postApi.updatePostStatus(postId, status),
    onSuccess: (_, { postId }) => {
      queryClient.invalidateQueries({ queryKey: ["admin-posts"] })
      queryClient.invalidateQueries({ queryKey: ["admin-post", postId] })
      toast.success("게시글 상태가 변경되었습니다.")
    },
    onError: () => {
      toast.error("게시글 상태 변경에 실패했습니다.")
    },
  })
}

// 게시글 고정 토글
export function useTogglePostPin() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ postId, isPinned }: { postId: number; isPinned: boolean }) =>
      postApi.togglePostPin(postId, isPinned),
    onSuccess: (_, { postId, isPinned }) => {
      queryClient.invalidateQueries({ queryKey: ["admin-posts"] })
      queryClient.invalidateQueries({ queryKey: ["admin-post", postId] })
      toast.success(isPinned ? "게시글이 고정되었습니다." : "게시글 고정이 해제되었습니다.")
    },
    onError: () => {
      toast.error("게시글 고정 변경에 실패했습니다.")
    },
  })
}

// 댓글 삭제
export function useDeleteComment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (commentId: number) => postApi.deleteComment(commentId),
    onSuccess: (_, commentId) => {
      // 댓글이 속한 게시글 ID를 찾기 위해 모든 댓글 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: ["admin-comments"] })
      toast.success("댓글이 삭제되었습니다.")
    },
    onError: () => {
      toast.error("댓글 삭제에 실패했습니다.")
    },
  })
}

// 게시판 생성
export function useCreateBoard() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: { name: string; description: string }) => postApi.createBoard(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-boards"] })
      toast.success("게시판이 생성되었습니다.")
    },
    onError: () => {
      toast.error("게시판 생성에 실패했습니다.")
    },
  })
}

// 게시판 수정
export function useUpdateBoard() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ boardId, data }: { boardId: number; data: { name: string; description: string } }) =>
      postApi.updateBoard(boardId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-boards"] })
      toast.success("게시판이 수정되었습니다.")
    },
    onError: () => {
      toast.error("게시판 수정에 실패했습니다.")
    },
  })
}

// 게시판 삭제
export function useDeleteBoard() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (boardId: number) => postApi.deleteBoard(boardId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-boards"] })
      toast.success("게시판이 삭제되었습니다.")
    },
    onError: () => {
      toast.error("게시판 삭제에 실패했습니다.")
    },
  })
}

