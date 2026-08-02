import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"

export async function PATCH(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const me = await prisma.user.findUnique({ where: { clerkId: userId } })
  if (!me) return NextResponse.json({ error: "User not synced" }, { status: 404 })

  const { friendshipId, status } = await req.json() as {
    friendshipId: string
    status: "ACCEPTED" | "DECLINED"
  }

  if (!friendshipId || !["ACCEPTED", "DECLINED"].includes(status)) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }

  const friendship = await prisma.friendship.findUnique({ where: { id: friendshipId } })
  if (!friendship || friendship.receiverId !== me.id) {
    return NextResponse.json({ error: "Request not found" }, { status: 404 })
  }
  if (friendship.status !== "PENDING") {
    return NextResponse.json({ error: "Request already resolved" }, { status: 400 })
  }

  if (status === "DECLINED") {
    await prisma.friendship.delete({ where: { id: friendshipId } })
    return NextResponse.json({ declined: true })
  }

  const updated = await prisma.friendship.update({
    where: { id: friendshipId },
    data: { status: "ACCEPTED" },
  })

  return NextResponse.json({ friendship: updated })
}