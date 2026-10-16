/**
 * S-03 · Static Blueprint Car (phase 1). A generic open-wheel car in line art: no livery, number or sponsor.
 * Numbered balloons point at five parts; the parts list below the drawing carries the text and the links,
 * so it stays readable at any width. Particles and interactive hotspots arrive in phase 3.
 */

export const CAR_PARTS = [
  { n: 1, name: 'Languages', spec: 'Python · Java · SQL', href: '#skills-power-unit', part: [236, 150], balloon: [206, 52] },
  { n: 2, name: 'Cloud', spec: 'Azure (AZ-204) · AWS (Developer Associate)', href: '#skills-aero', part: [66, 98], balloon: [40, 40] },
  { n: 3, name: 'Data', spec: 'Kafka · Spark · Delta Lake', href: '#skills-fuel-system', part: [298, 66], balloon: [300, 22] },
  { n: 4, name: 'Testing', spec: "100% branch coverage on PulseRoute's safety gate", href: '#skills-brakes', part: [500, 203], balloon: [590, 276] },
  { n: 5, name: 'Driver', spec: 'Kaushil, say hello', href: '#contact', part: [376, 102], balloon: [440, 30] },
] as const

const S = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, vectorEffect: 'non-scaling-stroke', strokeLinejoin: 'round', strokeLinecap: 'round' } as const

function Wheel({ cx, cy, r }: { cx: number; cy: number; r: number }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} {...S} fill="var(--bg)" pathLength={1} />
      <circle cx={cx} cy={cy} r={r * 0.68} {...S} pathLength={1} />
      <circle cx={cx} cy={cy} r={r * 0.16} {...S} />
      {[0, 60, 120].map((a) => (
        <line
          key={a}
          x1={cx + Math.cos((a * Math.PI) / 180) * r * 0.2}
          y1={cy + Math.sin((a * Math.PI) / 180) * r * 0.2}
          x2={cx + Math.cos((a * Math.PI) / 180) * r * 0.62}
          y2={cy + Math.sin((a * Math.PI) / 180) * r * 0.62}
          {...S}
          opacity={0.5}
        />
      ))}
      {[180, 240, 300].map((a) => (
        <line
          key={a}
          x1={cx + Math.cos((a * Math.PI) / 180) * r * 0.2}
          y1={cy + Math.sin((a * Math.PI) / 180) * r * 0.2}
          x2={cx + Math.cos((a * Math.PI) / 180) * r * 0.62}
          y2={cy + Math.sin((a * Math.PI) / 180) * r * 0.62}
          {...S}
          opacity={0.5}
        />
      ))}
    </g>
  )
}

