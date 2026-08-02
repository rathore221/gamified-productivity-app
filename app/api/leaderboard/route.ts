import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"
import { getCurrentWeekStart, getNextWeekStart } from "@/lib/week"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const scope = searchParams.get("scope") // "friends" | null (global)

  const currentWeekStart = getCurrentWeekStart()
  const nextReset = getNextWeekStart()

  let idFilter: string[] | null = null

  if (scope === "friends") {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const me = await prisma.user.findUnique({ where: { clerkId: userId } })
    if (!me) return NextResponse.json({ error: "User not synced" }, { status: 404 })

    const accepted = await prisma.friendship.findMany({
      where: {
        status: "ACCEPTED",
        OR: [{ requesterId: me.id }, { receiverId: me.id }],
      },
      select: { requesterId: true, receiverId: true },
    })

    const ids = new Set<string>([me.id])
    for (const f of accepted) {
      ids.add(f.requesterId)
      ids.add(f.receiverId)
    }
    idFilter = Array.from(ids)
  }

  const users = await prisma.user.findMany({
    where: idFilter ? { id: { in: idFilter } } : undefined,
    take: idFilter ? undefined : 100,
    select: {
      id: true, name: true, imageUrl: true, xp: true,
      level: true, weeklyXp: true, weekStart: true, trophiesCount: true,
    },
  })

  const effective = users.map((u) => ({
    id: u.id,
    name: u.name,
    imageUrl: u.imageUrl,
    xp: u.xp,
    level: u.level,
    trophiesCount: u.trophiesCount,
    weeklyXp: u.weekStart < currentWeekStart ? 0 : u.weeklyXp,
  }))

  const weekly = [...effective].sort((a, b) => b.weeklyXp - a.weeklyXp).slice(0, 20)
  const allTime = [...effective].sort((a, b) => b.xp - a.xp).slice(0, 20)

  return NextResponse.json({ weekly, allTime, resetsAt: nextReset.toISOString() })
}