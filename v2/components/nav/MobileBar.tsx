'use client'

import { MoreHorizontal } from 'lucide-react'
import { MOBILE_CODES, type SectionMeta } from '@/lib/sections'

/** S-01 · Bottom bar below 1200px. The "More" sheet is a native popover, so it needs no JavaScript. */
export function MobileBar({ sections, resume }: { sections: SectionMeta[]; resume: string }) {
  const primary = sections.filter((s) => MOBILE_CODES.includes(s.code))

  return (
    <nav
      aria-label="Sections"
      className="no-print fixed inset-x-0 bottom-0 z-40 border-t border-line bg-bg/95 pb-[env(safe-area-inset-bottom)] backdrop-blur xl:hidden"
    >
      <ul className="mx-auto grid max-w-xl grid-cols-6">
        {primary.map((s) => (
          <li key={s.id}>
            <a href={`#${s.id}`} className="flex h-14 flex-col items-center justify-center gap-0.5 font-mono text-[12px] font-medium tracking-[0.08em]">
              <span>{s.code}</span>
              <span className="font-sans text-[10px] font-medium tracking-normal text-muted">{s.plain.split(' ')[0]}</span>
            </a>
          </li>
        ))}
        <li>
          <button
            type="button"
            popoverTarget="more-sheet"
            className="flex h-14 w-full flex-col items-center justify-center gap-0.5 font-mono text-[12px] font-medium tracking-[0.08em]"
          >
            <MoreHorizontal aria-hidden="true" size={18} strokeWidth={1.5} />
            <span className="font-sans text-[10px] font-medium tracking-normal text-muted">More</span>
          </button>
        </li>
      </ul>

      <div
        id="more-sheet"
        popover="auto"
        onClick={(e) => {
          if ((e.target as HTMLElement).closest('a')) e.currentTarget.hidePopover()
        }}
        className="m-0 mt-auto w-full max-w-none border-t border-line bg-surface p-4 pb-[calc(16px+env(safe-area-inset-bottom))] text-text backdrop:bg-black/50 [inset:auto_0_0_0]"
      >
        <p className="t-label mb-3 text-muted">All sections</p>
        <ol className="grid grid-cols-2 gap-2">
          {sections.map((s, i) => (
            <li key={s.id}>
              <a href={`#${s.id}`} className="flex items-center gap-3 rounded-xl border border-line px-3 py-3">
                <span className="w-4 font-mono text-[11px] text-muted">{i + 1}</span>
                <span className="font-mono text-[13px] tracking-[0.08em]">{s.code}</span>
                <span className="truncate text-[14px] text-muted">{s.plain}</span>
              </a>
            </li>
          ))}
        </ol>
        <div className="mt-4 flex flex-wrap gap-2">
          <a href={resume} download className="btn btn-primary flex-1">
            Download resume
          </a>
          <a href="/cv" className="btn btn-outline flex-1">
            30s CV
          </a>
        </div>
      </div>
    </nav>
  )
}
