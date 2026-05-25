import type { Metadata, Viewport } from "next"
import { AuthLayoutProvider } from "@/components/layout/AuthLayout"
import { TooltipProvider } from "@/components/ui/tooltip"
import "./globals.css"

export const metadata: Metadata = {
  title: "CCSSAA 관리자",
  description: "중앙대학교 컴퓨터공학부 동문회 관리자 페이지",
  icons: {
    icon: "/branding/favicon.png",
    shortcut: "/branding/favicon.png",
    apple: "/branding/favicon.png",
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "CCSSAA Admin",
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
}

export const viewport: Viewport = {
  themeColor: "#1e40af",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
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
