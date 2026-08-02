import type { Metadata } from "next"
import { ClerkProvider } from "@clerk/nextjs"
import { Toaster } from "@/components/ui/sonner"
import { NavBar } from "@/components/nav-bar"
import "./globals.css"

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
      <html lang="en">
        <body className="antialiased">
          <NavBar />
          {children}
          <Toaster richColors position="top-center" />
        </body>
      </html>
    </ClerkProvider>
  )
}