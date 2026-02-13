"use client"

import { AuthLayoutProvider } from "@/components/layout/AuthLayout"
import "./globals.css"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <AuthLayoutProvider>{children}</AuthLayoutProvider>
      </body>
    </html>
  )
}
