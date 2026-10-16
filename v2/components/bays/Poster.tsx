import type { Bay } from '@/lib/content'

export type PosterData = Pick<Bay, 'slug' | 'title' | 'tagline' | 'domains' | 'sectors'>
import { wrap } from './svgText'

/**
 * Generated blueprint title card for a bay. Used as the LIVE poster and the app side of X-RAY
 * until real screenshots land in content (media.poster / media.xrayUi).
 */
export function Poster({ bay, index, variant = 'live' }: { bay: PosterData; index: number; variant?: 'live' | 'xray' }) {
  const id = `poster-${bay.slug}-${variant}`
  const titleSize = Math.min(118, Math.floor(1380 / (bay.title.length * 0.74)))
  const tagline = wrap(bay.tagline, 52)
  const best = bay.sectors.find((x) => x.best) ?? bay.sectors[0]

  return (
    <svg viewBox="0 0 1600 1000" className="block h-full w-full" aria-hidden="true" preserveAspectRatio="xMidYMid slice">
      <defs>
        <pattern id={`${id}-minor`} width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M40 0H0V40" fill="none" stroke="var(--text)" strokeOpacity="0.05" strokeWidth="1" />
        </pattern>
        <pattern id={`${id}-major`} width="200" height="200" patternUnits="userSpaceOnUse">
          <rect width="200" height="200" fill={`url(#${id}-minor)`} />
          <path d="M200 0H0V200" fill="none" stroke="var(--text)" strokeOpacity="0.1" strokeWidth="1.5" />
        </pattern>
      </defs>
      <rect width="1600" height="1000" fill="var(--surface-2)" />
      <rect width="1600" height="1000" fill={`url(#${id}-major)`} />

      {/* Streamline flourish, low in the frame where the overlay sits */}
      <g fill="none" stroke="var(--flow)" strokeWidth="2" opacity="0.5">
        <path d="M-20 860 C 300 780, 600 950, 900 860 S 1400 780, 1620 850" strokeDasharray="6 12" />
        <path d="M-20 900 C 320 830, 620 990, 920 910 S 1420 830, 1620 900" strokeDasharray="6 12" opacity="0.6" />
      </g>

      <text x="96" y="140" fill="var(--muted)" fontSize="28" letterSpacing="3" className="font-mono">
        PROJECT {String(index).padStart(2, '0')} · {bay.domains.join(' · ')}
      </text>
      <text
        x="92"
        y={140 + titleSize + 40}
        fill="var(--text)"
        fontSize={titleSize}
        fontWeight={800}
        className="font-heavy"
      >
        {bay.title}
      </text>
      {tagline.map((l, i) => (
        <text key={i} x="96" y={140 + titleSize + 110 + i * 46} fill="var(--muted)" fontSize="36" className="font-sans">
          {l}
        </text>
      ))}

      {/* One headline number; the spec sheet beside the viewport carries all three sector times. */}
      <g>
        <line x1="96" y1="500" x2="760" y2="500" stroke="var(--line)" strokeWidth="2" />
        <text x="96" y="545" fill="var(--muted)" fontSize="24" letterSpacing="3" className="font-mono">
          KEY RESULT
        </text>
        <text x="90" y="668" fill="var(--s-purple)" fontSize="128" fontWeight={700} className="font-narrow">
          {best.value}
        </text>
        {wrap(best.caption, 44)
          .slice(0, 2)
          .map((l, j) => (
            <text key={j} x="96" y={712 + j * 32} fill="var(--muted)" fontSize="24" className="font-mono">
              {l}
            </text>
          ))}
      </g>

      <g className="font-mono" fontSize="20" letterSpacing="2" fill="var(--muted)">
        <rect x="1150" y="60" width="390" height="44" rx="6" fill="none" stroke="var(--line)" strokeWidth="2" />
        <text x="1345" y="89" textAnchor="middle">
          K. NAGRALE · REV B
        </text>
      </g>
    </svg>
  )
}
