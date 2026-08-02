import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"
import { resolveExpiredChallenges } from "@/lib/challenge"

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const me = await prisma.user.findUnique({ where: { clerkId: userId } })
  if (!me) return NextResponse.json({ error: "User not synced" }, { status: 404 })

  await resolveExpiredChallenges(me.id)

  const all = await prisma.challenge.findMany({
    where: { OR: [{ challengerId: me.id }, { opponentId: me.id }] },
    include: {
      challenger: { select: { id: true, name: true, imageUrl: true } },
      opponent: { select: { id: true, name: true, imageUrl: true } },
      winner: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
  })

  const pending = all.filter((c: (typeof all)[number]) => c.status === "PENDING")
  const active = all.filter((c: (typeof all)[number]) => c.status === "ACTIVE")
  const completed = all.filter((c: (typeof all)[number]) =>
    ["COMPLETED", "DECLINED", "SURRENDERED"].includes(c.status)
  )

  return NextResponse.json({ pending, active, completed, myId: me.id })
}