"use client"

import { useEffect, useState } from "react"
import { getStorageFileInfoV2 } from "@/lib/api/v2/storage"
import { apiV2 } from "@/lib/api/v2/client"
import {
  getStorageFileBlobRequestPaths,
  isBareStorageFileId,
  isHttpUrl,
  isLocalStoragePath,
} from "@/lib/utils/storage-url"

function needsAuthenticatedBlobFetch(raw: string): boolean {
  if (raw.startsWith("blob:")) return false
  if (isLocalStoragePath(raw)) return true
  return raw.includes("/api/v2/storage")
}

async function resolveStorageReference(raw: string): Promise<string | null> {
  const trimmed = raw.trim()
  if (!trimmed) return null

  if (isBareStorageFileId(trimmed)) {
    const info = await getStorageFileInfoV2(trimmed)
    return info?.fileUrl?.trim() ?? null
  }

  return trimmed
}

async function fetchBlobObjectUrl(source: string): Promise<string | null> {
  const requestPaths = getStorageFileBlobRequestPaths(source)

  for (const path of requestPaths) {
    try {
      const res = await apiV2.get(path, { responseType: "blob" })
      const blob = res.data as Blob
      if (!blob || blob.size === 0) continue
      if (
        blob.type &&
        !blob.type.startsWith("image/") &&
        blob.type !== "application/octet-stream"
      ) {
        continue
      }
      return URL.createObjectURL(blob)
    } catch {
      // 다음 경로 시도
    }
  }

  return null
}

/**
 * 저장소 이미지 URL / file ID를 <img src>에 쓸 수 있는 주소로 변환
 * - blob:, http(s) 외부 URL: 그대로 사용
 * - file ID(UUID): GET /storage/{fileId} → fileUrl 조회 후 처리
 * - file:// / 로컬 경로 / /api/v2/storage/*: Bearer 인증 blob 다운로드 후 object URL
 */
export function useStorageImageSrc(
  raw: string | null | undefined
): { src: string | null; isLoading: boolean } {
  const [src, setSrc] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!raw) {
      setSrc(null)
      setIsLoading(false)
      return
    }

    const trimmed = raw.trim()
    if (!trimmed) {
      setSrc(null)
      setIsLoading(false)
      return
    }

    if (trimmed.startsWith("blob:")) {
      setSrc(trimmed)
      setIsLoading(false)
      return
    }

    let objectUrl: string | null = null
    let cancelled = false

    const load = async () => {
      setIsLoading(true)
      setSrc(null)

      try {
        const resolved = await resolveStorageReference(trimmed)
        if (cancelled || !resolved) {
          if (!cancelled) {
            setSrc(null)
            setIsLoading(false)
          }
          return
        }

        if (isHttpUrl(resolved) && !needsAuthenticatedBlobFetch(resolved)) {
          if (!cancelled) {
            setSrc(resolved)
            setIsLoading(false)
          }
          return
        }

        if (!needsAuthenticatedBlobFetch(resolved)) {
          if (!cancelled) {
            setSrc(resolved)
            setIsLoading(false)
          }
          return
        }

        objectUrl = await fetchBlobObjectUrl(resolved)
        if (cancelled) return

        setSrc(objectUrl)
        setIsLoading(false)
      } catch {
        if (!cancelled) {
          setSrc(null)
          setIsLoading(false)
        }
      }
    }

    void load()

    return () => {
      cancelled = true
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [raw])

  return { src, isLoading }
}
