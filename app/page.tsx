import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { SignInButton, SignUpButton } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { Logo } from "@/components/logo"
import { Zap, Swords, Trophy, Timer, Users, ArrowRight } from "lucide-react"

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
    <div className="min-h-screen bg-zinc-950 text-zinc-100 overflow-hidden">
      {/* Hero */}
      <div className="relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(168,85,247,0.25),transparent)] pointer-events-none" />
        <div className="absolute top-1/3 left-1/4 h-64 w-64 rounded-full bg-fuchsia-600/10 blur-3xl pointer-events-none" />

        <div className="relative max-w-3xl mx-auto px-6 pt-24 pb-20 text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 text-xs font-bold text-purple-300 uppercase tracking-wider">
            <Zap size={12} />
            Productivity, gamified
          </div>

          <h1 className="text-5xl sm:text-6xl font-black tracking-tight leading-[1.05]">
            Beat the clock.
            <br />
            <span className="bg-gradient-to-r from-purple-400 to-fuchsia-400 bg-clip-text text-transparent">
              Earn XP. Level up.
            </span>
          </h1>

          <p className="text-lg text-zinc-400 max-w-xl mx-auto leading-relaxed">
            Turn your to-do list into a game. Race a countdown, bank XP, duel your
            friends for the bragging rights — and the wager.
          </p>

          <div className="flex items-center justify-center gap-3 pt-2">
            <SignUpButton mode="modal">
              <Button className="h-12 px-7 bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-white font-bold text-base shadow-[0_0_25px_rgba(168,85,247,0.4)]">
                Get Started Free
                <ArrowRight size={18} className="ml-1.5" />
              </Button>
            </SignUpButton>
            <SignInButton mode="modal">
              <Button
                variant="outline"
                className="h-12 px-7 border-zinc-700 text-zinc-300 hover:bg-zinc-900 hover:text-white font-bold text-base"
              >
                Sign In
              </Button>
            </SignInButton>
          </div>

          <p className="text-xs text-zinc-600 pt-1">
            Free forever. No credit card required.
          </p>
        </div>
      </div>

      {/* Live demo mockup */}
      <div className="max-w-2xl mx-auto px-6 -mt-4 pb-20">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 backdrop-blur-md p-6 shadow-2xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-purple-500/15 border border-purple-500/30">
                <Zap size={14} className="text-purple-400" />
              </div>
              <span className="text-sm font-bold text-zinc-300">Level 7</span>
            </div>
            <span className="text-xs font-mono text-zinc-500">340 / 500 XP</span>
          </div>
          <div className="h-2.5 w-full rounded-full bg-zinc-800 overflow-hidden mb-6">
            <div className="h-full w-[68%] rounded-full bg-gradient-to-r from-purple-500 to-fuchsia-400 shadow-[0_0_10px_2px_rgba(168,85,247,0.5)]" />
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-zinc-200">Finish quarterly report</p>
              <p className="text-xs text-zinc-600 mt-0.5">Racing the clock</p>
            </div>
            <span className="text-2xl font-black font-mono text-white tabular-nums">04:12</span>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="max-w-4xl mx-auto px-6 pb-24">
        <div className="grid sm:grid-cols-2 gap-4">
          {FEATURES.map((f) => {
            const Icon = f.icon
            return (
              <div
                key={f.title}
                className="rounded-2xl border border-zinc-800 bg-zinc-900/50 backdrop-blur-md p-6 hover:border-zinc-700 transition-colors"
              >
                <div className="flex items-center justify-center h-11 w-11 rounded-xl bg-purple-500/15 border border-purple-500/30 mb-4">
                  <Icon size={20} className="text-purple-400" />
                </div>
                <h3 className="font-bold text-zinc-100 mb-1.5">{f.title}</h3>
                <p className="text-sm text-zinc-500 leading-relaxed">{f.description}</p>
              </div>
            )
          })}
        </div>
      </div>

      {/* Final CTA */}
      <div className="max-w-2xl mx-auto px-6 pb-24 text-center space-y-6">
        <div className="flex items-center justify-center">
          <Logo size={48} />
        </div>
        <h2 className="text-3xl font-black tracking-tight">
          Ready to race the clock?
        </h2>
        <p className="text-zinc-500">
          Join and complete your first task in under a minute.
        </p>
        <SignUpButton mode="modal">
          <Button className="h-12 px-8 bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-white font-bold text-base shadow-[0_0_25px_rgba(168,85,247,0.4)]">
            Get Started Free
            <ArrowRight size={18} className="ml-1.5" />
          </Button>
        </SignUpButton>
      </div>
    </div>
  )
}