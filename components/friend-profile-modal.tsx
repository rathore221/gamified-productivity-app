"use client"

import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { toast } from "sonner"
import { Trophy, Calendar, Swords, UserMinus, Award, ChevronDown, CheckCircle2 } from "lucide-react"

interface FriendDetail {
  id: string
  name: string | null
  imageUrl: string | null
  level: number
  xp: number
  weeklyXp: number
  trophiesCount: number
}

interface Record {
  wins: number
  losses: number
  ties: number
  total: number
}

interface DuelTask {
  id: string
  title: string
  xpAwarded: number | null
  userId: string
  completedAt: string | null
}

interface Duel {
  id: string
  category: string
  wagerXP: number
  status: string
  winnerId: string | null
  challengerId: string
  opponentId: string
  tasks: DuelTask[]
}

interface FriendProfileModalProps {
  friendId: string | null
  onClose: () => void
  onRemoved: (friendId: string) => void
}

export function FriendProfileModal({ friendId, onClose, onRemoved }: FriendProfileModalProps) {
  const [friend, setFriend] = useState<FriendDetail | null>(null)
  const [allTimeRecord, setAllTimeRecord] = useState<Record | null>(null)
  const [h2hRecord, setH2hRecord] = useState<Record | null>(null)
  const [duels, setDuels] = useState<Duel[]>([])
  const [expandedDuelId, setExpandedDuelId] = useState<string | null>(null)
  const [myId, setMyId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [removing, setRemoving] = useState(false)

  useEffect(() => {
    if (!friendId) return
    setLoading(true)
    setExpandedDuelId(null)

    fetch("/api/user/sync", { method: "POST" })
      .then((r) => r.json())
      .then((data) => setMyId(data.user?.id ?? null))

    fetch(`/api/friends/${friendId}`)
      .then((r) => r.json())
      .then((data) => {
        setFriend(data.friend ?? null)
        setAllTimeRecord(data.allTimeRecord ?? null)
        setH2hRecord(data.headToHeadRecord ?? null)
        setDuels(data.headToHeadDuels ?? [])
        setLoading(false)
      })
  }, [friendId])

  async function handleRemove() {
    if (!friendId) return
    setRemoving(true)
    const res = await fetch(`/api/friends/${friendId}`, { method: "DELETE" })
    if (res.ok) {
      toast.success("Friend removed")
      onRemoved(friendId)
      onClose()
    } else {
      toast.error("Couldn't remove friend")
    }
    setRemoving(false)
  }

  function duelOutcomeLabel(duel: Duel) {
    if (duel.status === "DECLINED") return "Declined"
    if (!duel.winnerId) return "Tied"
    if (duel.winnerId === myId) return "You won"
    return "You lost"
  }

  function duelOutcomeColor(duel: Duel) {
    if (duel.status === "DECLINED") return "text-zinc-500"
    if (!duel.winnerId) return "text-zinc-400"
    return duel.winnerId === myId ? "text-emerald-400" : "text-red-400"
  }

  return (
    <Dialog open={!!friendId} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="bg-zinc-950 border-zinc-800 text-zinc-100 max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-zinc-100">Player Profile</DialogTitle>
        </DialogHeader>

        {loading && <p className="text-sm text-zinc-600 py-6 text-center">Loading...</p>}

        {!loading && friend && (
          <div className="space-y-5 pt-2">
            <div className="flex items-center gap-3">
              <Avatar className="h-14 w-14">
                <AvatarImage src={friend.imageUrl ?? undefined} />
                <AvatarFallback className="bg-zinc-800 text-zinc-300 text-lg">
                  {(friend.name ?? "?").charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-bold text-lg text-zinc-100">{friend.name ?? "Anonymous"}</p>
                <p className="text-sm text-zinc-500">Level {friend.level}</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="rounded-xl bg-zinc-900/60 border border-zinc-800 p-3 text-center">
                <Trophy size={14} className="text-yellow-400 mx-auto mb-1" />
                <p className="text-[10px] text-zinc-500 uppercase tracking-wide">Lifetime</p>
                <p className="text-sm font-bold text-white">{friend.xp} XP</p>
              </div>
              <div className="rounded-xl bg-zinc-900/60 border border-zinc-800 p-3 text-center">
                <Calendar size={14} className="text-emerald-400 mx-auto mb-1" />
                <p className="text-[10px] text-zinc-500 uppercase tracking-wide">This Week</p>
                <p className="text-sm font-bold text-white">{friend.weeklyXp} XP</p>
              </div>
              <div className="rounded-xl bg-zinc-900/60 border border-zinc-800 p-3 text-center">
                <Award size={14} className="text-purple-400 mx-auto mb-1" />
                <p className="text-[10px] text-zinc-500 uppercase tracking-wide">Trophies</p>
                <p className="text-sm font-bold text-white">{friend.trophiesCount}</p>
              </div>
            </div>

            {allTimeRecord && allTimeRecord.total > 0 && (
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-3 space-y-1.5">
                <p className="text-xs font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
                  <Swords size={12} /> All-time duel record
                </p>
                <div className="flex gap-4 text-sm">
                  <span className="text-emerald-400 font-bold">{allTimeRecord.wins}W</span>
                  <span className="text-red-400 font-bold">{allTimeRecord.losses}L</span>
                  {allTimeRecord.ties > 0 && <span className="text-zinc-500 font-bold">{allTimeRecord.ties}T</span>}
                  <span className="text-zinc-600">across {allTimeRecord.total} duels</span>
                </div>
              </div>
            )}

            {h2hRecord && h2hRecord.total > 0 && (
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-3 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
                    <Swords size={12} /> Duel history vs you
                  </p>
                  <div className="flex gap-3 text-sm">
                    <span className="text-emerald-400 font-bold">{h2hRecord.wins}W</span>
                    <span className="text-red-400 font-bold">{h2hRecord.losses}L</span>
                    {h2hRecord.ties > 0 && <span className="text-zinc-500 font-bold">{h2hRecord.ties}T</span>}
                  </div>
                </div>

                <div className="space-y-1.5">
                  {duels.map((duel) => {
                    const expanded = expandedDuelId === duel.id
                    return (
                      <div key={duel.id} className="rounded-lg border border-zinc-800 overflow-hidden">
                        <button
                          onClick={() => setExpandedDuelId(expanded ? null : duel.id)}
                          className="w-full flex items-center justify-between p-2.5 hover:bg-zinc-800/40 transition-colors"
                        >
                          <div className="text-left">
                            <p className="text-sm font-medium text-zinc-200">{duel.category}</p>
                            <p className={`text-xs font-semibold ${duelOutcomeColor(duel)}`}>
                              {duelOutcomeLabel(duel)}
                              {duel.status !== "DECLINED" && ` · ${duel.wagerXP} XP`}
                            </p>
                          </div>
                          <ChevronDown
                            size={16}
                            className={`text-zinc-500 transition-transform ${expanded ? "rotate-180" : ""}`}
                          />
                        </button>

                        {expanded && (
                          <div className="border-t border-zinc-800 bg-zinc-950/50 p-2.5 space-y-1.5">
                            {duel.tasks.length === 0 && (
                              <p className="text-xs text-zinc-600 py-1">No tasks were logged toward this duel.</p>
                            )}
                            {duel.tasks.map((task) => (
                              <div key={task.id} className="flex items-center gap-2 text-xs">
                                <CheckCircle2 size={12} className="text-emerald-400 shrink-0" />
                                <span className="flex-1 text-zinc-300 truncate">{task.title}</span>
                                <span className="text-zinc-600">
                                  {task.userId === myId ? "You" : friend.name ?? "Friend"}
                                </span>
                                <span className="font-mono text-purple-400 font-bold">
                                  +{task.xpAwarded ?? 0}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            <Button
              onClick={handleRemove}
              disabled={removing}
              variant="outline"
              className="w-full border-red-900/50 text-red-400 hover:bg-red-950/30 hover:text-red-300"
            >
              <UserMinus size={15} className="mr-1.5" />
              {removing ? "Removing..." : "Remove Friend"}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}