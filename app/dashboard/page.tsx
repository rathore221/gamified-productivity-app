"use client"

import { useEffect, useState } from "react"
import { TaskTimer } from "@/components/task-timer"
import { ActiveChallenges } from "@/components/active-challenges"
import { DurationSlider } from "@/components/duration-slider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { xpProgress } from "@/lib/xp"
import { Zap, Plus, Flame, Calendar, Trophy, Swords } from "lucide-react"

interface Task {
  id: string
  title: string
  durationSec: number
  createdAt: string
}

interface ActiveChallengeOption {
  id: string
  category: string
  opponent: { name: string | null }
}

export default function DashboardPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [xp, setXp] = useState(0)
  const [weeklyXp, setWeeklyXp] = useState(0)
  const [title, setTitle] = useState("")
  const [minutes, setMinutes] = useState(25)
  const [myId, setMyId] = useState<string | null>(null)
  const [challengeOptions, setChallengeOptions] = useState<ActiveChallengeOption[]>([])
  const [selectedChallengeId, setSelectedChallengeId] = useState("")
  const [challengeRefreshSignal, setChallengeRefreshSignal] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/user/sync", { method: "POST" })
      .then((r) => r.json())
      .then((data) => {
        setXp(data.user?.xp ?? 0)
        setWeeklyXp(data.user?.weeklyXp ?? 0)
        setMyId(data.user?.id ?? null)
      })

    fetch("/api/tasks")
      .then((r) => r.json())
      .then((data) => {
        setTasks(data.tasks ?? [])
        setLoading(false)
      })

    fetch("/api/challenges/active")
      .then((r) => r.json())
      .then((data) => {
        const active = (data.active ?? []).map((c: any) => ({
          id: c.id,
          category: c.category,
          opponent: c.challenger.id === data.myId ? c.opponent : c.challenger,
        }))
        setChallengeOptions(active)
      })
  }, [])

  async function createTask() {
    if (!title.trim()) return
    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        durationSec: minutes * 60,
        challengeId: selectedChallengeId || undefined,
      }),
    })
    const data = await res.json()
    setTasks((prev) => [data.task, ...prev])
    setTitle("")
  }

  function handleResolved(taskId: string, xpGained: number) {
    setTasks((prev) => prev.filter((t) => t.id !== taskId))
    setXp((prev) => prev + xpGained)
    setWeeklyXp((prev) => prev + xpGained)
    setChallengeRefreshSignal((s) => s + 1)
  }

  function getInitialTimeLeft(task: Task): number {
    const elapsedSec = Math.floor((Date.now() - new Date(task.createdAt).getTime()) / 1000)
    return Math.max(0, task.durationSec - elapsedSec)
  }

  const progress = xpProgress(xp)

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(168,85,247,0.15),transparent)]">
      <div className="max-w-2xl mx-auto p-6 space-y-6">

        {/* Level / XP card */}
        <div className="relative rounded-2xl border border-zinc-800 bg-zinc-900/50 backdrop-blur-md p-6 overflow-hidden">
          <div className="absolute -top-16 -right-16 h-40 w-40 rounded-full bg-purple-600/20 blur-3xl pointer-events-none" />

          <div className="relative flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="flex items-center justify-center h-9 w-9 rounded-xl bg-purple-500/15 border border-purple-500/30">
                <Zap className="text-purple-400" size={18} />
              </div>
              <div>
                <p className="text-[11px] font-bold tracking-widest uppercase text-zinc-500 leading-none">Level</p>
                <p className="text-2xl font-black text-white leading-tight">{progress.level}</p>
              </div>
            </div>
            <span className="text-xs font-mono text-zinc-500">
              {progress.xpIntoLevel} / {progress.xpNeededForNext} XP
            </span>
          </div>

          <div className="h-2.5 w-full rounded-full bg-zinc-800 overflow-hidden mb-5">
            <div
              className="h-full rounded-full bg-gradient-to-r from-purple-500 to-fuchsia-400 shadow-[0_0_12px_2px_rgba(168,85,247,0.6)] transition-all duration-700 ease-out"
              style={{ width: `${progress.progressPercent}%` }}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-zinc-950/60 border border-zinc-800/80 p-3 flex items-center gap-3">
              <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-yellow-500/10">
                <Trophy size={15} className="text-yellow-400" />
              </div>
              <div>
                <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">Lifetime</p>
                <p className="text-lg font-bold text-white leading-tight">{xp} XP</p>
              </div>
            </div>
            <div className="rounded-xl bg-zinc-950/60 border border-zinc-800/80 p-3 flex items-center gap-3">
              <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-emerald-500/10">
                <Calendar size={15} className="text-emerald-400" />
              </div>
              <div>
                <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">This Week</p>
                <p className="text-lg font-bold text-white leading-tight">{weeklyXp} XP</p>
              </div>
            </div>
          </div>
        </div>

        {myId && <ActiveChallenges myId={myId} refreshSignal={challengeRefreshSignal} />}

        {/* Task creation card */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 backdrop-blur-md p-5 space-y-5">
          <div className="flex items-center gap-2">
            <Flame size={16} className="text-purple-400" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-300">New Task</h2>
          </div>

          <Input
            placeholder="What are you racing the clock on?"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="bg-zinc-950 border-zinc-800 text-zinc-100 placeholder:text-zinc-600 h-11"
          />

          <DurationSlider minutes={minutes} onChange={setMinutes} />

          {challengeOptions.length > 0 && (
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-zinc-400">
                <Swords size={14} />
                <span className="text-xs uppercase tracking-wider font-semibold">Challenge</span>
              </div>
              <select
                value={selectedChallengeId}
                onChange={(e) => setSelectedChallengeId(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-sm text-zinc-300"
              >
                <option value="">Don't count toward a challenge</option>
                {challengeOptions.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.category} vs {c.opponent.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <Button
            onClick={createTask}
            disabled={!title.trim()}
            className="w-full h-11 bg-purple-600 hover:bg-purple-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold transition-all shadow-[0_0_20px_rgba(168,85,247,0.3)]"
          >
            <Plus size={18} className="mr-1.5" />
            Start the Clock
          </Button>
        </div>

        {/* Active tasks */}
        <div className="space-y-4">
          {loading && (
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-8 text-center animate-pulse">
              <p className="text-sm text-zinc-600">Loading your tasks...</p>
            </div>
          )}

          {!loading && tasks.map((task) => (
            <TaskTimer
              key={task.id}
              taskId={task.id}
              title={task.title}
              durationSec={task.durationSec}
              initialTimeLeft={getInitialTimeLeft(task)}
              onResolved={handleResolved}
            />
          ))}

          {!loading && tasks.length === 0 && (
            <div className="rounded-2xl border border-dashed border-zinc-800 py-16 text-center">
              <Flame className="mx-auto mb-3 text-zinc-700" size={32} />
              <p className="text-sm text-zinc-500 font-medium">No active tasks</p>
              <p className="text-xs text-zinc-700 mt-1">Set a duration above and hit start</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}