"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { UserButton, SignInButton, Show } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { Logo } from "@/components/logo"
import { LayoutDashboard, Trophy, Users, Info, BookOpen, Bell, History } from "lucide-react"

const NAV_LINKS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
  { href: "/friends", label: "Friends", icon: Users },
  { href: "/history", label: "History", icon: History },
]

export function NavBar() {
  const pathname = usePathname()
  const [notificationCount, setNotificationCount] = useState(0)

  useEffect(() => {
    fetch("/api/notifications")
      .then((r) => r.json())
      .then((data) => {
        const count = (data.friendRequests?.length ?? 0) + (data.challengeRequests?.length ?? 0)
        setNotificationCount(count)
      })
      .catch(() => {})
  }, [pathname])

  return (
    <nav className="sticky top-0 z-50 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md">
      <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <div className="shadow-[0_0_15px_rgba(168,85,247,0.4)] rounded-xl">
            <Logo size={36} />
          </div>
          <span className="font-black text-lg tracking-tight text-white hidden sm:block">
            LevelUp
          </span>
        </Link>

        <Show when="signed-in">
          <div className="flex items-center gap-1">
            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.href
              const Icon = link.icon
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                    isActive
                      ? "bg-purple-500/15 text-purple-300"
                      : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
                  }`}
                >
                  <Icon size={15} />
                  <span className="hidden md:inline">{link.label}</span>
                </Link>
              )
            })}

            <Link
              href="/notifications"
              className={`relative flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                pathname === "/notifications"
                  ? "bg-purple-500/15 text-purple-300"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
              }`}
            >
              <Bell size={15} />
              {notificationCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center h-4 w-4 rounded-full bg-fuchsia-500 text-[10px] font-bold text-white">
                  {notificationCount > 9 ? "9+" : notificationCount}
                </span>
              )}
            </Link>

            <div className="ml-2 pl-2 border-l border-zinc-800">
              <UserButton />
            </div>
          </div>
        </Show>

        <Show when="signed-out">
          <div className="flex items-center gap-4">
            <Link href="/how-it-works" className="text-sm font-semibold text-zinc-400 hover:text-zinc-200">
              How It Works
            </Link>
            <Link href="/about" className="text-sm font-semibold text-zinc-400 hover:text-zinc-200">
              About
            </Link>
            <SignInButton mode="modal">
              <Button className="bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-white font-bold shadow-[0_0_15px_rgba(168,85,247,0.3)]">
                Sign In
              </Button>
            </SignInButton>
          </div>
        </Show>
      </div>
    </nav>
  )
}