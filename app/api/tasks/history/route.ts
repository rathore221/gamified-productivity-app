import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const me = await prisma.user.findUnique({ where: { clerkId: userId } })
  if (!me) return NextResponse.json({ error: "User not synced" }, { status: 404 })

  const tasks = await prisma.task.findMany({
    where: { userId: me.id, status: { in: ["COMPLETED", "FAILED", "CANCELLED"] } },
    orderBy: { completedAt: "desc" },
    take: 50,
  })

  return NextResponse.json({ tasks })
}