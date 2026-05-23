import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const semanticDot =
  "before:h-1.5 before:w-1.5 before:shrink-0 before:rounded-full before:content-['']"

const badgeVariants = cva(
  "inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/90",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-[hsl(var(--danger-border))] bg-[hsl(var(--danger-background))] text-[hsl(var(--danger))]",
        outline: "border-border bg-transparent text-foreground",
        success: cn(
          semanticDot,
          "border-[hsl(var(--success-border))] bg-[hsl(var(--success-background))] text-[hsl(var(--success))] before:bg-[hsl(var(--success))]"
        ),
        warning: cn(
          semanticDot,
          "border-[hsl(var(--warning-border))] bg-[hsl(var(--warning-background))] text-[hsl(var(--warning))] before:bg-[hsl(var(--warning))]"
        ),
        danger: cn(
          semanticDot,
          "border-[hsl(var(--danger-border))] bg-[hsl(var(--danger-background))] text-[hsl(var(--danger))] before:bg-[hsl(var(--danger))]"
        ),
        neutral: cn(
          semanticDot,
          "border-[hsl(var(--neutral-border))] bg-[hsl(var(--neutral-background))] text-[hsl(var(--neutral))] before:bg-[hsl(var(--neutral))]"
        ),
        muted:
          "border-[hsl(var(--neutral-border))] bg-[hsl(var(--neutral-background))] text-muted-foreground",
        info: cn(
          semanticDot,
          "border-[hsl(var(--info-border))] bg-[hsl(var(--info-background))] text-[hsl(var(--info))] before:bg-[hsl(var(--info))]"
        ),
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
