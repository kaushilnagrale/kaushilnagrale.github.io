/**
 * Scroll position mapped onto the section list for the road rail and the mobile progress lane.
 * p runs from 0 (first section) to 1 (last section). A section counts as reached when its top passes
 * 40% of the viewport, which is when its label lines up with the car.
 */
export function raceProgress(ids: string[]): { p: number; index: number } {
  const n = ids.length
  if (n < 2) return { p: 0, index: 0 }
  const ref = window.scrollY + window.innerHeight * 0.4
  const maxRef = document.documentElement.scrollHeight - window.innerHeight * 0.6
  const anchors: number[] = []
  for (const id of ids) {
    const el = document.getElementById(id)
    const top = el ? el.getBoundingClientRect().top + window.scrollY : 0
    // The last sections may sit too low to reach 40%; pull them up so the car still arrives.
    anchors.push(Math.max(Math.min(top, maxRef), (anchors[anchors.length - 1] ?? -Infinity) + 1))
  }
  let k = 0
  while (k < n - 1 && ref >= anchors[k + 1]) k++
  const f = k >= n - 1 ? 0 : Math.min(1, Math.max(0, (ref - anchors[k]) / (anchors[k + 1] - anchors[k])))
  return { p: Math.min(1, (k + f) / (n - 1)), index: k }
}

/** Centre line of the road, as an x offset (px) for t in [0, 1] down a 44px-wide lane. */
export const ROAD_WIDTH = 44
const AMPLITUDE = 9
const WAVES = 3.5

export function roadX(t: number): number {
  return ROAD_WIDTH / 2 + AMPLITUDE * Math.sin(2 * Math.PI * WAVES * t)
}

/** dx/dt of the centre line, used to steer the car along the bends. */
export function roadSlope(t: number): number {
  return AMPLITUDE * 2 * Math.PI * WAVES * Math.cos(2 * Math.PI * WAVES * t)
}

/** The road as an SVG path in a 44 × 1000 viewBox (stretched to the rail height), optionally offset sideways. */
export function roadPath(offset = 0, steps = 140): string {
  let d = ''
  for (let i = 0; i <= steps; i++) {
    const t = i / steps
    d += `${i ? ' L' : 'M'}${(roadX(t) + offset).toFixed(2)} ${(t * 1000).toFixed(1)}`
  }
  return d
}
