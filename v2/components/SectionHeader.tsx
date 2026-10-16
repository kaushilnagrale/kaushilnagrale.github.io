import type { ReactNode } from 'react'
import { SECTIONS, sectionNumber, sheetNumber } from '@/lib/sections'

/** Plain heading for each section: number and a one-line summary of what is inside, then the title. */
export function SectionHeader({ id, kicker, intro }: { id: string; kicker?: string; intro?: ReactNode }) {
  const meta = SECTIONS.find((s) => s.id === id)!
  return (
    <header className="mb-10 flex flex-wrap items-end justify-between gap-x-6 gap-y-4 md:mb-12">
      <div className="min-w-0">
        <p className="t-label text-muted">
          <span className="text-text">{sectionNumber(id)}</span>
          {kicker ? ` · ${kicker}` : ''}
        </p>
        <h2 id={`${id}-title`} className="t-h2 mt-3">
          {meta.title}
        </h2>
        {intro ? <p className="mt-4 max-w-2xl text-muted">{intro}</p> : null}
      </div>
      <p className="title-block hidden sm:block" aria-hidden="true">
        {sheetNumber(id)} · K. NAGRALE · REV B
      </p>
    </header>
  )
}
