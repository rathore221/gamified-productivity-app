"use client"

import { useEffect, useState } from "react"
import { TaskTimer } from "@/components/task-timer"
import { ActiveChallenges } from "@/components/active-challenges"
import { DurationSlider } from "@/components/duration-slider"
import { ChallengeSelect } from "@/components/challenge-select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { xpProgress } from "@/lib/xp"
import { Zap, Plus, Flame, Calendar, Trophy } from "lucide-react"

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
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="max-w-2xl mx-auto p-6 space-y-6">

        {/* Level / XP card */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="flex items-center justify-center h-9 w-9 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
                <Zap className="text-indigo-400" size={17} />
              </div>
              <div>
                <p className="text-[11px] font-medium tracking-wide uppercase text-slate-500 leading-none">Level</p>
                <p className="text-xl font-semibold text-white leading-tight">{progress.level}</p>
              </div>
            </div>
            <span className="text-xs font-medium text-slate-500">
              {progress.xpIntoLevel} / {progress.xpNeededForNext} XP
            </span>
          </div>

          <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden mb-5">
            <div
              className="h-full rounded-full bg-indigo-500 transition-all duration-700 ease-out"
              style={{ width: `${progress.progressPercent}%` }}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-slate-950/60 border border-slate-800 p-3 flex items-center gap-3">
              <div className="flex items-center justify-center h-8 w-8 rounded-md bg-amber-500/10">
                <Trophy size={14} className="text-amber-400" />
              </div>
              <div>
                <p className="text-[10px] text-slate-500 uppercase tracking-wide font-medium">Lifetime</p>
                <p className="text-base font-semibold text-white leading-tight">{xp} XP</p>
              </div>
            </div>
            <div className="rounded-lg bg-slate-950/60 border border-slate-800 p-3 flex items-center gap-3">
              <div className="flex items-center justify-center h-8 w-8 rounded-md bg-emerald-500/10">
                <Calendar size={14} className="text-emerald-400" />
              </div>
              <div>
                <p className="text-[10px] text-slate-500 uppercase tracking-wide font-medium">This Week</p>
                <p className="text-base font-semibold text-white leading-tight">{weeklyXp} XP</p>
              </div>
            </div>
          </div>
        </div>

        {myId && <ActiveChallenges myId={myId} refreshSignal={challengeRefreshSignal} />}

        {/* Task creation card */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 space-y-5">
          <div className="flex items-center gap-2">
            <Flame size={15} className="text-indigo-400" />
            <h2 className="text-sm font-medium text-slate-300">New Task</h2>
          </div>

          <Input
            placeholder="What are you racing the clock on?"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="bg-slate-950 border-slate-800 text-slate-100 placeholder:text-slate-600 h-11"
          />

          <DurationSlider minutes={minutes} onChange={setMinutes} />

          {challengeOptions.length > 0 && (
            <ChallengeSelect
              options={challengeOptions}
              value={selectedChallengeId}
              onChange={setSelectedChallengeId}
            />
          )}

          <Button
            onClick={createTask}
            disabled={!title.trim()}
            className="w-full h-11 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium transition-colors"
          >
            <Plus size={17} className="mr-1.5" />
            Start the Clock
          </Button>
        </div>

        {/* Active tasks */}
        <div className="space-y-3">
          {loading && (
            <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-8 text-center">
              <p className="text-sm text-slate-500">Loading your tasks...</p>
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
            <div className="rounded-xl border border-dashed border-slate-800 py-16 text-center">
              <Flame className="mx-auto mb-3 text-slate-700" size={28} />
              <p className="text-sm text-slate-500 font-medium">No active tasks</p>
              <p className="text-xs text-slate-600 mt-1">Set a duration above and hit start</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}