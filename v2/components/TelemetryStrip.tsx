import { anchorFor, type Readout } from '@/lib/content'
import { CountUp } from './CountUp'

/** S-04 · Six readouts under the hero. Values come from content/lenses.json and change with the lens. */
export function TelemetryStrip({ readouts }: { readouts: Readout[] }) {
  return (
    <section aria-label="Telemetry: headline numbers" className="border-y border-line bg-surface">
      <ul className="wrap grid grid-cols-2 gap-px bg-line !px-0 md:grid-cols-3 xl:grid-cols-6">
        {readouts.map((r, i) => (
          <li key={`${r.value}-${r.caption}`} className="bg-surface">
            <a href={anchorFor(r.target)} className="group block h-full px-3 py-5 md:px-5 md:py-6">
              <span className="t-label flex items-center gap-2 text-[11px] text-muted">
                <span aria-hidden="true">S{i + 1}</span>
                {r.best ? <span className="text-s-purple">Fastest</span> : null}
              </span>
              <CountUp value={r.value} className={`t-metric mt-2 block text-[40px] md:text-[48px] ${r.best ? 'text-s-purple' : ''}`} />
              <span className="mt-1.5 block text-[14px] leading-snug text-muted group-hover:text-text">{r.caption}</span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  )
}
