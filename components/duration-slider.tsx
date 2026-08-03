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
        <div className="flex items-center gap-2 text-zinc-400">
          <Clock size={14} />
          <span className="text-xs uppercase tracking-wider font-semibold">Duration</span>
        </div>
        <span className="text-lg font-black text-white tabular-nums">
          {formatDuration(minutes)}
        </span>
      </div>

      <div className="relative pt-1 pb-2">
        {/* Track */}
        <div className="relative h-2 rounded-full bg-zinc-800">
          <div
            className="absolute h-full rounded-full bg-gradient-to-r from-purple-500 to-fuchsia-400 shadow-[0_0_10px_2px_rgba(168,85,247,0.5)] transition-all"
            style={{ width: `${percent}%` }}
          />
        </div>

        {/* Tick marks for presets */}
        <div className="absolute inset-x-0 top-1 h-2 pointer-events-none">
          {PRESETS.map((p) => (
            <div
              key={p}
              className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 h-1.5 w-1.5 rounded-full transition-colors ${
                minutes >= p ? "bg-white/70" : "bg-zinc-600"
              }`}
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
          className="absolute inset-x-0 top-1 h-2 w-full opacity-0 cursor-pointer"
        />

        {/* Custom thumb */}
        <div
          className="absolute top-1 -translate-y-1/2 -translate-x-1/2 pointer-events-none transition-all"
          style={{ left: `${percent}%` }}
        >
          <div className="relative flex items-center justify-center">
            <div className="absolute h-6 w-6 rounded-full bg-purple-500/25 animate-pulse" />
            <div className="relative h-5 w-5 rounded-full bg-white border-2 border-purple-500 shadow-[0_0_12px_2px_rgba(168,85,247,0.6)]" />
          </div>
        </div>
      </div>

      <div className="flex gap-1.5 flex-wrap">
        {PRESETS.map((p) => (
          <button
            key={p}
            onClick={() => onChange(p)}
            className={