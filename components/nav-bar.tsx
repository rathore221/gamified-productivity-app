"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { UserButton, SignInButton, Show } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { Logo } from "@/components/logo"
import { LayoutDashboard, Trophy, Users, BookOpen, Bell, History, Archive } from "lucide-react"

const NAV_LINKS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
  { href: "/friends", label: "Friends", icon: Users },
  { href: "/history", label: "History", icon: History },
  { href: "/archive", label: "Archive", icon: Archive },
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
    <nav className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/90 backdrop-blur-md">
      <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <Logo size={32} />
          <span className="font-semibold text-base tracking-tight text-white hidden sm:block">
            LevelUp
          </span>
        </Link>

        <Show when="signed-in">
          <div className="flex items-center gap-0.5">
            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.href
              const Icon = link.icon
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={
                    isActive
                      ? "flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium bg-slate-800/80 text-white transition-colors"
                      : "flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-900 transition-colors"
                  }
                >
                  <Icon size={15} />
                  <span className="hidden lg:inline">{link.label}</span>
                </Link>
              )
            })}

            <Link
              href="/notifications"
              className={
                pathname === "/notifications"
                  ? "relative flex items-center px-2.5 py-2 rounded-md bg-slate-800/80 text-white transition-colors"
                  : "relative flex items-center px-2.5 py-2 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-900 transition-colors"
              }
            >
              <Bell size={15} />
              {notificationCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center h-4 w-4 rounded-full bg-indigo-500 text-[10px] font-semibold text-white">
                  {notificationCount > 9 ? "9+" : notificationCount}
                </span>
              )}
            </Link>

            <div className="ml-2 pl-2 border-l border-slate-800">
              <UserButton />
            </div>
          </div>
        </Show>

        <Show when="signed-out">
          <div className="flex items-center gap-6">
            <Link href="/how-it-works" className="text-sm font-medium text-slate-400 hover:text-slate-200">
              How It Works
            </Link>
            <Link href="/about" className="text-sm font-medium text-slate-400 hover:text-slate-200">
              About
            </Link>
            <SignInButton mode="modal">
              <Button className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium">
                Sign In
              </Button>
            </SignInButton>
          </div>
        </Show>
      </div>
    </nav>
  )
}