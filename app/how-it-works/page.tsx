import { Zap, Timer, Trophy, Swords, Users } from "lucide-react"

const STEPS = [
  {
    icon: Timer,
    title: "Set a task and a clock",
    description: "Name what you're working on and pick a duration. The countdown starts the moment you hit Start.",
  },
  {
    icon: Zap,
    title: "Beat the timer, earn XP",
    description: "Let the clock run out to complete the task and bank XP. Cancel early and you walk away with nothing — no partial credit.",
  },
  {
    icon: Trophy,
    title: "Level up and climb the leaderboard",
    description: "XP accumulates toward your level. Weekly and all-time leaderboards track where you stand against everyone else.",
  },
  {
    icon: Users,
    title: "Add friends",
    description: "Search for people you know, send friend requests, and see their level and XP once connected.",
  },
  {
    icon: Swords,
    title: "Challenge a friend to a duel",
    description: "Pick a category, a duration (24 hours or 7 days), and an XP wager. Whoever earns more challenge-XP by the deadline takes the pot and a trophy.",
  },
]

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="max-w-2xl mx-auto p-6 py-16 space-y-12">
        <div className="text-center space-y-3">
          <h1 className="text-3xl font-black tracking-tight">How It Works</h1>
          <p className="text-zinc-500">Five steps from opening a task to climbing the leaderboard.</p>
        </div>

        <div className="space-y-4">
          {STEPS.map((step, i) => {
            const Icon = step.icon
            return (
              <div
                key={step.title}
                className="rounded-2xl border border-zinc-800 bg-zinc-900/50 backdrop-blur-md p-5 flex gap-4"
              >
                <div className="flex items-center justify-center h-11 w-11 rounded-xl bg-purple-500/15 border border-purple-500/30 shrink-0">
                  <Icon size={20} className="text-purple-400" />
                </div>
                <div>
                  <p className="text-xs font-bold text-zinc-600 uppercase tracking-wider mb-1">
                    Step {i + 1}
                  </p>
                  <h3 className="font-bold text-zinc-100 mb-1">{step.title}</h3>
                  <p className="text-sm text-zinc-500 leading-relaxed">{step.description}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}