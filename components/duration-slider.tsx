"use client"

import { Clock } from "lucide-react"

interface DurationSliderProps {
  minutes: number
  onChange: (minutes: number) => void
}

const PRESETS = [5, 15, 25, 45, 60, 90]
const MAX = 120

export function DurationSlider({ minutes, onChange }: DurationSliderProps) {
  const percent = Math.min(100, (minutes / MAX) * 100)

  function formatDuration(m: number) {
    if (m < 60) return `${m} min`
    const h = Math.floor(m / 60)
    const rem = m % 60
    return rem === 0 ? `${h}h` : `${h}h ${rem}m`
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-slate-400">
          <Clock size={14} />
          <span className="text-xs uppercase tracking-wide font-medium">Duration</span>
        </div>
        <span className="text-base font-semibold text-white">
          {formatDuration(minutes)}
        </span>
      </div>

      <div className="relative pt-1 pb-2">
        <div className="relative h-1.5 rounded-full bg-slate-800">
          <div
            className="absolute h-full rounded-full bg-indigo-500 transition-all"
            style={{ width: `${percent}%` }}
          />
        </div>

        <div className="absolute inset-x-0 top-1 h-1.5 pointer-events-none">
          {PRESETS.map((p) => (
            <div
              key={p}
              className={
                minutes >= p
                  ? "absolute top-1/2 -translate-y-1/2 -translate-x-1/2 h-1 w-1 rounded-full bg-white/60"
                  : "absolute top-1/2 -translate-y-1/2 -translate-x-1/2 h-1 w-1 rounded-full bg-slate-600"
              }
              style={{ left: `${Math.min(100, (p / MAX) * 100)}%` }}
            />
          ))}
        </div>

        <input
          type="range"
          min={1}
          max={MAX}
          value={minutes}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute inset-x-0 top-1 h-1.5 w-full opacity-0 cursor-pointer"
        />

        <div
          className="absolute top-1 -translate-y-1/2 -translate-x-1/2 pointer-events-none transition-all"
          style={{ left: `${percent}%` }}
        >
          <div className="h-4 w-4 rounded-full bg-white border-2 border-indigo-500" />
        </div>
      </div>

      <div className="flex gap-1.5 flex-wrap">
        {PRESETS.map((p) => (
          <button
            key={p}
            onClick={() => onChange(p)}
            className={
              minutes === p
                ? "px-3 py-1 rounded-md text-xs font-medium bg-indigo-600 text-white transition-colors"
                : "px-3 py-1 rounded-md text-xs font-medium bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200 transition-colors"
            }
          >
            {formatDuration(p)}
          </button>
        ))}
      </div>
    </div>
  )
}