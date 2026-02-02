import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * shadcn/ui 기본: h-10(40px) + py-2(8px 상하) + border(2px) → 내용 영역 22px.
 * 높이를 h-9(36px)로 줄일 때는 py도 함께 줄여야 border 잘림 방지: h-9 py-1.5 권장.
 */

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-transparent focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }

