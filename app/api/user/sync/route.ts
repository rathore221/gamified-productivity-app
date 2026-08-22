import { NextResponse } from "next/server"
import { auth, currentUser } from "@clerk/nextjs/server"
import { Prisma } from "@prisma/client"
import { prisma } from "@/lib/prisma"

export async function POST() {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const clerkUser = await currentUser()
  if (!clerkUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }

  const email = clerkUser.emailAddresses[0]?.emailAddress ?? ""

  try {
    const user = await prisma.user.upsert({
      where: { clerkId: userId },
      update: {
        email,
        name: clerkUser.fullName,
        imageUrl: clerkUser.imageUrl,
      },
      create: {
        clerkId: userId,
        email,
        name: clerkUser.fullName,
        imageUrl: clerkUser.imageUrl,
      },
    })

    return NextResponse.json({ user })
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2002" &&
      Array.isArray(err.meta?.target) &&
      err.meta?.target.includes("email")
    ) {
      // A different row already owns this email under a stale/old clerkId.
      // Re-point that existing row to the current Clerk user instead of
      // trying to create a duplicate.
      try {
        const user = await prisma.user.update({
          where: { email },
          data: {
            clerkId: userId,
            name: clerkUser.fullName,
            imageUrl: clerkUser.imageUrl,
          },
        })
        return NextResponse.json({ user })
      } catch (innerErr) {
        console.error("user/sync failed while reconciling by email:", innerErr)
        return NextResponse.json({ error: "Sync failed" }, { status: 500 })
      }
    }

    console.error("user/sync failed:", err)
    return NextResponse.json({ error: "Sync failed" }, { status: 500 })
  }
}