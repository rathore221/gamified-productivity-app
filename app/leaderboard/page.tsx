"use client"

import { useEffect, useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Crown, Medal, Trophy, Globe, Users } from "lucide-react"

interface LeaderboardUser {
  id: string
  name: string | null
  imageUrl: string | null
  xp: number
  level: number
  weeklyXp: number
  trophiesCount: number
}

type Tab = "weekly" | "allTime"
type Scope = "global" | "friends"

export default function LeaderboardPage() {
  const [weekly, setWeekly] = useState<LeaderboardUser[]>([])
  const [allTime, setAllTime] = useState<LeaderboardUser[]>([])
  const [resetsAt, setResetsAt] = useState<string | null>(null)
  const [tab, setTab] = useState<Tab>("weekly")
  const [scope, setScope] = useState<Scope>("global")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    const url = scope === "friends" ? "/api/leaderboard?scope=friends" : "/api/leaderboard"
    fetch(url)
      .then((r) => r.json())
      .then((data) => {
        setWeekly(data.weekly ?? [])
        setAllTime(data.allTime ?? [])
        setResetsAt(data.resetsAt ?? null)
        setLoading(false)
      })
  }, [scope])

  const users = tab === "weekly" ? weekly : allTime

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="max-w-2xl mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold tracking-tight flex items-center gap-2">
            <Trophy className="text-amber-400" size={22} />
            Leaderboard
          </h1>
          {tab === "weekly" && resetsAt && <ResetCountdown resetsAt={resetsAt} />}
        </div>

        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex gap-1 rounded-lg border border-slate-800 bg-slate-900/60 p-1 w-fit">
            <button
              onClick={() => setTab("weekly")}
              className={
                tab === "weekly"
                  ? "px-4 py-1.5 rounded-md text-sm font-medium bg-indigo-600 text-white transition-colors"
                  : "px-4 py-1.5 rounded-md text-sm font-medium text-slate-400 hover:text-slate-200 transition-colors"
              }
            >
              This Week
            </button>
            <button
              onClick={() => setTab("allTime")}
              className={
                tab === "allTime"
                  ? "px-4 py-1.5 rounded-md text-sm font-medium bg-indigo-600 text-white transition-colors"
                  : "px-4 py-1.5 rounded-md text-sm font-medium text-slate-400 hover:text-slate-200 transition-colors"
              }
            >
              All Time
            </button>
          </div>

          <div className="flex gap-1 rounded-lg border border-slate-800 bg-slate-900/60 p-1 w-fit">
            <button
              onClick={() => setScope("global")}
              className={
                scope === "global"
                  ? "px-3 py-1.5 rounded-md text-sm font-medium bg-indigo-600 text-white transition-colors flex items-center gap-1.5"
                  : "px-3 py-1.5 rounded-md text-sm font-medium text-slate-400 hover:text-slate-200 transition-colors flex items-center gap-1.5"
              }
            >
              <Globe size={13} /> Global
            </button>
            <button
              onClick={() => setScope("friends")}
              className={
                scope === "friends"
                  ? "px-3 py-1.5 rounded-md text-sm font-medium bg-indigo-600 text-white transition-colors flex items-center gap-1.5"
                  : "px-3 py-1.5 rounded-md text-sm font-medium text-slate-400 hover:text-slate-200 transition-colors flex items-center gap-1.5"
              }
            >
              <Users size={13} /> Friends
            </button>
          </div>
        </div>

        {loading && <p className="text-slate-500 text-sm">Loading...</p>}
        {!loading && users.length === 0 && scope === "friends" && (
          <p className="text-slate-500 text-sm">Add some friends to see them here.</p>
        )}
        {!loading && users.length === 0 && scope === "global" && (
          <p className="text-slate-500 text-sm">No players yet. Be the first!</p>
        )}

        <div className="space-y-2">
          {users.map((user, index) => {
            const score = tab === "weekly" ? user.weeklyXp : user.xp
            const rank = index + 1
            return (
              <div
                key={user.id}
                className={
                  rank === 1
                    ? "flex items-center gap-3 rounded-xl border p-3 border-amber-700/40 bg-amber-950/10"
                    : rank === 2
                    ? "flex items-center gap-3 rounded-xl border p-3 border-slate-600/40 bg-slate-800/20"
                    : rank === 3
                    ? "flex items-center gap-3 rounded-xl border p-3 border-orange-800/40 bg-orange-950/10"
                    : "flex items-center gap-3 rounded-xl border p-3 border-slate-800 bg-slate-900/60"
                }
              >
                <span className="w-6 flex justify-center">
                  {rank === 1 && <Crown className="text-amber-400" size={17} />}
                  {rank === 2 && <Medal className="text-slate-300" size={17} />}
                  {rank === 3 && <Medal className="text-orange-500" size={17} />}
                  {rank > 3 && <span className="text-slate-500 font-mono text-sm">{rank}</span>}
                </span>

                <Avatar>
                  <AvatarImage src={user.imageUrl ?? undefined} />
                  <AvatarFallback className="bg-slate-800 text-slate-300">
                    {(user.name ?? "?").charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <span className="flex-1 font-medium truncate text-slate-100">
                  {user.name ?? "Anonymous"}
                </span>

                {user.trophiesCount > 0 && (
                  <span className="flex items-center gap-1 text-xs text-amber-400">
                    <Trophy size={12} /> {user.trophiesCount}
                  </span>
                )}

                <Badge className="bg-slate-800 text-slate-300 border-slate-700">
                  Lvl {user.level}
                </Badge>

                <span className="font-mono text-sm font-medium text-indigo-400 w-20 text-right">
                  {score} XP
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function ResetCountdown({ resetsAt }: { resetsAt: string }) {
  const [label, setLabel] = useState("")

  useEffect(() => {
    function update() {
      const diffMs = new Date(resetsAt).getTime() - Date.now()
      if (diffMs <= 0) {
        setLabel("Resetting...")
        return
      }
      const hours = Math.floor(diffMs / (1000 * 60 * 60))
      const mins = Math.floor((diffMs / (1000 * 60)) % 60)
      setLabel(`Resets in ${hours}h ${mins}m`)
    }
    update()
    const interval = setInterval(update, 60000)
    return () => clearInterval(interval)
  }, [resetsAt])

  return <span className="text-xs text-slate-500 font-mono">{label}</span>
}