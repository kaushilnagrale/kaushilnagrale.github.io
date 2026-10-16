import type { ReactNode } from 'react'
import { SECTIONS, sheetNumber } from '@/lib/sections'

export function SectionHeader({ id, intro }: { id: string; intro?: ReactNode }) {
  const meta = SECTIONS.find((s) => s.id === id)!
  return (
    <header className="mb-10 flex flex-wrap items-end justify-between gap-x-6 gap-y-4 md:mb-12">
      <div className="min-w-0">
        <p className="t-label text-muted">
          <span className="text-text">{meta.code}</span> · {meta.plain}
        </p>
        <h2 id={`${id}-title`} className="t-h2 mt-3">
          {meta.name}
        </h2>
        {intro ? <p className="mt-4 max-w-2xl text-muted">{intro}</p> : null}
      </div>
      <p className="title-block hidden sm:block" aria-hidden="true">
        {sheetNumber(id)} · K. NAGRALE · REV B
      </p>
    </header>
  )
}
