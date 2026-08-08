"use client"

import { useEffect, useState } from "react"
import { History, CheckCircle2, XCircle, Ban, Swords, Trophy, ChevronDown } from "lucide-react"

interface TaskHistoryItem {
  id: string
  title: string
  durationSec: number
  status: "COMPLETED" | "FAILED" | "CANCELLED"
  xpAwarded: number | null
  completedAt: string | null
}

interface DuelTask {
  id: string
  title: string
  xpAwarded: number | null
  userId: string
  completedAt: string | null
}

interface ChallengeHistoryItem {
  id: string
  category: string
  wagerXP: number
  status: "COMPLETED" | "DECLINED" | "SURRENDERED"
  challenger: { id: string; name: string | null }
  opponent: { id: string; name: string | null }
  winner: { id: string; name: string | null } | null
  tasks: DuelTask[]
}

type Tab = "tasks" | "challenges"

export default function HistoryPage() {
  const [tab, setTab] = useState<Tab>("tasks")
  const [tasks, setTasks] = useState<TaskHistoryItem[]>([])
  const [challenges, setChallenges] = useState<ChallengeHistoryItem[]>([])
  const [myId, setMyId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  useEffect(() => {
    fetch("/api/user/sync", { method: "POST" })
      .then((r) => r.json())
      .then((data) => setMyId(data.user?.id ?? null))

    fetch("/api/tasks/history")
      .then((r) => r.json())
      .then((data) => setTasks(data.tasks ?? []))

    fetch("/api/challenges/active")
      .then((r) => r.json())
      .then((data) => {
        setChallenges(data.completed ?? [])
        setLoading(false)
      })
  }, [])

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="max-w-2xl mx-auto p-6 space-y-6">
        <h1 className="text-xl font-semibold tracking-tight flex items-center gap-2">
          <History className="text-indigo-400" size={22} />
          History
        </h1>

        <div className="flex gap-1 rounded-lg border border-slate-800 bg-slate-900/60 p-1 w-fit">
          <button
            onClick={() => setTab("tasks")}
            className={
              tab === "tasks"
                ? "px-4 py-1.5 rounded-md text-sm font-medium bg-indigo-600 text-white transition-colors"
                : "px-4 py-1.5 rounded-md text-sm font-medium text-slate-400 hover:text-slate-200 transition-colors"
            }
          >
            Tasks
          </button>
          <button
            onClick={() => setTab("challenges")}
            className={
              tab === "challenges"
                ? "px-4 py-1.5 rounded-md text-sm font-medium bg-indigo-600 text-white transition-colors"
                : "px-4 py-1.5 rounded-md text-sm font-medium text-slate-400 hover:text-slate-200 transition-colors"
            }
          >
            Duels
          </button>
        </div>

        {loading && <p className="text-slate-500 text-sm">Loading...</p>}

        {!loading && tab === "tasks" && (
          <div className="space-y-2">
            {tasks.length === 0 && (
              <p className="text-slate-500 text-sm py-8 text-center">No completed tasks yet.</p>
            )}
            {tasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900/60 p-3"
              >
                {task.status === "COMPLETED" && <CheckCircle2 size={17} className="text-emerald-400 shrink-0" />}
                {task.status === "FAILED" && <XCircle size={17} className="text-red-400 shrink-0" />}
                {task.status === "CANCELLED" && <Ban size={17} className="text-slate-500 shrink-0" />}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-100 truncate">{task.title}</p>
                  <p className="text-xs text-slate-500">
                    {Math.round(task.durationSec / 60)} min ·{" "}
                    {task.completedAt ? new Date(task.completedAt).toLocaleDateString() : ""}
                  </p>
                </div>
                {task.xpAwarded !== null && task.xpAwarded > 0 && (
                  <span className="font-mono text-sm font-medium text-indigo-400 shrink-0">
                    +{task.xpAwarded} XP
                  </span>
                )}
              </div>
            ))}
          </div>
        )}

        {!loading && tab === "challenges" && (
          <div className="space-y-2">
            {challenges.length === 0 && (
              <p className="text-slate-500 text-sm py-8 text-center">No completed duels yet.</p>
            )}
            {challenges.map((c) => {
              const opponent = c.challenger.id === myId ? c.opponent : c.challenger
              const won = c.winner?.id === myId
              const lost = c.winner && c.winner.id !== myId
              const expanded = expandedId === c.id

              return (
                <div
                  key={c.id}
                  className={
                    won
                      ? "rounded-xl border overflow-hidden border-amber-700/40 bg-amber-950/10"
                      : "rounded-xl border overflow-hidden border-slate-800 bg-slate-900/60"
                  }
                >
                  <button
                    onClick={() => setExpandedId(expanded ? null : c.id)}
                    className="w-full flex items-center gap-3 p-3 text-left hover:bg-slate-800/30 transition-colors"
                  >
                    {won ? (
                      <Trophy size={17} className="text-amber-400 shrink-0" />
                    ) : (
                      <Swords size={17} className="text-slate-500 shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-100 truncate">
                        vs {opponent.name ?? "Anonymous"} · {c.category}
                      </p>
                      <p className="text-xs text-slate-500">
                        {c.status === "DECLINED"
                          ? "Declined"
                          : c.status === "SURRENDERED"
                          ? "Surrendered"
                          : won
                          ? "You won"
                          : lost
                          ? "You lost"
                          : "Tied — no wager transferred"}
                      </p>
                    </div>
                    {c.status !== "DECLINED" && (
                      <span
                        className={
                          won
                            ? "font-mono text-sm font-medium shrink-0 text-emerald-400"
                            : lost
                            ? "font-mono text-sm font-medium shrink-0 text-red-400"
                            : "font-mono text-sm font-medium shrink-0 text-slate-500"
                        }
                      >
                        {won ? "+" : lost ? "-" : ""}{c.wagerXP} XP
                      </span>
                    )}
                    <ChevronDown
                      size={15}
                      className={
                        expanded
                          ? "text-slate-400 rotate-180 transition-transform shrink-0"
                          : "text-slate-500 transition-transform shrink-0"
                      }
                    />
                  </button>

                  {expanded && (
                    <div className="border-t border-slate-800 bg-slate-950/50 p-3 space-y-1.5">
                      {c.tasks.length === 0 && (
                        <p className="text-xs text-slate-600 py-1">No tasks were logged toward this duel.</p>
                      )}
                      {c.tasks.map((task) => (
                        <div key={task.id} className="flex items-center gap-2 text-xs">
                          <CheckCircle2 size={12} className="text-emerald-400 shrink-0" />
                          <span className="flex-1 text-slate-300 truncate">{task.title}</span>
                          <span className="text-slate-600">
                            {task.userId === myId ? "You" : opponent.name ?? "Opponent"}
                          </span>
                          <span className="font-mono text-indigo-400 font-medium">
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
        )}
      </div>
    </div>
  )
}