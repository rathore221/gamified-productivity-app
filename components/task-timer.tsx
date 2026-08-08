"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { X, CheckCircle2, Timer as TimerIcon } from "lucide-react"

interface TaskTimerProps {
  taskId: string
  title: string
  durationSec: number
  initialTimeLeft: number
  onResolved: (taskId: string, xpGained: number) => void
}

type Phase = "running" | "success" | "cancelled"

export function TaskTimer({ taskId, title, durationSec, initialTimeLeft, onResolved }: TaskTimerProps) {
  const [timeLeft, setTimeLeft] = useState(initialTimeLeft)
  const [phase, setPhase] = useState<Phase>("running")
  const [xpAwarded, setXpAwarded] = useState(0)
  const resolvedRef = useRef(false)

  useEffect(() => {
    if (phase !== "running") return
    if (timeLeft <= 0) {
      if (!resolvedRef.current) {
        resolvedRef.current = true
        handleAutoComplete()
      }
      return
    }
    const interval = setInterval(() => setTimeLeft((t) => t - 1), 1000)
    return () => clearInterval(interval)
  }, [timeLeft, phase])

  async function handleAutoComplete() {
    try {
      const res = await fetch(`/api/tasks/${taskId}/complete`, { method: "POST" })
      const data = await res.json()
      setXpAwarded(data.xpAwarded ?? 0)
      setPhase("success")
      toast.success(`+${data.xpAwarded} XP — "${title}" complete`)
      setTimeout(() => onResolved(taskId, data.xpAwarded ?? 0), 1400)
    } catch {
      toast.error("Something went wrong syncing your task.")
      onResolved(taskId, 0)
    }
  }

  async function handleCancel() {
    if (resolvedRef.current) return
    resolvedRef.current = true
    setPhase("cancelled")
    try {
      await fetch(`/api/tasks/${taskId}/cancel`, { method: "POST" })
      toast.error(`"${title}" cancelled — no XP earned`)
    } catch {}
    setTimeout(() => onResolved(taskId, 0), 600)
  }

  const percentLeft = (timeLeft / durationSec) * 100
  const isUrgent = percentLeft < 25
  const minutes = Math.floor(Math.max(0, timeLeft) / 60)
  const seconds = Math.max(0, timeLeft) % 60

  if (phase === "success") {
    return (
      <div className="rounded-xl border border-emerald-800/50 bg-emerald-950/30 p-5 flex items-center gap-3">
        <CheckCircle2 className="text-emerald-400" size={22} />
        <div>
          <p className="font-medium text-emerald-300">{title} complete</p>
          <p className="text-sm text-emerald-400/70">+{xpAwarded} XP earned</p>
        </div>
      </div>
    )
  }

  if (phase === "cancelled") {
    return (
      <div className="rounded-xl border border-slate-800 bg-slate-900/30 p-5 text-slate-600">
        Task cancelled.
      </div>
    )
  }

  return (
    <div
      className={
        isUrgent
          ? "rounded-xl border p-5 space-y-4 transition-colors border-red-900/50 bg-red-950/20"
          : "rounded-xl border p-5 space-y-4 transition-colors border-slate-800 bg-slate-900/60"
      }
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TimerIcon size={15} className="text-slate-500" />
          <h3 className="font-medium text-slate-100">{title}</h3>
        </div>
        <span
          className={
            isUrgent
              ? "text-2xl font-semibold font-mono tabular-nums text-red-400"
              : "text-2xl font-semibold font-mono tabular-nums text-slate-100"
          }
        >
          {minutes}:{String(seconds).padStart(2, "0")}
        </span>
      </div>

      <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
        <div
          className={
            isUrgent
              ? "h-full rounded-full transition-all duration-1000 bg-red-500"
              : "h-full rounded-full transition-all duration-1000 bg-indigo-500"
          }
          style={{ width: `${percentLeft}%` }}
        />
      </div>

      <Button
        onClick={handleCancel}
        variant="outline"
        className="w-full border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-red-400"
      >
        <X size={15} className="mr-1" />
        Cancel Task
      </Button>
    </div>
  )
}