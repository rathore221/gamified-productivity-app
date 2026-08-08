import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { ClerkProvider } from "@clerk/nextjs"
import { Toaster } from "@/components/ui/sonner"
import { NavBar } from "@/components/nav-bar"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
})

export const metadata: Metadata = {
  title: "Gamified Productivity",
  description: "Beat the clock. Earn XP. Level up.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider afterSignOutUrl="/">
      <html lang="en" className={inter.variable}>
        <body className="antialiased font-sans">
          <NavBar />
          {children}
          <Toaster richColors position="top-center" />
        </body>
      </html>
    </ClerkProvider>
  )
}