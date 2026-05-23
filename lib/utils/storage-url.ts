/**
 * 백엔드 로컬 저장 경로(file://, 절대경로)를 관리자 미리보기/저장용 HTTP 경로로 변환
 */

const STORAGE_FILE_PATH_PATTERN =
  /(?:^|[/\\])(etc|user|circle|post|calendar|event|ceremony)(?:[/\\].+)$/i

/** file:///.../causwfile/etc/... 또는 etc/... 형태에서 상대 경로 추출 */
export function extractStorageRelativePath(raw: string): string | null {
  const trimmed = raw.trim()
  if (!trimmed) return null

  const causwMatch = trimmed.match(/causwfile[/\\](.+)$/i)
  if (causwMatch) {
    return causwMatch[1].replace(/\\/g, "/")
  }

  const withoutScheme = trimmed.replace(/^file:\/\//i, "")
  const relativeMatch = withoutScheme.match(STORAGE_FILE_PATH_PATTERN)
  if (relativeMatch) {
    const start = withoutScheme.search(STORAGE_FILE_PATH_PATTERN)
    return withoutScheme.slice(start).replace(/\\/g, "/")
  }

  if (STORAGE_FILE_PATH_PATTERN.test(trimmed)) {
    const start = trimmed.search(STORAGE_FILE_PATH_PATTERN)
    return trimmed.slice(start).replace(/\\/g, "/")
  }

  return null
}

/** 파일명에 포함된 UUID (fileId) 추출 */
export function extractStorageFileId(raw: string): string | null {
  const match = raw.match(
    /([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i
  )
  return match?.[1] ?? null
}

export function isHttpUrl(raw: string): boolean {
  return /^https?:\/\//i.test(raw)
}

export function isLocalStoragePath(raw: string): boolean {
  return (
    raw.startsWith("file:") ||
    !!extractStorageRelativePath(raw) ||
    (!isHttpUrl(raw) && !!extractStorageFileId(raw))
  )
}

/** next/image에 안전하게 넣을 수 있는 http(s) URL인지 (file://, 로컬 경로, storage API 경로 제외) */
export function canUseNextImageSrc(raw: string | null | undefined): boolean {
  if (!raw) return false
  const trimmed = raw.trim()
  if (!trimmed) return false
  if (trimmed.startsWith("file:")) return false
  if (isLocalStoragePath(trimmed)) return false
  if (trimmed.includes("/api/v2/storage")) return false
  return isHttpUrl(trimmed)
}

/** DB/API 저장용 — 브라우저에서 접근 가능한 same-origin 경로 */
export function toStorageFileHttpPath(relativePath: string): string {
  const normalized = relativePath.replace(/\\/g, "/").replace(/^\/+/, "")
  return `/api/v2/storage/files/${normalized}`
}

/**
 * 업로드 응답·저장값을 미리보기/저장에 쓸 URL로 정규화
 * - http(s)는 그대로
 * - file:// 또는 로컬 경로는 /api/v2/storage/files/{relative} 로 변환
 */
export function resolveStorageImageUrl(raw: string | null | undefined): string | null {
  if (!raw) return null
  const trimmed = raw.trim()
  if (!trimmed) return null
  if (isHttpUrl(trimmed)) return trimmed

  const relative = extractStorageRelativePath(trimmed)
  if (relative) return toStorageFileHttpPath(relative)

  return trimmed
}

/** 문자열 전체가 storage file UUID인지 */
export function isBareStorageFileId(raw: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    raw.trim()
  )
}

/** 인증 포함 blob 다운로드용 API 경로 후보 (순서대로 시도) */
export function getStorageFileBlobRequestPaths(raw: string): string[] {
  const paths: string[] = []
  const relative = extractStorageRelativePath(raw)
  if (relative) {
    paths.push(`/storage/files/${relative}`)
    paths.push(`/storage/file/${relative}`)
  }

  const fileId = extractStorageFileId(raw)
  if (fileId) {
    paths.push(`/storage/${encodeURIComponent(fileId)}`)
    paths.push(`/storage/${encodeURIComponent(fileId)}/download`)
    paths.push(`/storage/${encodeURIComponent(fileId)}/file`)
  }

  return [...new Set(paths)]
}
