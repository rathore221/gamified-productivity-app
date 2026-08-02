import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const user = await prisma.user.findUnique({ where: { clerkId: userId } })
  if (!user) return NextResponse.json({ error: "User not synced" }, { status: 404 })

  const tasks = await prisma.task.findMany({
    where: { userId: user.id, status: "ACTIVE" },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json({ tasks })
}

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const user = await prisma.user.findUnique({ where: { clerkId: userId } })
  if (!user) return NextResponse.json({ error: "User not synced" }, { status: 404 })

  const body = await req.json()
  const { title, durationSec, challengeId } = body as {
    title: string
    durationSec: number
    challengeId?: string
  }

  if (!title || !durationSec || durationSec <= 0) {
    return NextResponse.json({ error: "Invalid task data" }, { status: 400 })
  }

  let validChallengeId: string | undefined
  if (challengeId) {
    const challenge = await prisma.challenge.findUnique({ where: { id: challengeId } })
    if (
      challenge &&
      challenge.status === "ACTIVE" &&
      (challenge.challengerId === user.id || challenge.opponentId === user.id)
    ) {
      validChallengeId = challengeId
    }
  }

  const task = await prisma.task.create({
    data: { title, durationSec, userId: user.id, challengeId: validChallengeId },
  })

  return NextResponse.json({ task })
}