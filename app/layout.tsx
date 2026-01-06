"use client"

import { useState } from "react"
import { QueryClientProvider } from "@tanstack/react-query"
import { queryClient } from "@/lib/queryClient"
import { Sidebar } from "@/components/layout/Sidebar"
import { Header } from "@/components/layout/Header"
import { Toaster } from "@/components/ui/toaster"
import "./globals.css"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <html lang="ko">
      <body>
        <QueryClientProvider client={queryClient}>
          <div className="flex h-screen overflow-hidden">
            {/* Desktop Sidebar */}
            <Sidebar isOpen={true} isMobile={false} />
            {/* Mobile Sidebar Drawer */}
            <Sidebar
              isOpen={sidebarOpen}
              onClose={() => setSidebarOpen(false)}
              isMobile={true}
            />
            <div className="flex flex-1 flex-col overflow-hidden">
              <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
              <main className="flex-1 overflow-y-auto p-6 lg:p-6 md:p-4">
                {children}
              </main>
            </div>
          </div>
          <Toaster />
        </QueryClientProvider>
      </body>
    </html>
  )
}

