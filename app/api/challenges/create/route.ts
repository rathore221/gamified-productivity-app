import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const me = await prisma.user.findUnique({ where: { clerkId: userId } })
  if (!me) return NextResponse.json({ error: "User not synced" }, { status: 404 })

  const { opponentId, category, duration, wagerXP } = await req.json() as {
    opponentId: string
    category: string
    duration: "ONE_DAY" | "ONE_WEEK"
    wagerXP: number
  }

  if (!opponentId || opponentId === me.id) {
    return NextResponse.json({ error: "Invalid opponent" }, { status: 400 })
  }
  if (!category?.trim()) {
    return NextResponse.json({ error: "Category required" }, { status: 400 })
  }
  if (!["ONE_DAY", "ONE_WEEK"].includes(duration)) {
    return NextResponse.json({ error: "Invalid duration" }, { status: 400 })
  }
  if (!wagerXP || wagerXP <= 0 || wagerXP > 1000) {
    return NextResponse.json({ error: "Wager must be between 1 and 1000 XP" }, { status: 400 })
  }

  const friendship = await prisma.friendship.findFirst({
    where: {
      status: "ACCEPTED",
      OR: [
        { requesterId: me.id, receiverId: opponentId },
        { requesterId: opponentId, receiverId: me.id },
      ],
    },
  })
  if (!friendship) {
    return NextResponse.json({ error: "You can only challenge friends" }, { status: 403 })
  }

  const challenge = await prisma.challenge.create({
    data: {
      challengerId: me.id,
      opponentId,
      category: category.trim(),
      duration,
      wagerXP,
      status: "PENDING",
    },
  })

  return NextResponse.json({ challenge })
}