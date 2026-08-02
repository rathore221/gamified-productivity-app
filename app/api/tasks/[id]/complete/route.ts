import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"
import { Prisma } from "@prisma/client"
import { calculateXpReward, levelFromXp } from "@/lib/xp"
import { getCurrentWeekStart } from "@/lib/week"

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const user = await prisma.user.findUnique({ where: { clerkId: userId } })
  if (!user) return NextResponse.json({ error: "User not synced" }, { status: 404 })

  const { id } = await params
  const task = await prisma.task.findUnique({ where: { id } })
  if (!task || task.userId !== user.id) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 })
  }
  if (task.status !== "ACTIVE") {
    return NextResponse.json({ error: "Task already resolved" }, { status: 400 })
  }

  const xpAwarded = calculateXpReward(task.durationSec)
  const newTotalXp = user.xp + xpAwarded

  const currentWeekStart = getCurrentWeekStart()
  const weekNeedsReset = user.weekStart < currentWeekStart
  const newWeeklyXp = (weekNeedsReset ? 0 : user.weeklyXp) + xpAwarded

  let challenge = null
  if (task.challengeId) {
    challenge = await prisma.challenge.findUnique({ where: { id: task.challengeId } })
    const isParticipant =
      challenge &&
      challenge.status === "ACTIVE" &&
      (challenge.challengerId === user.id || challenge.opponentId === user.id)
    if (!isParticipant) challenge = null
  }

  const ops: Prisma.PrismaPromise<unknown>[] = [
    prisma.task.update({
      where: { id },
      data: { status: "COMPLETED", completedAt: new Date(), xpAwarded },
    }),
    prisma.user.update({
      where: { id: user.id },
      data: {
        xp: { increment: xpAwarded },
        weeklyXp: newWeeklyXp,
        weekStart: weekNeedsReset ? currentWeekStart : user.weekStart,
        level: levelFromXp(newTotalXp),
      },
    }),
  ]

  if (challenge) {
    const isChallenger = challenge.challengerId === user.id
    ops.push(
      prisma.challenge.update({
        where: { id: challenge.id },
        data: isChallenger
          ? { challengerXP: { increment: xpAwarded } }
          : { opponentXP: { increment: xpAwarded } },
      })
    )
  }

  const results = await prisma.$transaction(ops)
  const updatedTask = results[0] as Awaited<ReturnType<typeof prisma.task.update>>
  const updatedUser = results[1] as Awaited<ReturnType<typeof prisma.user.update>>

  await prisma.xpLog.create({
    data: { userId: user.id, amount: xpAwarded, reason: `Completed: ${task.title}` },
  })

  return NextResponse.json({
    task: updatedTask,
    xpAwarded,
    newTotalXp: updatedUser.xp,
    newWeeklyXp: updatedUser.weeklyXp,
  })
}