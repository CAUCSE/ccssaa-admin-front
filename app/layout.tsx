import type { Metadata } from "next"
import { AuthLayoutProvider } from "@/components/layout/AuthLayout"
import { TooltipProvider } from "@/components/ui/tooltip"
import "./globals.css"

export const metadata: Metadata = {
  title: "CCSSAA 관리자",
  icons: {
    icon: "/branding/favicon.png",
    shortcut: "/branding/favicon.png",
    apple: "/branding/favicon.png",
  },
}

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
