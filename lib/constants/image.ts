/**
 * 이미지 업로드 규칙 (사용자 앱과 동일 규칙 유지)
 * 참고: .claude/docs/image-info.md §4.1
 */

export const IMAGE_UPLOAD_RULES = {
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  MAX_FILE_COUNT: 20,
  ALLOWED_EXTENSIONS: ["jpg", "jpeg", "png", "gif", "bmp"] as const,
} as const

export const ACCEPTED_IMAGE_TYPES =
  "image/jpeg, image/png, image/gif, image/bmp"

export const ACCEPTED_IMAGE_MIME_LIST = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/bmp",
] as const

export type ImageValidationError = "invalid-type" | "invalid-size"

/** 파일 형식·크기 검증. 유효하면 null, 아니면 사유 반환 */
export function validateImageFile(file: File): ImageValidationError | null {
  const mime = file.type.toLowerCase()
  const ext = file.name.split(".").pop()?.toLowerCase() ?? ""
  const isAllowedMime = (ACCEPTED_IMAGE_MIME_LIST as readonly string[]).includes(
    mime
  )
  const isAllowedExt = (IMAGE_UPLOAD_RULES.ALLOWED_EXTENSIONS as readonly string[]).includes(
    ext
  )
  if (!isAllowedMime && !isAllowedExt) return "invalid-type"
  if (file.size > IMAGE_UPLOAD_RULES.MAX_FILE_SIZE) return "invalid-size"
  return null
}

export const IMAGE_VALIDATION_MESSAGE: Record<ImageValidationError, string> = {
  "invalid-type": "JPG, JPEG, PNG, GIF, BMP 형식만 첨부할 수 있습니다.",
  "invalid-size": "이미지 파일은 각 5MB 이하만 첨부할 수 있습니다.",
}
