import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const me = await prisma.user.findUnique({ where: { clerkId: userId } })
  if (!me) return NextResponse.json({ error: "User not synced" }, { status: 404 })

  const { searchParams } = new URL(req.url)
  const q = searchParams.get("q")?.trim()
  if (!q || q.length < 2) {
    return NextResponse.json({ users: [] })
  }

  // Anyone already connected (pending, accepted, or blocked) in either
  // direction should be excluded from search results.
  const existingConnections = await prisma.friendship.findMany({
    where: { OR: [{ requesterId: me.id }, { receiverId: me.id }] },
    select: { requesterId: true, receiverId: true },
  })

  const excludedIds = new Set<string>([me.id])
  for (const c of existingConnections) {
    excludedIds.add(c.requesterId)
    excludedIds.add(c.receiverId)
  }

  const users = await prisma.user.findMany({
    where: {
      name: { contains: q, mode: "insensitive" },
      id: { notIn: Array.from(excludedIds) },
    },
    select: { id: true, name: true, imageUrl: true, level: true },
    take: 10,
  })

  return NextResponse.json({ users })
}