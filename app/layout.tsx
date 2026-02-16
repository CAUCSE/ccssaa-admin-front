"use client"

import { AuthLayoutProvider } from "@/components/layout/AuthLayout"
import { TooltipProvider } from "@/components/ui/tooltip"
import "./globals.css"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <TooltipProvider delayDuration={300}>
          <AuthLayoutProvider>{children}</AuthLayoutProvider>
        </TooltipProvider>
      </body>
    </html>
  )
}
