"use client"

import { useEffect, useState } from "react"
import DOMPurify from "dompurify"

import { shouldRenderPostHtml } from "@/lib/utils/post-admin"

interface PostContentProps {
  content: string
  isCrawled: boolean
}

function sanitizeCrawledHtml(content: string): string {
  const sanitized = DOMPurify.sanitize(content, {
    FORBID_TAGS: [
      "script",
      "style",
      "iframe",
      "object",
      "embed",
      "form",
      "input",
      "button",
      "textarea",
      "select",
      "option",
      "link",
      "meta",
    ],
    FORBID_ATTR: ["style"],
  })
  const parsed = new DOMParser().parseFromString(sanitized, "text/html")
  parsed.querySelectorAll("a").forEach((anchor) => {
    anchor.target = "_blank"
    anchor.rel = "noopener noreferrer"
  })
  return parsed.body.innerHTML
}

export function PostContent({ content, isCrawled }: PostContentProps) {
  const [sanitizedHtml, setSanitizedHtml] = useState<string | null>(null)
  const renderHtml = shouldRenderPostHtml(isCrawled)

  useEffect(() => {
    setSanitizedHtml(renderHtml ? sanitizeCrawledHtml(content) : null)
  }, [content, renderHtml])

  if (!renderHtml) {
    return <div className="min-h-32 whitespace-pre-wrap border-t pt-5">{content}</div>
  }

  if (sanitizedHtml === null) {
    return <div className="min-h-32 border-t pt-5 text-sm text-muted-foreground">본문을 불러오는 중입니다.</div>
  }

  if (!sanitizedHtml.trim()) {
    return <div className="min-h-32 border-t pt-5 text-sm text-muted-foreground">표시할 본문이 없습니다.</div>
  }

  return (
    <div
      className="min-h-32 overflow-hidden border-t pt-5 text-sm leading-7 [&_a]:break-all [&_a]:text-primary [&_a]:underline [&_blockquote]:border-l-4 [&_blockquote]:pl-4 [&_h1]:mb-4 [&_h1]:text-2xl [&_h1]:font-bold [&_h2]:mb-3 [&_h2]:text-xl [&_h2]:font-semibold [&_h3]:mb-2 [&_h3]:text-lg [&_h3]:font-semibold [&_img]:my-4 [&_img]:h-auto [&_img]:max-w-full [&_li]:ml-5 [&_ol]:list-decimal [&_p]:my-3 [&_table]:block [&_table]:max-w-full [&_table]:overflow-x-auto [&_td]:border [&_td]:p-2 [&_th]:border [&_th]:bg-muted [&_th]:p-2 [&_ul]:list-disc"
      dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
    />
  )
}
