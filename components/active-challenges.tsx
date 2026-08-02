"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { Swords, Flag } from "lucide-react"

interface ChallengeUser {
  id: string
  name: string | null
}

interface Challenge {
  id: string
  category: string
  wagerXP: number
  endDate: string | null
  challengerXP: number
  opponentXP: number
  challenger: ChallengeUser
  opponent: ChallengeUser
  status: string
  winner?: ChallengeUser | null
}

interface ActiveChallengesProps {
  myId: string
  refreshSignal?: number
}

export function ActiveChallenges({ myId, refreshSignal }: ActiveChallengesProps) {
  const [pending, setPending] = useState<Challenge[]>([])
  const [active, setActive] = useState<Challenge[]>([])

  useEffect(() => {
    load()
  }, [refreshSignal])

  function load() {
    fetch("/api/challenges/active")
      .then((r) => r.json())
      .then((data) => {
        setPending(data.pending ?? [])
        setActive(data.active ?? [])
      })
  }

  async function respond(challengeId: string, status: "ACCEPTED" | "DECLINED") {
    const res = await fetch("/api/challenges/respond", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ challengeId, status }),
    })
    if (res.ok) {
      toast.success(status === "ACCEPTED" ? "Challenge accepted!" : "Challenge declined")
      load()
    }
  }

  async function surrender(challengeId: string) {
    const res = await fetch("/api/challenges/surrender", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ challengeId }),
    })
    if (res.ok) {
      toast.error("You surrendered the duel")
      load()
    }
  }

  if (pending.length === 0 && active.length === 0) return null

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 backdrop-blur-md p-4 space-y-3">
      <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
        <Swords size={14} /> Duels
      </h3>

      {pending.map((c) => {
        const opponent = c.challenger.id === myId ? c.opponent : c.challenger
        const incoming = c.opponent.id === myId
        return (
          <div key={c.id} className="rounded-lg border border-zinc-800 p-3 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-zinc-100">
                {incoming ? `${c.challenger.name} challenged you` : `Waiting on ${opponent.name}`}
              </p>
              <p className="text-xs text-zinc-500">{c.category} · {c.wagerXP} XP wager</p>
            </div>
            {incoming && (
              <div className="flex gap-2">
                <Button size="sm" onClick={() => respond(c.id, "ACCEPTED")} className="bg-emerald-600 hover:bg-emerald-500">
                  Accept
                </Button>
                <Button size="sm" variant="outline" onClick={() => respond(c.id, "DECLINED")} className="border-zinc-700 text-zinc-400">
                  Decline
                </Button>
              </div>
            )}
          </div>
        )
      })}

      {active.map((c) => {
        const opponent = c.challenger.id === myId ? c.opponent : c.challenger
        const myXP = c.challenger.id === myId ? c.challengerXP : c.opponentXP
        const theirXP = c.challenger.id === myId ? c.opponentXP : c.challengerXP
        const total = myXP + theirXP || 1
        const myPercent = (myXP / total) * 100

        return (
          <div key={c.id} className="rounded-lg border border-zinc-800 p-3 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-zinc-100">vs {opponent.name}</span>
              <span className="text-xs text-purple-400 font-mono">{c.wagerXP} XP at stake</span>
            </div>
            <p className="text-xs text-zinc-500">{c.category}</p>
            <div className="h-2 w-full rounded-full bg-zinc-800 overflow-hidden flex">
              <div className="h-full bg-purple-500" style={{ width: `${myPercent}%` }} />
              <div className="h-full bg-zinc-600 flex-1" />
            </div>
            <div className="flex justify-between text-xs font-mono text-zinc-400">
              <span>You: {myXP}</span>
              <span>{opponent.name}: {theirXP}</span>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => surrender(c.id)}
              className="w-full border-zinc-700 text-zinc-500 hover:text-red-400 hover:border-red-500/40"
            >
              <Flag size={14} className="mr-1" /> Surrender
            </Button>
          </div>
        )
      })}
    </div>
  )
}