/**
 * v2 파일 업로드 API
 * POST /api/v2/storage/upload
 */

import { apiV2 } from "./client"
import { unwrapV2 } from "./response"
import type { ApiResponse } from "@/types/api-v2"
import {
  extractStorageFileId,
  isHttpUrl,
  resolveStorageImageUrl,
} from "@/lib/utils/storage-url"

const USE_MOCK_API = process.env.NEXT_PUBLIC_USE_MOCK_API === "true"

/** 백엔드 FilePath enum — POST /api/v2/storage/upload 의 type 파라미터 */
export type StorageFilePath =
  | "USER_PROFILE"
  | "USER_ADMISSION"
  | "USER_ACADEMIC_RECORD_APPLICATION"
  | "CIRCLE_PROFILE"
  | "POST"
  | "CALENDAR"
  | "EVENT"
  | "CEREMONY"
  | "ETC"

export interface StorageUploadResponse {
  id?: string
  fileId?: string
  url?: string
  imageUrl?: string
  fileUrl?: string
  /** 서버 로컬 경로 — 브라우저 미리보기에 직접 사용 불가 */
  filePath?: string
  path?: string
}

function extractUploadedUrl(data: string | StorageUploadResponse | null | undefined): string {
  if (typeof data === "string") {
    const resolved = resolveStorageImageUrl(data)
    if (resolved) return resolved
    throw new Error("업로드 응답에서 이미지 URL을 찾을 수 없습니다.")
  }

  const httpCandidate = [data?.url, data?.imageUrl, data?.fileUrl].find(
    (value) => value && isHttpUrl(value)
  )
  if (httpCandidate) return httpCandidate

  const localCandidate = data?.filePath ?? data?.path ?? data?.url ?? data?.fileUrl
  if (localCandidate) {
    const resolved = resolveStorageImageUrl(localCandidate)
    if (resolved) return resolved
  }

  const fileId = data?.id ?? data?.fileId
  if (fileId) {
    const resolved = resolveStorageImageUrl(fileId)
    if (resolved) return resolved
    return `/api/v2/storage/${encodeURIComponent(fileId)}`
  }

  throw new Error("업로드 응답에서 이미지 URL을 찾을 수 없습니다.")
}

function extractUploadedFileId(
  data: string | StorageUploadResponse | null | undefined
): string {
  if (typeof data === "string") {
    const trimmed = data.trim()
    const fromPath = extractStorageFileId(trimmed)
    if (fromPath) return fromPath
    if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(trimmed)) {
      return trimmed
    }
    throw new Error("업로드 응답에서 파일 ID를 찾을 수 없습니다.")
  }

  const fileId = data?.id ?? data?.fileId
  if (fileId) return fileId

  const localCandidate = data?.filePath ?? data?.path ?? data?.url ?? data?.fileUrl
  if (localCandidate) {
    const fromPath = extractStorageFileId(localCandidate)
    if (fromPath) return fromPath
  }

  throw new Error("업로드 응답에서 파일 ID를 찾을 수 없습니다.")
}

/** 파일 업로드 — multipart/form-data: file, type(FilePath). 미리보기용 URL/경로 반환 */
export async function uploadStorageFileV2(
  file: File,
  filePath: StorageFilePath
): Promise<string> {
  if (USE_MOCK_API) {
    await new Promise((resolve) => setTimeout(resolve, 300))
    return `https://picsum.photos/seed/${encodeURIComponent(file.name)}-${file.size}/160/160`
  }

  const formData = new FormData()
  formData.append("file", file)
  formData.append("type", filePath)

  const res = await apiV2.post<ApiResponse<string | StorageUploadResponse>>(
    "/storage/upload",
    formData
  )

  return extractUploadedUrl(unwrapV2(res))
}

/** 파일 업로드 후 storage file id 반환 (게시판 공식 프로필 등 ID 저장용) */
export async function uploadStorageFileIdV2(
  file: File,
  filePath: StorageFilePath
): Promise<string> {
  if (USE_MOCK_API) {
    await new Promise((resolve) => setTimeout(resolve, 300))
    return crypto.randomUUID()
  }

  const formData = new FormData()
  formData.append("file", file)
  formData.append("type", filePath)

  const res = await apiV2.post<ApiResponse<string | StorageUploadResponse>>(
    "/storage/upload",
    formData
  )

  return extractUploadedFileId(unwrapV2(res))
}
