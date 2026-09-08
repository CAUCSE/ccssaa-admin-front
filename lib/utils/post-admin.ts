import type { PostAdminStatus, PostCategory } from "../../types/post"

export const POST_CATEGORIES: Array<{ value: PostCategory; label: string }> = [
  { value: "RECRUIT", label: "채용" },
  { value: "ACADEMIC", label: "학사" },
  { value: "EVENT_LECTURE", label: "행사/특강" },
  { value: "EXTERNAL_ACTIVITY", label: "대외활동" },
  { value: "RESEARCH", label: "연구" },
  { value: "ETC", label: "기타" },
]

export function getPostCategoryLabel(category: PostCategory | null): string {
  if (category === null) return "미분류"
  return POST_CATEGORIES.find((item) => item.value === category)?.label ?? category
}

export function getPostStatusLabel(status: PostAdminStatus): string {
  return { VISIBLE: "공개", HIDDEN: "숨김", DELETED: "삭제" }[status]
}

export function getPostWriterLabel(writer: {
  writerName: string
  writerNickname: string
  isAnonymous: boolean
}): string {
  const nickname = writer.writerNickname ? ` (${writer.writerNickname})` : ""
  return `${writer.writerName}${nickname}${writer.isAnonymous ? " · 익명 작성" : ""}`
}

export function getPostImageAlt(title: string | null, index: number): string {
  return `${title?.trim() || "게시물"} 이미지 ${index + 1}`
}

export function shouldRenderPostHtml(isCrawled: boolean): boolean {
  return isCrawled
}
