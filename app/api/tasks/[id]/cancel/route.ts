import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"

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

  const updatedTask = await prisma.task.update({
    where: { id },
    data: { status: "CANCELLED", completedAt: new Date(), xpAwarded: 0 },
  })

  return NextResponse.json({ task: updatedTask })
}