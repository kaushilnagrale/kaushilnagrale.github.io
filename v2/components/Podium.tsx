import { SectionHeader } from '@/components/SectionHeader'
import { anchorFor, awards } from '@/lib/content'

const STEP: Record<string, { height: string; order: string }> = {
  P1: { height: 'md:h-44', order: 'md:order-2' },
  P2: { height: 'md:h-32', order: 'md:order-1' },
  P3: { height: 'md:h-24', order: 'md:order-3' },
}

/** Awards on a three-step podium, then certifications and other credentials. */
export function Podium() {
  return (
    <section id="awards" aria-labelledby="awards-title" className="blueprint py-20 md:py-28">
      <div className="wrap">
        <SectionHeader id="awards" kicker={`${awards.podium.length} awards · ${awards.standings.length} more`} />

        <ol className="grid grid-cols-1 gap-4 md:grid-cols-3 md:items-end md:gap-0">
          {awards.podium.map((a) => {
            const step = STEP[a.pos]
            const n = a.pos.slice(1)
            return (
              <li key={a.pos} className={`reveal flex flex-row-reverse items-stretch gap-4 md:flex-col md:gap-0 ${step.order}`}>
                <div className="flex-1 pb-0 md:px-5 md:pb-5">
                  <p className={`t-label text-[11px] ${a.pos === 'P1' ? 'text-s-purple' : 'text-muted'}`}>{a.kind}</p>
                  <h3 className="mt-1 text-[19px] font-bold leading-snug">{a.title}</h3>
                  <p className="text-[15px] text-muted">{a.detail}</p>
                  {a.project ? (
                    <a href={anchorFor(a.project)} className="link mt-1 inline-block text-[14px]">
                      See the project
                    </a>
                  ) : null}
                </div>
                <div
                  aria-hidden="true"
                  className={`flex h-20 w-20 flex-none items-center justify-center rounded-t-lg border-[1.5px] border-text bg-surface md:w-full md:border-b-0 ${step.height}`}
                >
                  <span className={`t-metric text-[48px] md:text-[72px] ${a.pos === 'P1' ? 'text-s-purple' : ''}`}>{n}</span>
                </div>
              </li>
            )
          })}
        </ol>
        <div aria-hidden="true" className="hidden h-px bg-text md:block" />

        <h3 className="t-label mb-3 mt-12 text-muted">Certifications and more</h3>
        <ul className="divide-y divide-line border-y border-line">
          {awards.standings.map((s) => (
            <li key={s.title} className="flex flex-wrap items-baseline gap-x-4 gap-y-1 py-3.5">
              <span className="font-semibold">{s.title}</span>
              <span className="text-muted">{s.detail}</span>
              {s.href ? (
                <a href={s.href} target="_blank" rel="noopener noreferrer" className="link ml-auto text-[14px]">
                  Verify
                </a>
              ) : null}
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
