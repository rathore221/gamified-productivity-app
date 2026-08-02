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
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="max-w-2xl mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-black tracking-wide flex items-center gap-2">
            <Trophy className="text-yellow-400" size={24} />
            Leaderboard
          </h1>
          {tab === "weekly" && resetsAt && <ResetCountdown resetsAt={resetsAt} />}
        </div>

        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex gap-2 rounded-xl border border-zinc-800 bg-zinc-900/50 p-1 w-fit">
            <button
              onClick={() => setTab("weekly")}
              className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-colors ${
                tab === "weekly" ? "bg-purple-600 text-white" : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              This Week
            </button>
            <button
              onClick={() => setTab("allTime")}
              className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-colors ${
                tab === "allTime" ? "bg-purple-600 text-white" : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              All Time
            </button>
          </div>

          <div className="flex gap-2 rounded-xl border border-zinc-800 bg-zinc-900/50 p-1 w-fit">
            <button
              onClick={() => setScope("global")}
              className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-colors flex items-center gap-1.5 ${
                scope === "global" ? "bg-fuchsia-600 text-white" : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <Globe size={14} /> Global
            </button>
            <button
              onClick={() => setScope("friends")}
              className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-colors flex items-center gap-1.5 ${
                scope === "friends" ? "bg-fuchsia-600 text-white" : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <Users size={14} /> Friends
            </button>
          </div>
        </div>

        {loading && <p className="text-zinc-600 text-sm">Loading...</p>}
        {!loading && users.length === 0 && scope === "friends" && (
          <p className="text-zinc-600 text-sm">Add some friends to see them here.</p>
        )}
        {!loading && users.length === 0 && scope === "global" && (
          <p className="text-zinc-600 text-sm">No players yet. Be the first!</p>
        )}

        <div className="space-y-2">
          {users.map((user, index) => {
            const score = tab === "weekly" ? user.weeklyXp : user.xp
            const rank = index + 1
            return (
              <div
                key={user.id}
                className={`flex items-center gap-3 rounded-xl border p-3 backdrop-blur-md ${
                  rank === 1
                    ? "border-yellow-500/50 bg-gradient-to-r from-yellow-500/10 to-transparent"
                    : rank === 2
                    ? "border-zinc-400/40 bg-gradient-to-r from-zinc-400/10 to-transparent"
                    : rank === 3
                    ? "border-orange-600/40 bg-gradient-to-r from-orange-600/10 to-transparent"
                    : "border-zinc-800 bg-zinc-900/50"
                }`}
              >
                <span className="w-6 flex justify-center">
                  {rank === 1 && <Crown className="text-yellow-400" size={18} />}
                  {rank === 2 && <Medal className="text-zinc-300" size={18} />}
                  {rank === 3 && <Medal className="text-orange-500" size={18} />}
                  {rank > 3 && <span className="text-zinc-500 font-mono">{rank}</span>}
                </span>

                <Avatar>
                  <AvatarImage src={user.imageUrl ?? undefined} />
                  <AvatarFallback className="bg-zinc-800 text-zinc-300">
                    {(user.name ?? "?").charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <span className="flex-1 font-medium truncate text-zinc-100">
                  {user.name ?? "Anonymous"}
                </span>

                {user.trophiesCount > 0 && (
                  <span className="flex items-center gap-1 text-xs text-yellow-400">
                    <Trophy size={12} /> {user.trophiesCount}
                  </span>
                )}

                <Badge className="bg-zinc-800 text-zinc-300 border-zinc-700">
                  Lvl {user.level}
                </Badge>

                <span className="font-mono text-sm font-bold text-purple-400 w-20 text-right">
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

  return <span className="text-xs text-zinc-500 font-mono">{label}</span>
}