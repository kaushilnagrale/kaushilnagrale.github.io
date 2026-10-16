import { SectionHeader } from '@/components/SectionHeader'
import { anchorFor, experience, projectTitle, type Corner } from '@/lib/content'

// Corner positions on the drawn track, in corner order T1..T9.
const TRACK = [
  [330, 400],
  [370, 330],
  [300, 260],
  [360, 170],
  [300, 60],
  [170, 80],
  [210, 190],
  [90, 250],
  [60, 340],
] as const
const START = [90, 400] as const
const COUNT: Record<number, string> = { 7: 'Seven', 8: 'Eight', 9: 'Nine', 10: 'Ten' }
const trackPath = `M${START.join(' ')} ${TRACK.map((p) => `L${p.join(' ')}`).join(' ')} Z`

/** S-08 · Experience as a lap. Phase 1 is the list; the scroll-driven car joins in phase 3. */
export function Circuit() {
  const { sectors, corners } = experience

  return (
    <section id="circuit" aria-labelledby="circuit-title" className="blueprint py-20 md:py-28">
      <div className="wrap">
        <SectionHeader
          id="circuit"
          intro={`${COUNT[corners.length] ?? corners.length} corners, three sectors: mechanical roots, industry at Cognizant, then ASU.`}
        />

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
          <div className="hidden lg:col-span-4 lg:block" aria-hidden="true">
            <svg viewBox="0 0 430 460" className="sticky top-10 w-full text-text">
              <path d={trackPath} fill="none" stroke="var(--line)" strokeWidth="18" strokeLinejoin="round" />
              <path d={trackPath} fill="none" stroke="var(--bg)" strokeWidth="14" strokeLinejoin="round" />
              <path d={trackPath} fill="none" stroke="var(--text)" strokeWidth="1.5" strokeDasharray="2 8" strokeLinejoin="round" opacity="0.5" />
              <g transform={`translate(${START[0] + 20} ${START[1]})`}>
                {[0, 1, 2, 3].map((r) =>
                  [0, 1].map((c) => <rect key={`${r}${c}`} x={c * 4} y={-8 + r * 4} width="4" height="4" fill={(r + c) % 2 ? 'var(--text)' : 'var(--bg)'} />),
                )}
              </g>
              {corners.map((c, i) => {
                const [x, y] = TRACK[i]
                return (
                  <g key={c.id}>
                    <circle cx={x} cy={y} r="15" fill="var(--surface)" stroke={c.current ? 'var(--s-purple)' : 'var(--text)'} strokeWidth="1.5" />
                    <text x={x} y={y + 4} textAnchor="middle" fontSize="11" className="font-mono" fill={c.current ? 'var(--s-purple)' : 'var(--text)'}>
                      {c.id}
                    </text>
                  </g>
                )
              })}
              <text x="20" y="450" fontSize="11" className="font-mono" fill="var(--muted)" letterSpacing="1">
                {sectors.map((s) => `${s.id} ${s.name.toUpperCase()}`).join(' · ')}
              </text>
            </svg>
          </div>

          <ol className="lg:col-span-8">
            {corners.map((c, i) => {
              const sector = sectors.find((s) => s.id === c.sector)!
              const firstInSector = i === 0 || corners[i - 1].sector !== c.sector
              return (
                <li key={c.id} className="reveal">
                  {firstInSector ? (
                    <p className={`t-label flex items-center gap-3 text-muted ${i ? 'mt-10' : ''} mb-4`}>
                      <span className="text-text">{sector.id}</span> {sector.name}
                      <span className="h-px flex-1 bg-line" aria-hidden="true" />
                    </p>
                  ) : null}
                  <CornerCard corner={c} />
                </li>
              )
            })}
          </ol>
        </div>
      </div>
    </section>
  )
}

function CornerCard({ corner: c }: { corner: Corner }) {
  return (
    <article className={`relative mb-3 border-l-2 py-3 pl-5 ${c.current ? 'border-s-purple' : 'border-line'}`}>
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span className={`font-mono text-[13px] font-medium ${c.current ? 'text-s-purple' : 'text-muted'}`}>{c.id}</span>
        <span className="font-mono text-[13px] text-muted">{c.date}</span>
        {c.current ? <span className="t-label text-[11px] text-s-purple">Current lap</span> : null}
      </div>
      <h3 className="mt-1 text-[19px] font-bold leading-snug">{c.title}</h3>
      <p className="text-[15px] text-muted">{c.org}</p>
      {c.points.length ? (
        <ul className="mt-2 space-y-1.5">
          {c.points.map((p) => (
            <li key={p.text} className="flex gap-3 text-[15px] leading-relaxed">
              <span className="chip h-fit w-12 flex-none justify-center !px-0 !py-0 text-[11px]">{p.tag}</span>
              <span>{p.text}</span>
            </li>
          ))}
        </ul>
      ) : null}
      {c.project ? (
        <a href={anchorFor(c.project)} className="link mt-2 inline-block text-[14px]">
          See {projectTitle(c.project)}
        </a>
      ) : null}
    </article>
  )
}
