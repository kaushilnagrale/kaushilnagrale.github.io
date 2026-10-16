import { BUILD_SHA, BUILD_TIME } from '@/lib/site'
import { TempeClock } from './TempeClock'

/** S-14 · One-line status bar under a checkered finish line. Demo counts come from content until /api/status (T-05). */
export function StatusBar({ live, total, timeZone }: { live: number; total: number; timeZone: string }) {
  const built = new Date(BUILD_TIME)
  const deploy = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone }).format(built)
  const year = new Intl.DateTimeFormat('en-US', { year: 'numeric', timeZone }).format(built)

  return (
    <footer className="pb-16 xl:pb-0">
      <div className="checkered" aria-hidden="true" />
      <div className="border-t border-line bg-surface">
        <ul className="wrap flex flex-wrap items-center gap-x-3 gap-y-1 py-3 font-mono text-[12px] tracking-[0.04em] text-muted [&>li+li]:before:mr-3 [&>li+li]:before:text-line [&>li+li]:before:content-['·']">
          <li className="inline-flex items-center gap-2 text-text">
            <span className="dot" data-status={live ? 'live' : 'none'} aria-hidden="true" />
            {live}/{total} demos live
          </li>
          <li>last deploy {deploy}</li>
          <li>
            build <span className="text-text">{BUILD_SHA}</span>
          </li>
          <li>
            <TempeClock timeZone={timeZone} />
          </li>
          <li>© {year} Kaushil Nagrale</li>
        </ul>
      </div>
    </footer>
  )
}
