'use client'

import { MoreHorizontal } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { raceProgress } from '@/lib/race'
import type { SectionMeta } from '@/lib/sections'
import { TopDownCar } from './TopDownCar'

const PRIMARY = ['home', 'projects', 'experience', 'skills', 'contact']

/** Bottom bar below 1200px. The "More" sheet is a native popover, so it opens without JavaScript. */
export function MobileBar({ sections, resume }: { sections: SectionMeta[]; resume: string }) {
  const primary = sections.filter((s) => PRIMARY.includes(s.id))
  const fill = useRef<HTMLSpanElement>(null)
  const car = useRef<HTMLSpanElement>(null)

  // Progress lane: the car drives left to right along the top of the bar as the page scrolls.
  useEffect(() => {
    const ids = sections.map((s) => s.id)
    let raf = 0
    const update = () => {
      raf = 0
      const { p } = raceProgress(ids)
      if (fill.current) fill.current.style.transform = `scaleX(${p})`
      if (car.current) car.current.style.left = `calc(${p * 100}% - ${p * 22}px)`
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [sections])

  return (
    <nav aria-label="Sections" className="no-print fixed inset-x-0 bottom-0 z-40 border-t border-line bg-bg/95 pb-[env(safe-area-inset-bottom)] backdrop-blur xl:hidden">
      <div aria-hidden="true" className="relative h-[3px] bg-line">
        <span ref={fill} className="absolute inset-0 origin-left scale-x-0 bg-flow" />
        <span ref={car} className="absolute -top-[9px] left-0 block h-[22px] w-[12px] rotate-[-90deg] transition-[left] duration-150 ease-out">
          <TopDownCar className="h-full w-full" />
        </span>
      </div>
      <ul className="mx-auto grid max-w-xl grid-cols-6">
        {primary.map((s) => (
          <li key={s.id}>
            <a href={`#${s.id}`} className="flex h-14 items-center justify-center px-1 text-center text-[12px] font-medium leading-tight">
              {s.label}
            </a>
          </li>
        ))}
        <li>
          <button type="button" popoverTarget="more-sheet" className="flex h-14 w-full flex-col items-center justify-center gap-0.5 text-[12px] font-medium">
            <MoreHorizontal aria-hidden="true" size={18} strokeWidth={1.5} />
            More
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
                <span className="w-5 font-mono text-[11px] text-muted">{String(i + 1).padStart(2, '0')}</span>
                <span className="truncate text-[14px]">{s.title}</span>
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
