import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const me = await prisma.user.findUnique({ where: { clerkId: userId } })
  if (!me) return NextResponse.json({ error: "User not synced" }, { status: 404 })

  const friendRequests = await prisma.friendship.findMany({
    where: { receiverId: me.id, status: "PENDING" },
    include: {
      requester: { select: { id: true, name: true, imageUrl: true, level: true } },
    },
    orderBy: { createdAt: "desc" },
  })

  const challengeRequests = await prisma.challenge.findMany({
    where: { opponentId: me.id, status: "PENDING" },
    include: {
      challenger: { select: { id: true, name: true, imageUrl: true } },
    },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json({
    friendRequests: friendRequests.map((r) => ({
      friendshipId: r.id,
      user: r.requester,
    })),
    challengeRequests: challengeRequests.map((c) => ({
      challengeId: c.id,
      category: c.category,
      duration: c.duration,
      wagerXP: c.wagerXP,
      challenger: c.challenger,
    })),
  })
}