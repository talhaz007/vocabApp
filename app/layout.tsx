import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { SiteHeader } from "@/components/site-header"
import { AiChat } from "@/components/ai-chat"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Vocabulary - Enhance Your Vocabulary",
  description: "Enhance your vocabulary with flashcards, mnemonics, adaptive learning, and progress feedback.",
  generator: "v0.dev",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <div className="relative flex min-h-screen flex-col">
            <SiteHeader />
            <main className="flex-1">{children}</main>
            <AiChat />
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}

import "./globals.css"



import './globals.css'