"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { Gamepad2, Mail, Send } from "lucide-react"

export default function AboutPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")
  const [sending, setSending] = useState(false)

  async function handleSubmit() {
    if (!name.trim() || !email.trim() || !message.trim()) {
      toast.error("Fill in every field before sending")
      return
    }
    setSending(true)
    // No backend contact-form route exists yet — this is a placeholder
    // that simulates a send. Wire this up to a real API route (e.g.
    // app/api/contact/route.ts sending via Resend/SendGrid) when ready.
    await new Promise((r) => setTimeout(r, 600))
    toast.success("Message sent — we'll get back to you soon")
    setName("")
    setEmail("")
    setMessage("")
    setSending(false)
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="max-w-2xl mx-auto p-6 py-16 space-y-12">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center h-14 w-14 rounded-2xl bg-gradient-to-br from-purple-600 to-fuchsia-600 shadow-[0_0_20px_rgba(168,85,247,0.4)] mx-auto">
            <Gamepad2 size={26} className="text-white" />
          </div>
          <h1 className="text-3xl font-black tracking-tight">About LevelUp</h1>
          <p className="text-zinc-500 max-w-md mx-auto leading-relaxed">
            LevelUp turns your to-do list into a game. Set a timer, race the clock,
            earn XP, and compete with friends — built for people who focus better
            with a countdown and a scoreboard.
          </p>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 backdrop-blur-md p-6 space-y-5">
          <div className="flex items-center gap-2">
            <Mail size={16} className="text-purple-400" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-300">
              Contact Us
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <Input
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-zinc-950 border-zinc-800 text-zinc-100 h-11"
            />
            <Input
              type="email"
              placeholder="Your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-zinc-950 border-zinc-800 text-zinc-100 h-11"
            />
          </div>

          <textarea
            placeholder="What's on your mind?"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={5}
            className="w-full rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-100 placeholder:text-zinc-600 p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-purple-500/50"
          />

          <Button
            onClick={handleSubmit}
            disabled={sending}
            className="w-full h-11 bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 disabled:opacity-40 text-white font-bold shadow-[0_0_20px_rgba(168,85,247,0.3)]"
          >
            <Send size={16} className="mr-1.5" />
            {sending ? "Sending..." : "Send Message"}
          </Button>
        </div>
      </div>
    </div>
  )
}