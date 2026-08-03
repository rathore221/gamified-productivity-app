/**
 * Canonical week boundary for the shared leaderboard — anchored to
 * Sunday 00:00 UTC so every user is ranked against the same window.
 * Per-viewer timezone is handled client-side for display only.
 */
export function getCurrentWeekStart(date: Date = new Date()): Date {
    const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()))
    const day = d.getUTCDay() // 0 = Sunday
    d.setUTCDate(d.getUTCDate() - day)
    d.setUTCHours(0, 0, 0, 0)
    return d
  }
  
  export function getNextWeekStart(date: Date = new Date()): Date {
    const next = new Date(getCurrentWeekStart(date))
    next.setUTCDate(next.getUTCDate() + 7)
    return next
  }

  export function getWeekStartFor(date: Date): Date {
    return getCurrentWeekStart(date)
  }
  
  export function formatWeekLabel(weekStart: Date): string {
    const weekEnd = new Date(weekStart)
    weekEnd.setUTCDate(weekEnd.getUTCDate() + 6)
  
    const fmt = (d: Date) =>
      d.toLocaleDateString(undefined, { month: "short", day: "numeric" })
  
    return `${fmt(weekStart)} – ${fmt(weekEnd)}`
  }