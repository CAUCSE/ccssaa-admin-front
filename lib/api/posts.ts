import { apiV2 } from "@/lib/api/v2/client"
import { unwrapV2 } from "@/lib/api/v2/response"
import { mockPostApi } from "@/lib/mock/posts"
import type { ApiResponse } from "@/types/api-v2"
import type {
  AdminComment,
  AdminPostDetail,
  AdminPostListParams,
  AdminPostSummary,
  CommentAdminStatus,
  PageResponse,
  PostAdminStatus,
  PostCategory,
} from "@/types/post"

const USE_MOCK_API = process.env.NEXT_PUBLIC_USE_MOCK_API === "true"

const realPostApi = {
  async getPosts(params: AdminPostListParams): Promise<PageResponse<AdminPostSummary>> {
    const response = await apiV2.get<ApiResponse<PageResponse<AdminPostSummary>>>(
      "/admin/posts",
      { params }
    )
    return unwrapV2(response)
  },

  async getPostDetail(postId: string): Promise<AdminPostDetail> {
    const response = await apiV2.get<ApiResponse<AdminPostDetail>>(
      `/admin/posts/${encodeURIComponent(postId)}`
    )
    return unwrapV2(response)
  },

  async getComments(
    postId: string,
    page: number,
    size: number
  ): Promise<PageResponse<AdminComment>> {
    const response = await apiV2.get<ApiResponse<PageResponse<AdminComment>>>(
      `/admin/posts/${encodeURIComponent(postId)}/comments`,
      { params: { page, size } }
    )
    return unwrapV2(response)
  },

  async updatePostStatus(postId: string, status: PostAdminStatus): Promise<void> {
    await apiV2.patch(`/admin/posts/${encodeURIComponent(postId)}/status`, { status })
  },

  async updatePostCategory(postId: string, category: PostCategory | null): Promise<void> {
    await apiV2.patch(`/admin/posts/${encodeURIComponent(postId)}/category`, { category })
  },

  async updateCommentStatus(commentId: string, status: CommentAdminStatus): Promise<void> {
    await apiV2.patch(`/admin/comments/${encodeURIComponent(commentId)}/status`, { status })
  },
}

export const postApi = USE_MOCK_API ? mockPostApi : realPostApi
