import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"
import { getCurrentWeekStart } from "@/lib/week"

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const me = await prisma.user.findUnique({ where: { clerkId: userId } })
  if (!me) return NextResponse.json({ error: "User not synced" }, { status: 404 })

  const { id: friendId } = await params

  const friendship = await prisma.friendship.findFirst({
    where: {
      status: "ACCEPTED",
      OR: [
        { requesterId: me.id, receiverId: friendId },
        { requesterId: friendId, receiverId: me.id },
      ],
    },
  })
  if (!friendship) {
    return NextResponse.json({ error: "Not friends with this user" }, { status: 403 })
  }

  const friend = await prisma.user.findUnique({
    where: { id: friendId },
    select: {
      id: true,
      name: true,
      imageUrl: true,
      level: true,
      xp: true,
      weeklyXp: true,
      weekStart: true,
      trophiesCount: true,
    },
  })
  if (!friend) return NextResponse.json({ error: "User not found" }, { status: 404 })

  const currentWeekStart = getCurrentWeekStart()
  const effectiveWeeklyXp = friend.weekStart < currentWeekStart ? 0 : friend.weeklyXp

  const allTimeChallenges = await prisma.challenge.findMany({
    where: {
      status: { in: ["COMPLETED", "SURRENDERED"] },
      OR: [{ challengerId: friendId }, { opponentId: friendId }],
    },
    select: { winnerId: true, challengerId: true, opponentId: true },
  })
  const allTimeWins = allTimeChallenges.filter(
    (c: (typeof allTimeChallenges)[number]) => c.winnerId === friendId
  ).length
  const allTimeLosses = allTimeChallenges.filter(
    (c: (typeof allTimeChallenges)[number]) => c.winnerId && c.winnerId !== friendId
  ).length
  const allTimeTies = allTimeChallenges.length - allTimeWins - allTimeLosses

  const headToHead = await prisma.challenge.findMany({
    where: {
      status: { in: ["COMPLETED", "SURRENDERED", "DECLINED"] },
      OR: [
        { challengerId: me.id, opponentId: friendId },
        { challengerId: friendId, opponentId: me.id },
      ],
    },
    orderBy: { createdAt: "desc" },
    include: {
      tasks: {
        where: { status: "COMPLETED" },
        select: { id: true, title: true, xpAwarded: true, userId: true, completedAt: true },
        orderBy: { completedAt: "asc" },
      },
    },
  })

  const resolvedH2H = headToHead.filter(
    (c: (typeof headToHead)[number]) => c.status !== "DECLINED"
  )
  const wins = resolvedH2H.filter(
    (c: (typeof resolvedH2H)[number]) => c.winnerId === me.id
  ).length
  const losses = resolvedH2H.filter(
    (c: (typeof resolvedH2H)[number]) => c.winnerId === friendId
  ).length
  const ties = resolvedH2H.length - wins - losses

  return NextResponse.json({
    friend: {
      id: friend.id,
      name: friend.name,
      imageUrl: friend.imageUrl,
      level: friend.level,
      xp: friend.xp,
      weeklyXp: effectiveWeeklyXp,
      trophiesCount: friend.trophiesCount,
    },
    friendshipId: friendship.id,
    allTimeRecord: { wins: allTimeWins, losses: allTimeLosses, ties: allTimeTies, total: allTimeChallenges.length },
    headToHeadRecord: { wins, losses, ties, total: resolvedH2H.length },
    headToHeadDuels: headToHead.map((c: (typeof headToHead)[number]) => ({
      id: c.id,
      category: c.category,
      wagerXP: c.wagerXP,
      status: c.status,
      winnerId: c.winnerId,
      challengerId: c.challengerId,
      opponentId: c.opponentId,
      tasks: c.tasks,
    })),
  })
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const me = await prisma.user.findUnique({ where: { clerkId: userId } })
  if (!me) return NextResponse.json({ error: "User not synced" }, { status: 404 })

  const { id: friendId } = await params

  const friendship = await prisma.friendship.findFirst({
    where: {
      status: "ACCEPTED",
      OR: [
        { requesterId: me.id, receiverId: friendId },
        { requesterId: friendId, receiverId: me.id },
      ],
    },
  })
  if (!friendship) {
    return NextResponse.json({ error: "Friendship not found" }, { status: 404 })
  }

  await prisma.friendship.delete({ where: { id: friendship.id } })

  return NextResponse.json({ removed: true })
}