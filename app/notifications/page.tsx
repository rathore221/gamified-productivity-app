"use client"

import { useEffect, useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { Bell, Check, X, Swords, UserPlus } from "lucide-react"

interface FriendRequest {
  friendshipId: string
  user: { id: string; name: string | null; imageUrl: string | null; level: number }
}

interface ChallengeRequest {
  challengeId: string
  category: string
  duration: "ONE_DAY" | "ONE_WEEK"
  wagerXP: number
  challenger: { id: string; name: string | null; imageUrl: string | null }
}

export default function NotificationsPage() {
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([])
  const [challengeRequests, setChallengeRequests] = useState<ChallengeRequest[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    load()
  }, [])

  function load() {
    fetch("/api/notifications")
      .then((r) => r.json())
      .then((data) => {
        setFriendRequests(data.friendRequests ?? [])
        setChallengeRequests(data.challengeRequests ?? [])
        setLoading(false)
      })
  }

  async function respondFriend(friendshipId: string, status: "ACCEPTED" | "DECLINED") {
    const res = await fetch("/api/friends/respond", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ friendshipId, status }),
    })
    if (res.ok) {
      toast.success(status === "ACCEPTED" ? "Friend added" : "Request declined")
      setFriendRequests((prev) => prev.filter((r) => r.friendshipId !== friendshipId))
    }
  }

  async function respondChallenge(challengeId: string, status: "ACCEPTED" | "DECLINED") {
    const res = await fetch("/api/challenges/respond", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ challengeId, status }),
    })
    if (res.ok) {
      toast.success(status === "ACCEPTED" ? "Challenge accepted!" : "Challenge declined")
      setChallengeRequests((prev) => prev.filter((c) => c.challengeId !== challengeId))
    }
  }

  const totalCount = friendRequests.length + challengeRequests.length

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="max-w-2xl mx-auto p-6 space-y-6">
        <h1 className="text-2xl font-black tracking-wide flex items-center gap-2">
          <Bell className="text-purple-400" size={24} />
          Notifications
          {totalCount > 0 && (
            <Badge className="bg-purple-600 text-white border-none">{totalCount}</Badge>
          )}
        </h1>

        {loading && <p className="text-zinc-600 text-sm">Loading...</p>}

        {!loading && totalCount === 0 && (
          <div className="rounded-2xl border border-dashed border-zinc-800 py-16 text-center">
            <Bell className="mx-auto mb-3 text-zinc-700" size={32} />
            <p className="text-sm text-zinc-500 font-medium">You're all caught up</p>
          </div>
        )}

        {friendRequests.length > 0 && (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 backdrop-blur-md p-4 space-y-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
              <UserPlus size={14} /> Friend Requests
            </h2>
            {friendRequests.map((req) => (
              <div key={req.friendshipId} className="flex items-center gap-3 rounded-lg border border-zinc-800 p-3">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={req.user.imageUrl ?? undefined} />
                  <AvatarFallback className="bg-zinc-800 text-zinc-300 text-xs">
                    {(req.user.name ?? "?").charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="text-sm font-medium text-zinc-100">{req.user.name ?? "Anonymous"}</p>
                  <p className="text-xs text-zinc-500">Lvl {req.user.level} · wants to be friends</p>
                </div>
                <button
                  onClick={() => respondFriend(req.friendshipId, "ACCEPTED")}
                  className="p-2 rounded-full bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition"
                >
                  <Check size={16} />
                </button>
                <button
                  onClick={() => respondFriend(req.friendshipId, "DECLINED")}
                  className="p-2 rounded-full bg-red-500/10 text-red-400 hover:bg-red-500/20 transition"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        )}

        {challengeRequests.length > 0 && (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 backdrop-blur-md p-4 space-y-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
              <Swords size={14} /> Challenge Invites
            </h2>
            {challengeRequests.map((c) => (
              <div key={c.challengeId} className="flex items-center gap-3 rounded-lg border border-zinc-800 p-3">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={c.challenger.imageUrl ?? undefined} />
                  <AvatarFallback className="bg-zinc-800 text-zinc-300 text-xs">
                    {(c.challenger.name ?? "?").charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="text-sm font-medium text-zinc-100">
                    {c.challenger.name ?? "Anonymous"} challenged you
                  </p>
                  <p className="text-xs text-zinc-500">
                    {c.category} · {c.duration === "ONE_DAY" ? "24 hours" : "7 days"} · {c.wagerXP} XP wager
                  </p>
                </div>
                <button
                  onClick={() => respondChallenge(c.challengeId, "ACCEPTED")}
                  className="p-2 rounded-full bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition"
                >
                  <Check size={16} />
                </button>
                <button
                  onClick={() => respondChallenge(c.challengeId, "DECLINED")}
                  className="p-2 rounded-full bg-red-500/10 text-red-400 hover:bg-red-500/20 transition"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}