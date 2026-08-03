import { prisma } from "@/lib/prisma"

export async function resolveExpiredChallenges(userId: string) {
  const now = new Date()

  const expired = await prisma.challenge.findMany({
    where: {
      status: "ACTIVE",
      endDate: { lte: now },
      OR: [{ challengerId: userId }, { opponentId: userId }],
    },
  })

  for (const challenge of expired) {
    const isTie = challenge.challengerXP === challenge.opponentXP
    const winnerId = isTie
      ? null
      : challenge.challengerXP > challenge.opponentXP
      ? challenge.challengerId
      : challenge.opponentId
    const loserId = isTie
      ? null
      : winnerId === challenge.challengerId
      ? challenge.opponentId
      : challenge.challengerId

    await prisma.challenge.update({
      where: { id: challenge.id },
      data: { status: "COMPLETED", winnerId },
    })

    if (winnerId && loserId) {
      await prisma.user.update({
        where: { id: loserId },
        data: { xp: { decrement: challenge.wagerXP } },
      })
      await prisma.user.update({
        where: { id: winnerId },
        data: {
          xp: { increment: challenge.wagerXP },
          trophiesCount: { increment: 1 },
        },
      })
    }
  }
}