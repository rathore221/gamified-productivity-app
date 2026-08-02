"use client"

import { Clock } from "lucide-react"

interface DurationSliderProps {
  minutes: number
  onChange: (minutes: number) => void
}

const PRESETS = [5, 15, 25, 45, 60, 90]

export function DurationSlider({ minutes, onChange }: DurationSliderProps) {
  const percent = Math.min(100, (minutes / 120) * 100)

  function formatDuration(m: number) {
    if (m < 60) return `${m} min`
    const h = Math.floor(m / 60)
    const rem = m % 60
    return rem === 0 ? `${h}h` : `${h}h ${rem}m`
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-zinc-400">
          <Clock size={14} />
          <span className="text-xs uppercase tracking-wider font-semibold">Duration</span>
        </div>
        <span className="text-lg font-black text-white tabular-nums">
          {formatDuration(minutes)}
        </span>
      </div>

      <div className="relative h-2 rounded-full bg-zinc-800">
        <div
          className="absolute h-full rounded-full bg-gradient-to-r from-purple-500 to-fuchsia-400 shadow-[0_0_10px_2px_rgba(168,85,247,0.5)] transition-all"
          style={{ width: `${percent}%` }}
        />
        <input
          type="range"
          min={1}
          max={120}
          value={minutes}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute inset-0 w-full h-2 opacity-0 cursor-pointer"
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 h-4 w-4 rounded-full bg-white shadow-[0_0_0_4px_rgba(168,85,247,0.3)] pointer-events-none transition-all"
          style={{ left: `${percent}%` }}
        />
      </div>

      <div className="flex gap-1.5 flex-wrap">
        {PRESETS.map((p) => (
          <button
            key={p}
            onClick={() => onChange(p)}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${
              minutes === p
                ? "bg-purple-600 text-white"
                : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200"
            }`}
          >
            {formatDuration(p)}
          </button>
        ))}
      </div>
    </div>
  )
}