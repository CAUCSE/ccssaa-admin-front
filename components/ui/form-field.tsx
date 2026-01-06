"use client"

import * as React from "react"
import { Input, InputProps } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

interface FormFieldProps extends InputProps {
  label?: string
  error?: string
  helperText?: string
}

/**
 * Form Field with Error Message
 * 입력 필드와 에러 메시지를 함께 표시하는 컴포넌트
 */
export const FormField = React.forwardRef<HTMLInputElement, FormFieldProps>(
  ({ label, error, helperText, className, ...props }, ref) => {
    const hasError = !!error
    const inputClassName = cn(
      hasError && "border-red-500 focus-visible:ring-red-500",
      className
    )

    return (
      <div className="space-y-2">
        {label && (
          <Label htmlFor={props.id} className={hasError ? "text-red-500" : ""}>
            {label}
          </Label>
        )}
        <Input
          ref={ref}
          className={inputClassName}
          aria-invalid={hasError}
          aria-describedby={
            error ? `${props.id}-error` : helperText ? `${props.id}-helper` : undefined
          }
          {...props}
        />
        {error && (
          <p id={`${props.id}-error`} className="text-sm text-red-500">
            {error}
          </p>
        )}
        {!error && helperText && (
          <p id={`${props.id}-helper`} className="text-sm text-muted-foreground">
            {helperText}
          </p>
        )}
      </div>
    )
  }
)
FormField.displayName = "FormField"

