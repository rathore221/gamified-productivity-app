import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const me = await prisma.user.findUnique({ where: { clerkId: userId } })
  if (!me) return NextResponse.json({ error: "User not synced" }, { status: 404 })

  const accepted = await prisma.friendship.findMany({
    where: {
      status: "ACCEPTED",
      OR: [{ requesterId: me.id }, { receiverId: me.id }],
    },
    include: {
      requester: { select: { id: true, name: true, imageUrl: true, level: true, xp: true, weeklyXp: true } },
      receiver: { select: { id: true, name: true, imageUrl: true, level: true, xp: true, weeklyXp: true } },
    },
  })

  const friends = accepted.map(
    (f: (typeof accepted)[number]) => (f.requesterId === me.id ? f.receiver : f.requester)
  )

  const incomingRequests = await prisma.friendship.findMany({
    where: { receiverId: me.id, status: "PENDING" },
    include: {
      requester: { select: { id: true, name: true, imageUrl: true, level: true } },
    },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json({
    friends,
    incomingRequests: incomingRequests.map((r: (typeof incomingRequests)[number]) => ({
      friendshipId: r.id,
      user: r.requester,
    })),
  })
}