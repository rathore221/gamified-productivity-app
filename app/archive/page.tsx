"use client"

import { useEffect, useMemo, useState } from "react"
import { Input } from "@/components/ui/input"
import { getWeekStartFor, formatWeekLabel } from "@/lib/week"
import { Search, Archive, ArrowUpDown, CheckCircle2 } from "lucide-react"

interface TaskRecord {
  id: string
  title: string
  durationSec: number
  xpAwarded: number | null
  completedAt: string
}

type SortMode = "newest" | "oldest" | "xpHigh" | "xpLow"

export default function ArchivePage() {
  const [tasks, setTasks] = useState<TaskRecord[]>([])
  const [query, setQuery] = useState("")
  const [sortMode, setSortMode] = useState<SortMode>("newest")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/tasks/archive")
      .then((r) => r.json())
      .then((data) => {
        setTasks(data.tasks ?? [])
        setLoading(false)
      })
  }, [])

  const filteredAndSorted = useMemo(() => {
    let result = tasks.filter((t) =>
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
  }, [tasks, query, sortMode])

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
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="max-w-2xl mx-auto p-6 space-y-6">
        <h1 className="text-2xl font-black tracking-wide flex items-center gap-2">
          <Archive className="text-purple-400" size={24} />
          Archive
        </h1>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 backdrop-blur-md p-4 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
            <Input
              placeholder="Search tasks by name..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9 bg-zinc-950 border-zinc-800 text-zinc-100 placeholder:text-zinc-600"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span className="flex items-center gap-1.5 text-xs text-zinc-500 uppercase tracking-wider font-semibold">
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
                    ? "px-3 py-1 rounded-full text-xs font-bold bg-purple-600 text-white transition-colors"
                    : "px-3 py-1 rounded-full text-xs font-bold bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200 transition-colors"
                }
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {loading && <p className="text-zinc-600 text-sm">Loading...</p>}

        {!loading && groupedByWeek.length === 0 && (
          <div className="rounded-2xl border border-dashed border-zinc-800 py-16 text-center">
            <Archive className="mx-auto mb-3 text-zinc-700" size={32} />
            <p className="text-sm text-zinc-500 font-medium">
              {query ? "No tasks match your search" : "No completed tasks yet"}
            </p>
          </div>
        )}

        <div className="space-y-6">
          {groupedByWeek.map(([weekKey, weekTasks]) => (
            <div key={weekKey} className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                  {formatWeekLabel(new Date(weekKey))}
                </h2>
                <span className="text-xs text-zinc-600">
                  {weekTasks.length} task{weekTasks.length !== 1 ? "s" : ""}
                </span>
              </div>

              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 backdrop-blur-md divide-y divide-zinc-800/60 overflow-hidden">
                {weekTasks.map((task) => (
                  <div key={task.id} className="flex items-center gap-3 p-3">
                    <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-zinc-100 truncate">{task.title}</p>
                      <p className="text-xs text-zinc-500">
                        {Math.round(task.durationSec / 60)} min ·{" "}
                        {new Date(task.completedAt).toLocaleDateString(undefined, {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                    <span className="font-mono text-sm font-bold text-purple-400 shrink-0">
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