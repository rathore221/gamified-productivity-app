"use client"

import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { toast } from "sonner"
import { Swords, Clock, Tag, Coins, Check, Minus, Plus } from "lucide-react"


interface Friend {
  id: string
  name: string | null
  imageUrl?: string | null
}

const CATEGORY_SUGGESTIONS = ["Studying", "Coding", "Working Out", "Reading", "Deep Work"]

export function ChallengeModal() {
  const [open, setOpen] = useState(false)
  const [friends, setFriends] = useState<Friend[]>([])
  const [opponentId, setOpponentId] = useState("")
  const [category, setCategory] = useState("")
  const [duration, setDuration] = useState<"ONE_DAY" | "ONE_WEEK">("ONE_DAY")
  const [wagerXP, setWagerXP] = useState(100)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (open) {
      fetch("/api/friends")
        .then((r) => r.json())
        .then((data) => setFriends(data.friends ?? []))
    }
  }, [open])

  async function submit() {
    if (!opponentId || !category.trim()) {
      toast.error("Pick a friend and a category")
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch("/api/challenges/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ opponentId, category, duration, wagerXP }),
      })
      if (res.ok) {
        toast.success("Challenge sent!")
        setOpen(false)
        setCategory("")
        setOpponentId("")
      } else {
        const data = await res.json()
        toast.error(data.error ?? "Couldn't send challenge")
      }
    } finally {
      setSubmitting(false)
    }
  }

  const selectedFriend = friends.find((f) => f.id === opponentId)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button className="bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-500 hover:to-purple-500 text-white font-bold shadow-[0_0_20px_rgba(217,70,239,0.35)]">
            <Swords size={16} className="mr-1.5" />
            Challenge to a Duel
          </Button>
        }
      />
      <DialogContent className="bg-zinc-950 border-zinc-800 text-zinc-100 max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-zinc-100">
            <Swords size={18} className="text-fuchsia-400" />
            New Head-to-Head Challenge
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 pt-2">
          {/* Opponent picker */}
          <div className="space-y-2">
            <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-zinc-500">
              Opponent
            </label>
            {friends.length === 0 ? (
              <p className="text-sm text-zinc-600 py-2">
                Add some friends first to challenge them.
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-0.5">
                {friends.map((f) => {
                  const selected = opponentId === f.id
                  return (
                    <button
                      key={f.id}
                      onClick={() => setOpponentId(f.id)}
                      className={`flex items-center gap-2 rounded-xl border p-2 text-left transition-all ${
                        selected
                          ? "border-fuchsia-500 bg-fuchsia-500/10 shadow-[0_0_0_1px_rgba(217,70,239,0.4)]"
                          : "border-zinc-800 bg-zinc-900/60 hover:border-zinc-700"
                      }`}
                    >
                      <Avatar className="h-7 w-7 shrink-0">
                        <AvatarImage src={f.imageUrl ?? undefined} />
                        <AvatarFallback className="bg-zinc-800 text-zinc-300 text-xs">
                          {(f.name ?? "?").charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium text-zinc-200 truncate flex-1">
                        {f.name ?? "Anonymous"}
                      </span>
                      {selected && <Check size={14} className="text-fuchsia-400 shrink-0" />}
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {/* Category */}
          <div className="space-y-2">
            <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-zinc-500">
              <Tag size={12} /> Category
            </label>
            <Input
              placeholder="Studying, Coding, Working Out..."
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="bg-zinc-900 border-zinc-800 text-zinc-100 h-10"
            />
            <div className="flex gap-1.5 flex-wrap">
              {CATEGORY_SUGGESTIONS.map((c) => (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                    category === c
                      ? "bg-fuchsia-600 text-white"
                      : "bg-zinc-900 text-zinc-500 border border-zinc-800 hover:text-zinc-300"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Duration */}
          <div className="space-y-2">
            <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-zinc-500">
              <Clock size={12} /> Duration
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setDuration("ONE_DAY")}
                className={`py-2.5 rounded-xl text-sm font-bold transition-all ${
                  duration === "ONE_DAY"
                    ? "bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white shadow-[0_0_15px_rgba(217,70,239,0.3)]"
                    : "bg-zinc-900 text-zinc-400 border border-zinc-800 hover:border-zinc-700"
                }`}
              >
                24 Hours
              </button>
              <button
                onClick={() => setDuration("ONE_WEEK")}
                className={`py-2.5 rounded-xl text-sm font-bold transition-all ${
                  duration === "ONE_WEEK"
                    ? "bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white shadow-[0_0_15px_rgba(217,70,239,0.3)]"
                    : "bg-zinc-900 text-zinc-400 border border-zinc-800 hover:border-zinc-700"
                }`}
              >
                7 Days
              </button>
            </div>
          </div>

          {/* Wager */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-zinc-500">
                <Coins size={12} /> Wager
              </label>
              <span className="text-xs text-zinc-600">max 1000 XP</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setWagerXP((w) => Math.max(1, w - 10))}
                className="flex items-center justify-center h-11 w-11 shrink-0 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:bg-zinc-800 hover:text-white active:scale-95 transition-all"
                aria-label="Decrease wager"
              >
                <Minus size={18} />
              </button>

              <div className="relative flex-1">
                <input
                  type="number"
                  min={1}
                  max={1000}
                  value={wagerXP}
                  onChange={(e) => setWagerXP(Math.min(1000, Math.max(1, Number(e.target.value))))}
                  className="w-full h-11 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100 text-lg font-bold text-center pr-10 focus:outline-none focus:ring-2 focus:ring-fuchsia-500/50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-500 pointer-events-none">
                  XP
                </span>
              </div>

              <button
                onClick={() => setWagerXP((w) => Math.min(1000, w + 10))}
                className="flex items-center justify-center h-11 w-11 shrink-0 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:bg-zinc-800 hover:text-white active:scale-95 transition-all"
                aria-label="Increase wager"
              >
                <Plus size={18} />
              </button>
            </div>

            <input
              type="range"
              min={10}
              max={1000}
              step={10}
              value={wagerXP}
              onChange={(e) => setWagerXP(Number(e.target.value))}
              className="w-full accent-fuchsia-500"
            />
          </div>
          <Button
            onClick={submit}
            disabled={submitting || !opponentId || !category.trim()}
            className="w-full h-11 bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-500 hover:to-purple-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold shadow-[0_0_20px_rgba(217,70,239,0.3)]"
          >
            {submitting ? "Sending..." : "Send Challenge"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}