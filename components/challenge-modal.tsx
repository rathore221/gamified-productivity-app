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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium">
            <Swords size={15} className="mr-1.5" />
            Challenge to a Duel
          </Button>
        }
      />
      <DialogContent className="bg-slate-950 border-slate-800 text-slate-100 max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-slate-100 font-medium">
            <Swords size={17} className="text-indigo-400" />
            New Head-to-Head Challenge
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 pt-2">
          <div className="space-y-2">
            <label className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Opponent
            </label>
            {friends.length === 0 ? (
              <p className="text-sm text-slate-600 py-2">
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
                      className={
                        selected
                          ? "flex items-center gap-2 rounded-lg border p-2 text-left transition-colors border-indigo-500 bg-indigo-500/10"
                          : "flex items-center gap-2 rounded-lg border p-2 text-left transition-colors border-slate-800 bg-slate-900/60 hover:border-slate-700"
                      }
                    >
                      <Avatar className="h-7 w-7 shrink-0">
                        <AvatarImage src={f.imageUrl ?? undefined} />
                        <AvatarFallback className="bg-slate-800 text-slate-300 text-xs">
                          {(f.name ?? "?").charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium text-slate-200 truncate flex-1">
                        {f.name ?? "Anonymous"}
                      </span>
                      {selected && <Check size={14} className="text-indigo-400 shrink-0" />}
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-slate-500">
              <Tag size={12} /> Category
            </label>
            <Input
              placeholder="Studying, Coding, Working Out..."
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="bg-slate-900 border-slate-800 text-slate-100 h-10"
            />
            <div className="flex gap-1.5 flex-wrap">
              {CATEGORY_SUGGESTIONS.map((c) => (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  className={
                    category === c
                      ? "px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-600 text-white transition-colors"
                      : "px-2.5 py-1 rounded-full text-xs font-medium bg-slate-900 text-slate-500 border border-slate-800 hover:text-slate-300 transition-colors"
                  }
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-slate-500">
              <Clock size={12} /> Duration
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setDuration("ONE_DAY")}
                className={
                  duration === "ONE_DAY"
                    ? "py-2.5 rounded-lg text-sm font-medium bg-indigo-600 text-white transition-colors"
                    : "py-2.5 rounded-lg text-sm font-medium bg-slate-900 text-slate-400 border border-slate-800 hover:border-slate-700 transition-colors"
                }
              >
                24 Hours
              </button>
              <button
                onClick={() => setDuration("ONE_WEEK")}
                className={
                  duration === "ONE_WEEK"
                    ? "py-2.5 rounded-lg text-sm font-medium bg-indigo-600 text-white transition-colors"
                    : "py-2.5 rounded-lg text-sm font-medium bg-slate-900 text-slate-400 border border-slate-800 hover:border-slate-700 transition-colors"
                }
              >
                7 Days
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-slate-500">
                <Coins size={12} /> Wager
              </label>
              <span className="text-xs text-slate-600">max 1000 XP</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setWagerXP((w) => Math.max(1, w - 10))}
                className="flex items-center justify-center h-11 w-11 shrink-0 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
                aria-label="Decrease wager"
              >
                <Minus size={17} />
              </button>

              <div className="relative flex-1">
                <input
                  type="number"
                  min={1}
                  max={1000}
                  value={wagerXP}
                  onChange={(e) => setWagerXP(Math.min(1000, Math.max(1, Number(e.target.value))))}
                  className="w-full h-11 rounded-lg bg-slate-900 border border-slate-800 text-slate-100 text-lg font-semibold text-center pr-10 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-500 pointer-events-none">
                  XP
                </span>
              </div>

              <button
                onClick={() => setWagerXP((w) => Math.min(1000, w + 10))}
                className="flex items-center justify-center h-11 w-11 shrink-0 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
                aria-label="Increase wager"
              >
                <Plus size={17} />
              </button>
            </div>

            <input
              type="range"
              min={10}
              max={1000}
              step={10}
              value={wagerXP}
              onChange={(e) => setWagerXP(Number(e.target.value))}
              className="w-full accent-indigo-500"
            />
          </div>

          <Button
            onClick={submit}
            disabled={submitting || !opponentId || !category.trim()}
            className="w-full h-11 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium transition-colors"
          >
            {submitting ? "Sending..." : "Send Challenge"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}