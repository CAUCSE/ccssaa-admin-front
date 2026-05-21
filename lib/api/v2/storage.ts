/**
 * v2 파일 업로드 API
 * POST /api/v2/storage/upload
 */

import { apiV2 } from "./client"
import { unwrapV2 } from "./response"
import type { ApiResponse } from "@/types/api-v2"

const USE_MOCK_API = process.env.NEXT_PUBLIC_USE_MOCK_API === "true"

export interface StorageUploadResponse {
  url?: string
  imageUrl?: string
  fileUrl?: string
  filePath?: string
  path?: string
}

function extractUploadedUrl(data: string | StorageUploadResponse | null | undefined): string {
  if (typeof data === "string") return data
  const url = data?.url ?? data?.imageUrl ?? data?.fileUrl ?? data?.filePath ?? data?.path
  if (!url) {
    throw new Error("업로드 응답에서 이미지 URL을 찾을 수 없습니다.")
  }
  return url
}

/** 이미지 파일 업로드 — multipart/form-data file 파라미터 */
export async function uploadStorageFileV2(file: File): Promise<string> {
  if (USE_MOCK_API) {
    await new Promise((resolve) => setTimeout(resolve, 300))
    return `https://picsum.photos/seed/${encodeURIComponent(file.name)}-${file.size}/160/160`
  }

  const formData = new FormData()
  formData.append("file", file)

  const res = await apiV2.post<ApiResponse<string | StorageUploadResponse>>(
    "/storage/upload",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  )

  return extractUploadedUrl(unwrapV2(res))
}
