import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const me = await prisma.user.findUnique({ where: { clerkId: userId } })
  if (!me) return NextResponse.json({ error: "User not synced" }, { status: 404 })

  const { challengeId } = await req.json() as { challengeId: string }

  const challenge = await prisma.challenge.findUnique({ where: { id: challengeId } })
  if (!challenge || (challenge.challengerId !== me.id && challenge.opponentId !== me.id)) {
    return NextResponse.json({ error: "Challenge not found" }, { status: 404 })
  }
  if (challenge.status !== "ACTIVE") {
    return NextResponse.json({ error: "Challenge is not active" }, { status: 400 })
  }

  const winnerId = challenge.challengerId === me.id ? challenge.opponentId : challenge.challengerId

  await prisma.$transaction([
    prisma.challenge.update({
      where: { id: challengeId },
      data: { status: "SURRENDERED", winnerId },
    }),
    prisma.user.update({
      where: { id: me.id },
      data: { xp: { decrement: challenge.wagerXP } },
    }),
    prisma.user.update({
      where: { id: winnerId },
      data: { xp: { increment: challenge.wagerXP }, trophiesCount: { increment: 1 } },
    }),
  ])

  return NextResponse.json({ surrendered: true })
}