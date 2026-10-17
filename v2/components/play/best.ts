/** Personal best for Quality Gate, kept in this browser only. */
export const BEST_KEY = 'quality-gate-best'

export function readBest(): number {
  try {
    return Number(localStorage.getItem(BEST_KEY)) || 0
  } catch {
    return 0
  }
}

export function saveBest(score: number) {
  try {
    if (score > readBest()) localStorage.setItem(BEST_KEY, String(score))
  } catch {
    /* storage can be blocked; the best score is a nicety */
  }
}
