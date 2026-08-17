import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter, JetBrains_Mono, Syne, Space_Grotesk } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
})
const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
})
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space",
})

export const metadata: Metadata = {
  title: "LATCH - Modern 8085 Microprocessor Simulator",
  description:
    "A cloud-based, visualization-rich 8085 emulator for students and engineers. Write, debug, and understand assembly code.",
  icons: {
    icon: "/latch-logo.svg",
    shortcut: "/latch-logo.svg",
    apple: "/latch-logo.svg",
  },
}

export const viewport: Viewport = {
  themeColor: "#050505",
}

import { Providers } from "@/components/providers"
import GlobalCursor from "@/components/ui/global-cursor"

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${jetbrainsMono.variable} ${syne.variable} ${spaceGrotesk.variable} font-sans antialiased`} suppressHydrationWarning>
        <Providers>
          <GlobalCursor />
          {children}
          <Analytics />
        </Providers>
      </body>
    </html>
  )
}
