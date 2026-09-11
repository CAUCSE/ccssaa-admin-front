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

const categories: Array<PostCategory | null> = [
  "RECRUIT",
  "ACADEMIC",
  "EVENT_LECTURE",
  "EXTERNAL_ACTIVITY",
  "RESEARCH",
  "ETC",
  null,
]

const statuses: PostAdminStatus[] = ["VISIBLE", "VISIBLE", "HIDDEN", "DELETED"]

const posts: AdminPostDetail[] = Array.from({ length: 47 }, (_, index) => {
  const createdAt = new Date(Date.now() - index * 60 * 60 * 1000).toISOString()
  return {
    postId: `post-${index + 1}`,
    title: index % 8 === 0 ? null : `관리자 확인용 게시물 ${index + 1}`,
    content: `게시물 ${index + 1}의 전체 본문입니다. 관리자 페이지에서 공개, 숨김, 삭제 상태를 관리할 수 있습니다.`,
    category: categories[index % categories.length],
    boardId: `board-${(index % 4) + 1}`,
    boardName: ["자유게시판", "동문 소식", "취업 정보", "학사 공지"][index % 4],
    writerId: `user-${(index % 12) + 1}`,
    writerName: `작성자 ${index + 1}`,
    writerNickname: `닉네임${index + 1}`,
    isAnonymous: index % 5 === 0,
    isCrawled: index % 3 === 0,
    status: statuses[index % statuses.length],
    imageUrls: index % 6 === 0 ? ["https://placehold.co/800x450"] : [],
    commentCount: index % 7,
    likeCount: index % 11,
    viewCount: 20 + index * 3,
    createdAt,
    updatedAt: createdAt,
  }
})

const commentsByPost = new Map<string, AdminComment[]>()

function pageOf<T>(content: T[], page: number, size: number): PageResponse<T> {
  const totalPages = Math.ceil(content.length / size)
  return {
    content: content.slice(page * size, page * size + size),
    currentPage: page,
    size,
    totalPages,
    totalElements: content.length,
    hasNext: page + 1 < totalPages,
    hasPrev: page > 0,
  }
}

function commentsFor(postId: string): AdminComment[] {
  const existing = commentsByPost.get(postId)
  if (existing) return existing
  const created = Array.from({ length: 7 }, (_, index): AdminComment => ({
    commentId: `${postId}-comment-${index + 1}`,
    parentCommentId: null,
    postId,
    content: `댓글 ${index + 1} 내용입니다.`,
    status: index === 2 ? "DELETED" : "VISIBLE",
    writerId: `commenter-${index + 1}`,
    writerName: `댓글 작성자 ${index + 1}`,
    writerNickname: `댓글닉네임${index + 1}`,
    isAnonymous: index % 3 === 0,
    createdAt: new Date(Date.now() - index * 60000).toISOString(),
    updatedAt: new Date(Date.now() - index * 60000).toISOString(),
    children:
      index === 0
        ? [{
            commentId: `${postId}-reply-1`,
            parentCommentId: `${postId}-comment-1`,
            postId,
            content: "대댓글 내용입니다.",
            status: "VISIBLE",
            writerId: "reply-user-1",
            writerName: "대댓글 작성자",
            writerNickname: "답글닉네임",
            isAnonymous: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            children: [],
          }]
        : [],
  }))
  commentsByPost.set(postId, created)
  return created
}

export const mockPostApi = {
  async getPosts(params: AdminPostListParams): Promise<PageResponse<AdminPostSummary>> {
    await new Promise((resolve) => setTimeout(resolve, 250))
    let filtered = [...posts]
    if (params.boardId) filtered = filtered.filter((post) => post.boardId === params.boardId)
    if (params.category) filtered = filtered.filter((post) => post.category === params.category)
    if (params.status) filtered = filtered.filter((post) => post.status === params.status)
    if (params.keyword) {
      const keyword = params.keyword.toLowerCase()
      filtered = filtered.filter(
        (post) => post.title?.toLowerCase().includes(keyword) || post.content.toLowerCase().includes(keyword)
      )
    }
    if (params.writerKeyword) {
      const keyword = params.writerKeyword.toLowerCase()
      filtered = filtered.filter(
        (post) => post.writerName.toLowerCase().includes(keyword) || post.writerNickname.toLowerCase().includes(keyword)
      )
    }
    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    const page = params.page ?? 0
    const size = params.size ?? 20
    return pageOf(
      filtered.map(({ content, isCrawled, imageUrls, ...summary }) => ({
        ...summary,
        contentPreview: content.slice(0, 100),
      })),
      page,
      size
    )
  },

  async getPostDetail(postId: string): Promise<AdminPostDetail> {
    await new Promise((resolve) => setTimeout(resolve, 200))
    const post = posts.find((item) => item.postId === postId)
    if (!post) throw new Error("게시물을 찾을 수 없습니다.")
    return post
  },

  async getComments(postId: string, page: number, size: number): Promise<PageResponse<AdminComment>> {
    await new Promise((resolve) => setTimeout(resolve, 150))
    return pageOf(commentsFor(postId), page, size)
  },

  async updatePostStatus(postId: string, status: PostAdminStatus): Promise<void> {
    const post = posts.find((item) => item.postId === postId)
    if (!post) throw new Error("게시물을 찾을 수 없습니다.")
    post.status = status
  },

  async updatePostCategory(postId: string, category: PostCategory | null): Promise<void> {
    const post = posts.find((item) => item.postId === postId)
    if (!post) throw new Error("게시물을 찾을 수 없습니다.")
    if (!post.isCrawled) throw new Error("크롤링 게시물만 카테고리를 변경할 수 있습니다.")
    post.category = category
  },

  async updateCommentStatus(commentId: string, status: CommentAdminStatus): Promise<void> {
    for (const roots of commentsByPost.values()) {
      const candidates = roots.flatMap((comment) => [comment, ...comment.children])
      const comment = candidates.find((item) => item.commentId === commentId)
      if (comment) {
        comment.status = status
        return
      }
    }
    throw new Error("댓글을 찾을 수 없습니다.")
  },
}
