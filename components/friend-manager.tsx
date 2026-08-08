"use client"

import { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { Search, UserPlus, Check, X, Users } from "lucide-react"
import { FriendProfileModal } from "@/components/friend-profile-modal"

interface SearchResult {
  id: string
  name: string | null
  imageUrl: string | null
  level: number
}

interface Friend {
  id: string
  name: string | null
  imageUrl: string | null
  level: number
  xp: number
  weeklyXp: number
}

interface IncomingRequest {
  friendshipId: string
  user: { id: string; name: string | null; imageUrl: string | null; level: number }
}

export function FriendManager() {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [friends, setFriends] = useState<Friend[]>([])
  const [incoming, setIncoming] = useState<IncomingRequest[]>([])
  const [sentIds, setSentIds] = useState<Set<string>>(new Set())
  const [selectedFriendId, setSelectedFriendId] = useState<string | null>(null)

  useEffect(() => {
    loadFriends()
  }, [])

  useEffect(() => {
    const handle = setTimeout(() => {
      if (query.trim().length >= 2) {
        fetch(`/api/users/search?q=${encodeURIComponent(query)}`)
          .then((r) => r.json())
          .then((data) => setResults(data.users ?? []))
      } else {
        setResults([])
      }
    }, 300)
    return () => clearTimeout(handle)
  }, [query])

  function loadFriends() {
    fetch("/api/friends")
      .then((r) => r.json())
      .then((data) => {
        setFriends(data.friends ?? [])
        setIncoming(data.incomingRequests ?? [])
      })
  }

  async function sendRequest(receiverId: string) {
    const res = await fetch("/api/friends/request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ receiverId }),
    })
    if (res.ok) {
      setSentIds((prev) => new Set(prev).add(receiverId))
      toast.success("Friend request sent")
    } else {
      toast.error("Couldn't send request")
    }
  }

  async function respond(friendshipId: string, status: "ACCEPTED" | "DECLINED") {
    const res = await fetch("/api/friends/respond", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ friendshipId, status }),
    })
    if (res.ok) {
      setIncoming((prev) => prev.filter((r) => r.friendshipId !== friendshipId))
      if (status === "ACCEPTED") {
        toast.success("Friend added")
        loadFriends()
      } else {
        toast("Request declined")
      }
    }
  }

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={15} />
          <Input
            placeholder="Search players by name..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9 bg-slate-950 border-slate-800 text-slate-100 placeholder:text-slate-600"
          />
        </div>

        {results.length > 0 && (
          <div className="space-y-2">
            {results.map((u) => (
              <div key={u.id} className="flex items-center gap-3 rounded-lg border border-slate-800 p-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={u.imageUrl ?? undefined} />
                  <AvatarFallback className="bg-slate-800 text-slate-300 text-xs">
                    {(u.name ?? "?").charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="flex-1 text-sm font-medium text-slate-100">{u.name ?? "Anonymous"}</span>
                <Badge className="bg-slate-800 text-slate-400 border-slate-700">Lvl {u.level}</Badge>
                <Button
                  size="sm"
                  disabled={sentIds.has(u.id)}
                  onClick={() => sendRequest(u.id)}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-50"
                >
                  {sentIds.has(u.id) ? "Sent" : <UserPlus size={14} />}
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {incoming.length > 0 && (
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-3">
          <h3 className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Pending Requests
          </h3>
          {incoming.map((req) => (
            <div key={req.friendshipId} className="flex items-center gap-3 rounded-lg border border-slate-800 p-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={req.user.imageUrl ?? undefined} />
                <AvatarFallback className="bg-slate-800 text-slate-300 text-xs">
                  {(req.user.name ?? "?").charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="flex-1 text-sm font-medium text-slate-100">
                {req.user.name ?? "Anonymous"}
              </span>
              <button
                onClick={() => respond(req.friendshipId, "ACCEPTED")}
                className="p-1.5 rounded-full bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors"
              >
                <Check size={15} />
              </button>
              <button
                onClick={() => respond(req.friendshipId, "DECLINED")}
                className="p-1.5 rounded-full bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
              >
                <X size={15} />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-3">
        <h3 className="text-xs font-medium uppercase tracking-wide text-slate-500 flex items-center gap-2">
          <Users size={13} /> Friends ({friends.length})
        </h3>
        {friends.length === 0 && (
          <p className="text-sm text-slate-500">No friends yet — search above to add some.</p>
        )}
        {friends.map((f) => (
          <button
            key={f.id}
            onClick={() => setSelectedFriendId(f.id)}
            className="flex items-center gap-3 rounded-lg border border-slate-800 p-2 w-full text-left hover:border-slate-700 hover:bg-slate-900/60 transition-colors"
          >
            <Avatar className="h-8 w-8">
              <AvatarImage src={f.imageUrl ?? undefined} />
              <AvatarFallback className="bg-slate-800 text-slate-300 text-xs">
                {(f.name ?? "?").charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="flex-1 text-sm font-medium text-slate-100">{f.name ?? "Anonymous"}</span>
            <Badge className="bg-slate-800 text-slate-400 border-slate-700">Lvl {f.level}</Badge>
            <span className="font-mono text-xs text-indigo-400 w-16 text-right">{f.xp} XP</span>
          </button>
        ))}
      </div>

      <FriendProfileModal
        friendId={selectedFriendId}
        onClose={() => setSelectedFriendId(null)}
        onRemoved={(removedId) => {
          setFriends((prev) => prev.filter((f) => f.id !== removedId))
        }}
      />
    </div>
  )
}