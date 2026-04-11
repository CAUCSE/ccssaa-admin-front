import Image from "next/image"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface BrandLogoProps {
  compact?: boolean
  className?: string
}

export function BrandLogo({ compact = false, className }: BrandLogoProps) {
  return (
    <Link
      href="/dashboard"
      className={cn(
        "inline-flex items-center rounded-md transition-opacity hover:opacity-85",
        className
      )}
      aria-label="CCSSAA 관리자 홈으로 이동"
    >
      <Image
        src="/branding/ccssaa-logo.png"
        alt="CCSSAA 로고"
        width={compact ? 112 : 132}
        height={compact ? 17 : 20}
        priority
        className="h-auto w-auto"
      />
    </Link>
  )
}
