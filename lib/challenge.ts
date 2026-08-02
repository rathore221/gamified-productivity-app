import { prisma } from "@/lib/prisma"

/**
 * Resolves any ACTIVE challenges whose endDate has passed:
 * determines the winner by isolated XP, transfers the wager,
 * awards a trophy, and marks the challenge COMPLETED.
 * Ties: no XP transfer, no trophy, still marked COMPLETED.
 */
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

    await prisma.$transaction(async (tx) => {
      await tx.challenge.update({
        where: { id: challenge.id },
        data: { status: "COMPLETED", winnerId },
      })

      if (winnerId && loserId) {
        await tx.user.update({
          where: { id: loserId },
          data: { xp: { decrement: challenge.wagerXP } },
        })
        await tx.user.update({
          where: { id: winnerId },
          data: {
            xp: { increment: challenge.wagerXP },
            trophiesCount: { increment: 1 },
          },
        })
      }
    })
  }
}