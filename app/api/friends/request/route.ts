import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const me = await prisma.user.findUnique({ where: { clerkId: userId } })
  if (!me) return NextResponse.json({ error: "User not synced" }, { status: 404 })

  const { receiverId } = await req.json()
  if (!receiverId || receiverId === me.id) {
    return NextResponse.json({ error: "Invalid receiver" }, { status: 400 })
  }

  const receiver = await prisma.user.findUnique({ where: { id: receiverId } })
  if (!receiver) return NextResponse.json({ error: "User not found" }, { status: 404 })

  const existing = await prisma.friendship.findFirst({
    where: {
      OR: [
        { requesterId: me.id, receiverId },
        { requesterId: receiverId, receiverId: me.id },
      ],
    },
  })
  if (existing) {
    return NextResponse.json({ error: "Friendship already exists" }, { status: 409 })
  }

  const friendship = await prisma.friendship.create({
    data: { requesterId: me.id, receiverId, status: "PENDING" },
  })

  return NextResponse.json({ friendship })
}