"use client"

import { useEffect, useMemo, useState } from "react"
import { Input } from "@/components/ui/input"
import { getWeekStartFor, formatWeekLabel } from "@/lib/week"
import { Search, Archive, ArrowUpDown, CheckCircle2, TrendingUp, ListChecks, Clock } from "lucide-react"

interface TaskRecord {
  id: string
  title: string
  durationSec: number
  xpAwarded: number | null
  completedAt: string
}

type SortMode = "newest" | "oldest" | "xpHigh" | "xpLow"
type RangeKey = "week" | "2weeks" | "month" | "6months" | "year" | "all"

const RANGE_OPTIONS: { key: RangeKey; label: string; days: number | null }[] = [
  { key: "week", label: "Past Week", days: 7 },
  { key: "2weeks", label: "Past 2 Weeks", days: 14 },
  { key: "month", label: "Past Month", days: 30 },
  { key: "6months", label: "Past 6 Months", days: 182 },
  { key: "year", label: "Past Year", days: 365 },
  { key: "all", label: "All Time", days: null },
]

export default function ArchivePage() {
  const [tasks, setTasks] = useState<TaskRecord[]>([])
  const [query, setQuery] = useState("")
  const [sortMode, setSortMode] = useState<SortMode>("newest")
  const [range, setRange] = useState<RangeKey>("month")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/tasks/archive")
      .then((r) => r.json())
      .then((data) => {
        setTasks(data.tasks ?? [])
        setLoading(false)
      })
  }, [])

  const rangeCutoff = useMemo(() => {
    const opt = RANGE_OPTIONS.find((r) => r.key === range)
    if (!opt || opt.days === null) return null
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - opt.days)
    return cutoff
  }, [range])

  const tasksInRange = useMemo(() => {
    if (!rangeCutoff) return tasks
    return tasks.filter((t) => new Date(t.completedAt) >= rangeCutoff)
  }, [tasks, rangeCutoff])

  const stats = useMemo(() => {
    const totalTasks = tasksInRange.length
    const totalXp = tasksInRange.reduce((sum, t) => sum + (t.xpAwarded ?? 0), 0)
    const totalMinutes = tasksInRange.reduce((sum, t) => sum + Math.round(t.durationSec / 60), 0)
    return { totalTasks, totalXp, totalMinutes }
  }, [tasksInRange])

  const filteredAndSorted = useMemo(() => {
    let result = tasksInRange.filter((t) =>
      t.title.toLowerCase().includes(query.toLowerCase())
    )

    result = [...result].sort((a, b) => {
      if (sortMode === "newest") {
        return new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
      }
      if (sortMode === "oldest") {
        return new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime()
      }
      if (sortMode === "xpHigh") {
        return (b.xpAwarded ?? 0) - (a.xpAwarded ?? 0)
      }
      return (a.xpAwarded ?? 0) - (b.xpAwarded ?? 0)
    })

    return result
  }, [tasksInRange, query, sortMode])

  const groupedByWeek = useMemo(() => {
    const groups = new Map<string, TaskRecord[]>()
    for (const task of filteredAndSorted) {
      const weekStart = getWeekStartFor(new Date(task.completedAt))
      const key = weekStart.toISOString()
      if (!groups.has(key)) groups.set(key, [])
      groups.get(key)!.push(task)
    }
    return Array.from(groups.entries()).sort((a, b) => {
      if (sortMode === "oldest") return a[0].localeCompare(b[0])
      return b[0].localeCompare(a[0])
    })
  }, [filteredAndSorted, sortMode])

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="max-w-2xl mx-auto p-6 space-y-6">
        <h1 className="text-xl font-semibold tracking-tight flex items-center gap-2">
          <Archive className="text-indigo-400" size={22} />
          Archive
        </h1>

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-4">
          <div className="flex items-center gap-2 flex-wrap">
            {RANGE_OPTIONS.map((opt) => (
              <button
                key={opt.key}
                onClick={() => setRange(opt.key)}
                className={
                  range === opt.key
                    ? "px-3 py-1.5 rounded-full text-xs font-medium bg-indigo-600 text-white transition-colors"
                    : "px-3 py-1.5 rounded-full text-xs font-medium bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200 transition-colors"
                }
              >
                {opt.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-lg bg-slate-950/60 border border-slate-800 p-3 text-center">
              <ListChecks size={15} className="text-emerald-400 mx-auto mb-1.5" />
              <p className="text-[10px] text-slate-500 uppercase tracking-wide">Tasks</p>
              <p className="text-base font-semibold text-white">{stats.totalTasks}</p>
            </div>
            <div className="rounded-lg bg-slate-950/60 border border-slate-800 p-3 text-center">
              <TrendingUp size={15} className="text-indigo-400 mx-auto mb-1.5" />
              <p className="text-[10px] text-slate-500 uppercase tracking-wide">XP Earned</p>
              <p className="text-base font-semibold text-white">{stats.totalXp}</p>
            </div>
            <div className="rounded-lg bg-slate-950/60 border border-slate-800 p-3 text-center">
              <Clock size={15} className="text-violet-400 mx-auto mb-1.5" />
              <p className="text-[10px] text-slate-500 uppercase tracking-wide">Time Focused</p>
              <p className="text-base font-semibold text-white">
                {stats.totalMinutes >= 60
                  ? `${Math.floor(stats.totalMinutes / 60)}h ${stats.totalMinutes % 60}m`
                  : `${stats.totalMinutes}m`}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={15} />
            <Input
              placeholder="Search tasks by name..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9 bg-slate-950 border-slate-800 text-slate-100 placeholder:text-slate-600"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span className="flex items-center gap-1.5 text-xs text-slate-500 uppercase tracking-wide font-medium">
              <ArrowUpDown size={12} /> Sort
            </span>
            {[
              { key: "newest", label: "Newest" },
              { key: "oldest", label: "Oldest" },
              { key: "xpHigh", label: "Most XP" },
              { key: "xpLow", label: "Least XP" },
            ].map((opt) => (
              <button
                key={opt.key}
                onClick={() => setSortMode(opt.key as SortMode)}
                className={
                  sortMode === opt.key
                    ? "px-3 py-1 rounded-full text-xs font-medium bg-indigo-600 text-white transition-colors"
                    : "px-3 py-1 rounded-full text-xs font-medium bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200 transition-colors"
                }
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {loading && <p className="text-slate-500 text-sm">Loading...</p>}

        {!loading && groupedByWeek.length === 0 && (
          <div className="rounded-xl border border-dashed border-slate-800 py-16 text-center">
            <Archive className="mx-auto mb-3 text-slate-700" size={28} />
            <p className="text-sm text-slate-500 font-medium">
              {query ? "No tasks match your search" : "No completed tasks in this range"}
            </p>
          </div>
        )}

        <div className="space-y-6">
          {groupedByWeek.map(([weekKey, weekTasks]) => (
            <div key={weekKey} className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <h2 className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  {formatWeekLabel(new Date(weekKey))}
                </h2>
                <span className="text-xs text-slate-600">
                  {weekTasks.length} task{weekTasks.length !== 1 ? "s" : ""}
                </span>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-900/60 divide-y divide-slate-800/60 overflow-hidden">
                {weekTasks.map((task) => (
                  <div key={task.id} className="flex items-center gap-3 p-3">
                    <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-100 truncate">{task.title}</p>
                      <p className="text-xs text-slate-500">
                        {Math.round(task.durationSec / 60)} min ·{" "}
                        {new Date(task.completedAt).toLocaleDateString(undefined, {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                    <span className="font-mono text-sm font-medium text-indigo-400 shrink-0">
                      +{task.xpAwarded ?? 0} XP
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}