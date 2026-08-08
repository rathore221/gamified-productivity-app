import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { SignInButton, SignUpButton } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { Zap, Swords, Trophy, Timer, ArrowRight } from "lucide-react"

const FEATURES = [
  {
    icon: Timer,
    title: "Beat the clock",
    description: "Set a task, start the countdown. Let it hit zero to win — no shortcuts, no partial credit.",
  },
  {
    icon: Zap,
    title: "Earn real XP",
    description: "Every completed task banks XP toward your level. Watch your progress bar fill in real time.",
  },
  {
    icon: Swords,
    title: "Duel your friends",
    description: "Challenge someone to a head-to-head race with an XP wager on the line. Winner takes it all.",
  },
  {
    icon: Trophy,
    title: "Climb the leaderboard",
    description: "Weekly and all-time rankings, global or friends-only. Prove you're the most productive.",
  },
]

export default async function HomePage() {
  const { userId } = await auth()
  if (userId) redirect("/dashboard")

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="max-w-3xl mx-auto px-6 pt-24 pb-20 text-center space-y-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-slate-800 bg-slate-900/60 text-xs font-medium text-slate-400">
          <Zap size={12} className="text-indigo-400" />
          Productivity, gamified
        </div>

        <h1 className="text-5xl sm:text-6xl font-semibold tracking-tight leading-[1.05] text-white">
          Beat the clock.
          <br />
          <span className="text-indigo-400">Earn XP. Level up.</span>
        </h1>

        <p className="text-lg text-slate-400 max-w-xl mx-auto leading-relaxed">
          Turn your to-do list into a game. Race a countdown, bank XP, duel your
          friends for the bragging rights — and the wager.
        </p>

        <div className="flex items-center justify-center gap-3 pt-2">
          <SignUpButton mode="modal">
            <Button className="h-11 px-6 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-base">
              Get Started Free
              <ArrowRight size={17} className="ml-1.5" />
            </Button>
          </SignUpButton>
          <SignInButton mode="modal">
            <Button
              variant="outline"
              className="h-11 px-6 border-slate-700 text-slate-300 hover:bg-slate-900 hover:text-white font-medium text-base"
            >
              Sign In
            </Button>
          </SignInButton>
        </div>

        <p className="text-xs text-slate-600 pt-1">
          Free forever. No credit card required.
        </p>
      </div>

      <div className="max-w-2xl mx-auto px-6 pb-20">
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center h-8 w-8 rounded-md bg-indigo-500/10 border border-indigo-500/20">
                <Zap size={13} className="text-indigo-400" />
              </div>
              <span className="text-sm font-medium text-slate-300">Level 7</span>
            </div>
            <span className="text-xs text-slate-500">340 / 500 XP</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden mb-6">
            <div className="h-full w-[68%] rounded-full bg-indigo-500" />
          </div>

          <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-200">Finish quarterly report</p>
              <p className="text-xs text-slate-600 mt-0.5">Racing the clock</p>
            </div>
            <span className="text-xl font-semibold font-mono text-white">04:12</span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 pb-24">
        <div className="grid sm:grid-cols-2 gap-4">
          {FEATURES.map((f) => {
            const Icon = f.icon
            return (
              <div
                key={f.title}
                className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 mb-4">
                  <Icon size={18} className="text-indigo-400" />
                </div>
                <h3 className="font-medium text-slate-100 mb-1.5">{f.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{f.description}</p>
              </div>
            )
          })}
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 pb-24 text-center space-y-6">
        <h2 className="text-3xl font-semibold tracking-tight text-white">
          Ready to race the clock?
        </h2>
        <p className="text-slate-500">
          Join and complete your first task in under a minute.
        </p>
        <SignUpButton mode="modal">
          <Button className="h-11 px-7 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-base">
            Get Started Free
            <ArrowRight size={17} className="ml-1.5" />
          </Button>
        </SignUpButton>
      </div>
    </div>
  )
}