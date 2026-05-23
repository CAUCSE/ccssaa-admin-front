"use client"

import Image from "next/image"
import { cn } from "@/lib/utils"
import { useStorageImageSrc } from "@/hooks/useStorageImageSrc"
import { canUseNextImageSrc } from "@/lib/utils/storage-url"

type StorageImageProps = {
  src: string | null | undefined
  alt: string
  className?: string
  fill?: boolean
  width?: number
  height?: number
  sizes?: string
  unoptimized?: boolean
  onClick?: (e: React.MouseEvent<HTMLElement>) => void
}

export function StorageImage({
  src,
  alt,
  className,
  fill,
  width,
  height,
  sizes,
  unoptimized,
  onClick,
}: StorageImageProps) {
  const trimmed = src?.trim() ?? ""
  const useNextImage = canUseNextImageSrc(trimmed)
  const { src: resolvedSrc, isLoading } = useStorageImageSrc(
    useNextImage ? null : trimmed || null
  )

  if (!trimmed) return null

  if (useNextImage) {
    if (fill) {
      return (
        <Image
          src={trimmed}
          alt={alt}
          fill
          sizes={sizes}
          unoptimized={unoptimized}
          className={className}
          onClick={onClick}
        />
      )
    }

    return (
      <Image
        src={trimmed}
        alt={alt}
        width={width ?? 640}
        height={height ?? 360}
        sizes={sizes}
        unoptimized={unoptimized}
        className={className}
        onClick={onClick}
      />
    )
  }

  const placeholderClassName = cn(
    "flex items-center justify-center bg-muted text-xs text-muted-foreground",
    fill && "absolute inset-0 h-full w-full",
    className
  )

  if (isLoading) {
    return (
      <div className={placeholderClassName} onClick={onClick}>
        로딩…
      </div>
    )
  }

  if (!resolvedSrc) {
    return (
      <div className={placeholderClassName} onClick={onClick}>
        미리보기 불가
      </div>
    )
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={resolvedSrc}
      alt={alt}
      width={fill ? undefined : width}
      height={fill ? undefined : height}
      className={cn(fill && "absolute inset-0 h-full w-full", className)}
      onClick={onClick}
    />
  )
}
