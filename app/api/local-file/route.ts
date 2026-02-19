/**
 * 로컬 개발 전용 파일 프록시
 * file:// 경로의 이미지를 HTTP로 서빙합니다.
 * dev/prod 환경에서는 사용되지 않습니다.
 */

import { NextRequest, NextResponse } from "next/server"
import { readFile } from "fs/promises"
import { existsSync } from "fs"
import path from "path"

const MIME_MAP: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
}

export async function GET(request: NextRequest) {
  const filePath = request.nextUrl.searchParams.get("path")

  if (!filePath) {
    return NextResponse.json({ error: "path is required" }, { status: 400 })
  }

  const resolved = path.resolve(filePath)

  if (!existsSync(resolved)) {
    return NextResponse.json({ error: "file not found" }, { status: 404 })
  }

  try {
    const buffer = await readFile(resolved)
    const ext = path.extname(resolved).toLowerCase()
    const contentType = MIME_MAP[ext] || "application/octet-stream"

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "private, max-age=3600",
      },
    })
  } catch {
    return NextResponse.json({ error: "failed to read file" }, { status: 500 })
  }
}
