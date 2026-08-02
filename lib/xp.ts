export function xpForLevel(level: number): number {
    return Math.round(100 * Math.pow(level, 1.5))
  }
  
  export function levelFromXp(xp: number): number {
    let level = 1
    while (xp >= xpForLevel(level + 1)) {
      level++
    }
    return level
  }
  
  export function xpProgress(xp: number) {
    const level = levelFromXp(xp)
    const currentLevelXp = xpForLevel(level)
    const nextLevelXp = xpForLevel(level + 1)
    const progress = (xp - currentLevelXp) / (nextLevelXp - currentLevelXp)
  
    return {
      level,
      currentLevelXp,
      nextLevelXp,
      progressPercent: Math.min(100, Math.max(0, progress * 100)),
      xpIntoLevel: xp - currentLevelXp,
      xpNeededForNext: nextLevelXp - currentLevelXp,
    }
  }
  
  export function calculateXpReward(durationSec: number): number {
    return Math.round(durationSec / 60)
  }