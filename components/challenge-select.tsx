"use client"

import { useEffect, useRef, useState } from "react"
import { Swords, ChevronDown, Check } from "lucide-react"

interface ChallengeOption {
  id: string
  category: string
  opponent: { name: string | null }
}

interface ChallengeSelectProps {
  options: ChallengeOption[]
  value: string
  onChange: (id: string) => void
}

export function ChallengeSelect({ options, value, onChange }: ChallengeSelectProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const selected = options.find((o) => o.id === value)
  const label = selected
    ? `${selected.category} vs ${selected.opponent.name}`
    : "Don't count toward a challenge"

  return (
    <div className="space-y-2" ref={ref}>
      <div className="flex items-center gap-1.5 text-zinc-400">
        <Swords size={14} />
        <span className="text-xs uppercase tracking-wider font-semibold">Challenge</span>
      </div>

      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className={
            open
              ? "w-full flex items-center justify-between rounded-xl bg-zinc-900 border border-purple-500/50 shadow-[0_0_0_1px_rgba(168,85,247,0.3)] p-3 text-sm text-left transition-colors"
              : "w-full flex items-center justify-between rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 p-3 text-sm text-left transition-colors"
          }
        >
          <span className={selected ? "text-zinc-100 font-medium" : "text-zinc-500"}>
            {label}
          </span>
          <ChevronDown
            size={16}
            className={open ? "text-zinc-400 rotate-180 transition-transform shrink-0" : "text-zinc-500 transition-transform shrink-0"}
          />
        </button>

        {open && (
          <div className="absolute z-10 mt-2 w-full rounded-xl border border-zinc-800 bg-zinc-950 shadow-xl overflow-hidden max-h-60 overflow-y-auto">
            <button
              type="button"
              onClick={() => {
                onChange("")
                setOpen(false)
              }}
              className="w-full flex items-center justify-between px-3 py-2.5 text-sm text-zinc-400 hover:bg-zinc-900 transition-colors text-left"
            >
              Don't count toward a challenge
              {!value && <Check size={14} className="text-purple-400 shrink-0" />}
            </button>

            {options.map((o) => (
              <button
                key={o.id}
                type="button"
                onClick={() => {
                  onChange(o.id)
                  setOpen(false)
                }}
                className="w-full flex items-center justify-between px-3 py-2.5 text-sm text-zinc-200 hover:bg-zinc-900 transition-colors text-left border-t border-zinc-900"
              >
                <span className="truncate">
                  {o.category} vs {o.opponent.name}
                </span>
                {value === o.id && <Check size={14} className="text-purple-400 shrink-0" />}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}