"use client"

import { useState } from "react"
import { ImageOff, Maximize2 } from "lucide-react"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { StorageImage } from "@/components/ui/storage-image"
import { getPostImageAlt } from "@/lib/utils/post-admin"

interface PostImageGalleryProps {
  imageUrls: string[]
  postTitle: string | null
}

export function PostImageGallery({ imageUrls, postTitle }: PostImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [failedUrls, setFailedUrls] = useState<Set<string>>(new Set())
  const selectedUrl = selectedIndex === null ? null : imageUrls[selectedIndex]

  const markFailed = (url: string) => {
    setFailedUrls((current) => new Set(current).add(url))
  }

  if (imageUrls.length === 0) return null

  return (
    <section className="border-t pt-5" aria-labelledby="post-images-title">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 id="post-images-title" className="text-sm font-medium">게시물 이미지</h3>
        <span className="text-xs text-muted-foreground">{imageUrls.length}장</span>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {imageUrls.map((url, index) => {
          const alt = getPostImageAlt(postTitle, index)
          const failed = failedUrls.has(url)
          return (
            <button key={`${url}-${index}`} type="button" className="group relative aspect-square overflow-hidden rounded-lg border bg-muted text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" onClick={() => !failed && setSelectedIndex(index)} aria-label={`${alt} 크게 보기`} disabled={failed}>
              {failed ? <span className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-xs text-muted-foreground"><ImageOff className="h-6 w-6" />이미지를 불러올 수 없습니다</span> : <><StorageImage src={url} alt={alt} fill sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw" className="object-cover transition-transform duration-200 group-hover:scale-105" onError={() => markFailed(url)} /><span className="absolute bottom-2 right-2 rounded-md bg-black/65 p-1.5 text-white opacity-0 transition-opacity group-hover:opacity-100"><Maximize2 className="h-4 w-4" /></span></>}
            </button>
          )
        })}
      </div>
      <Dialog open={selectedIndex !== null} onOpenChange={(open) => !open && setSelectedIndex(null)}>
        <DialogContent className="max-h-[92vh] max-w-5xl overflow-auto bg-black/95 p-3 text-white sm:p-5">
          <DialogHeader className="pr-8"><DialogTitle>{selectedIndex === null ? "게시물 이미지" : getPostImageAlt(postTitle, selectedIndex)}</DialogTitle><DialogDescription className="text-zinc-300">이미지 바깥 영역이나 닫기 버튼을 눌러 돌아갈 수 있습니다.</DialogDescription></DialogHeader>
          {selectedUrl && <div className="flex min-h-[240px] items-center justify-center"><StorageImage src={selectedUrl} alt={getPostImageAlt(postTitle, selectedIndex ?? 0)} width={1600} height={1200} sizes="90vw" className="max-h-[75vh] h-auto w-auto max-w-full object-contain" unoptimized onError={() => markFailed(selectedUrl)} /></div>}
        </DialogContent>
      </Dialog>
    </section>
  )
}