export function BlueprintCar() {
  return (
    <figure className="m-0">
      <svg
        viewBox="0 0 640 300"
        role="img"
        aria-labelledby="car-title car-desc"
        className="draw block h-auto w-full text-text"
      >
        <title id="car-title">Blueprint of a generic open-wheel race car</title>
        <desc id="car-desc">Side elevation line drawing with five numbered parts, listed below the drawing.</desc>

        {/* Ground and wheelbase dimension */}
        <line x1="10" y1="240" x2="630" y2="240" {...S} opacity={0.35} strokeDasharray="2 6" />
        <g opacity={0.55}>
          <line x1="150" y1="256" x2="500" y2="256" {...S} />
          <line x1="150" y1="250" x2="150" y2="262" {...S} />
          <line x1="500" y1="250" x2="500" y2="262" {...S} />
          <text x="325" y="252" textAnchor="middle" className="fill-muted font-mono" fontSize="10" letterSpacing="1">
            WB 3600
          </text>
        </g>

        {/* Flow highlights: streamlines over the body */}
        <g stroke="var(--flow)" fill="none" strokeWidth={1.5} vectorEffect="non-scaling-stroke" opacity={0.7}>
          <path d="M630 150 C 560 128, 470 104, 420 92 C 380 82, 330 66, 270 74 C 200 84, 130 92, 20 78" strokeDasharray="3 7" />
          <path d="M630 176 C 560 158, 500 140, 440 128 C 400 120, 360 124, 330 132 C 280 140, 200 150, 30 150" strokeDasharray="3 7" opacity={0.6} />
          <path d="M630 124 C 560 102, 480 74, 400 64 C 340 56, 280 48, 200 56 C 140 62, 80 60, 20 52" strokeDasharray="3 7" opacity={0.45} />
        </g>

        {/* Rear wing */}
        <path d="M40 90 L60 88 L64 182 L46 184 Z" {...S} pathLength={1} />
        <path d="M30 96 L108 90" {...S} pathLength={1} />
        <path d="M32 110 L104 104" {...S} pathLength={1} />
        <path d="M88 104 L104 160" {...S} pathLength={1} />

        {/* Body: engine cover, airbox, cockpit, nose, underside */}
        <path
          d="M72 172 L110 162 C 160 152, 222 128, 262 104 L 284 86 L 318 82 Q 332 82 336 96 L 338 112 L 352 114 L 412 116 C 448 122, 478 132, 510 144 L 592 168 Q 604 173 594 180 L 520 188 C 480 194, 440 198, 400 200 L 300 204 L 200 206 L 120 198 L 72 188 Z"
          {...S}
          pathLength={1}
        />
        {/* Airbox intake and T-camera */}
        <path d="M322 86 Q 330 88 330 98" {...S} />
        <path d="M298 82 L298 66 M290 66 L306 66" {...S} pathLength={1} />

        {/* Sidepod and inlet */}
        <path d="M352 138 C 300 136, 238 150, 192 178" {...S} pathLength={1} />
        <path d="M352 138 C 362 144, 362 164, 350 178" {...S} pathLength={1} />
        <path d="M350 178 C 300 184, 240 190, 196 196" {...S} opacity={0.5} />

        {/* Halo, driver, mirror */}
        <path d="M342 108 C 360 90, 404 90, 420 110" {...S} pathLength={1} />
        <path d="M410 100 L416 116" {...S} />
        <circle cx="376" cy="102" r="12" {...S} fill="var(--bg)" />
        <path d="M366 100 L386 100" {...S} opacity={0.6} />
        <path d="M424 118 L432 106 L446 106" {...S} />

        {/* Floor, plank, diffuser */}
        <path d="M100 222 L118 228 L470 228" {...S} pathLength={1} />
        <path d="M188 232 L464 232" {...S} opacity={0.45} />

        {/* Front wing */}
        <path d="M538 214 L626 211 L628 219 L546 223 Z" {...S} pathLength={1} />
        <path d="M612 194 L630 194 L632 222 L614 224 Z" {...S} pathLength={1} />
        <path d="M584 180 L586 212 M560 184 L562 214" {...S} />

        {/* Suspension */}
        <g opacity={0.8}>
          <path d="M150 200 L212 180 M150 200 L214 198" {...S} />
          <path d="M500 203 L440 168 M500 203 L446 192 M500 203 L454 150" {...S} />
        </g>

        <Wheel cx={150} cy={200} r={40} />
        <Wheel cx={500} cy={203} r={37} />

        {/* Balloons */}
        {CAR_PARTS.map((p) => (
          <g key={p.n} className="text-flow">
            <line x1={p.part[0]} y1={p.part[1]} x2={p.balloon[0]} y2={p.balloon[1]} {...S} stroke="var(--flow)" opacity={0.85} />
            <circle cx={p.part[0]} cy={p.part[1]} r="3" fill="var(--flow)" />
            <circle cx={p.balloon[0]} cy={p.balloon[1]} r="11" {...S} stroke="var(--flow)" fill="var(--bg)" />
            <text x={p.balloon[0]} y={p.balloon[1] + 4} textAnchor="middle" fontSize="12" className="fill-text font-mono">
              {p.n}
            </text>
          </g>
        ))}

        <text x="10" y="292" className="fill-muted font-mono" fontSize="10" letterSpacing="1">
          K-01 · SIDE ELEVATION · NTS
        </text>
      </svg>

      <figcaption className="mt-4">
        <p className="t-label mb-2 text-muted">What the car is made of</p>
        <ol>
          {CAR_PARTS.map((p) => (
            <li key={p.n} className="border-t border-line last:border-b">
              <a href={p.href} className="group flex items-baseline gap-3 py-2 text-[14px] leading-snug">
                <span className="font-mono text-[12px] text-flow">{p.n}</span>
                <span className="w-24 flex-none font-mono text-[12px] uppercase tracking-[0.08em] text-muted">{p.name}</span>
                <span className="group-hover:underline group-hover:decoration-flow group-hover:underline-offset-4">{p.spec}</span>
              </a>
            </li>
          ))}
        </ol>
      </figcaption>
    </figure>
  )
}
