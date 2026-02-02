import * as React from "react"
import { Check } from "lucide-react"

import { cn } from "@/lib/utils"

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, checked, onCheckedChange, ...props }, ref) => {
    return (
      <div className="relative inline-flex h-4 w-4 shrink-0 items-center justify-center">
        <input
          type="checkbox"
          ref={ref}
          checked={checked}
          onChange={(e) => onCheckedChange?.(e.target.checked)}
          className={cn(
            "absolute inset-0 h-4 w-4 rounded-[4px] border border-primary bg-background ring-offset-background cursor-pointer appearance-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            "checked:bg-primary checked:border-primary",
            className
          )}
          {...props}
        />
        {checked && (
          <span className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <Check className="h-3 w-3 text-primary-foreground stroke-[3]" />
          </span>
        )}
      </div>
    )
  }
)
Checkbox.displayName = "Checkbox"

export { Checkbox }
