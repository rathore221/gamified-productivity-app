import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"

const DURATION_MS = {
  ONE_DAY: 24 * 60 * 60 * 1000,
  ONE_WEEK: 7 * 24 * 60 * 60 * 1000,
}

export async function PATCH(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const me = await prisma.user.findUnique({ where: { clerkId: userId } })
  if (!me) return NextResponse.json({ error: "User not synced" }, { status: 404 })

  const { challengeId, status } = await req.json() as {
    challengeId: string
    status: "ACCEPTED" | "DECLINED"
  }

  const challenge = await prisma.challenge.findUnique({ where: { id: challengeId } })
  if (!challenge || challenge.opponentId !== me.id) {
    return NextResponse.json({ error: "Challenge not found" }, { status: 404 })
  }
  if (challenge.status !== "PENDING") {
    return NextResponse.json({ error: "Challenge already resolved" }, { status: 400 })
  }

  if (status === "DECLINED") {
    const updated = await prisma.challenge.update({
      where: { id: challengeId },
      data: { status: "DECLINED" },
    })
    return NextResponse.json({ challenge: updated })
  }

  const startDate = new Date()
  const endDate = new Date(startDate.getTime() + DURATION_MS[challenge.duration])

  const updated = await prisma.challenge.update({
    where: { id: challengeId },
    data: { status: "ACTIVE", startDate, endDate },
  })

  return NextResponse.json({ challenge: updated })
}