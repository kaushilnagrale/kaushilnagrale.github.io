'use client'

import { useEffect, useState } from 'react'
import type { SectionMeta } from '@/lib/sections'

/** Left rail on wide screens: numbered sections, the current one marked. Plain anchors, so it works with JavaScript off. */
export function TimingTowerNav({ sections }: { sections: SectionMeta[] }) {
  const active = useActiveSection(sections)

  return (
    <nav aria-label="Sections" className="fixed inset-y-0 left-0 z-40 hidden w-[132px] flex-col border-r border-line bg-bg/95 py-6 backdrop-blur xl:flex">
      <a href="#home" className="mb-8 block px-5 font-heavy text-[15px] font-extrabold tracking-tight">
        <span className="sr-only">Kaushil Nagrale, back to top</span>
        <span aria-hidden="true">KN</span>
      </a>
      <ol className="flex flex-col">
        {sections.map((s, i) => {
          const isActive = active === s.id
          return (
            <li key={s.id}>
              <a
                href={`#${s.id}`}
                aria-current={isActive ? 'location' : undefined}
                className={`relative flex h-11 items-center gap-3 px-5 text-[14px] font-medium transition-colors hover:bg-surface-2 ${
                  isActive ? 'text-s-purple' : 'text-text'
                }`}
              >
                <span aria-hidden="true" className={`absolute inset-y-2 left-0 w-[3px] rounded-r ${isActive ? 'bg-s-purple' : 'bg-transparent'}`} />
                <span aria-hidden="true" className="w-4 font-mono text-[11px] text-muted tabular-nums">
                  {String(i + 1).padStart(2, '0')}
                </span>
                {s.label}
              </a>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

export function useActiveSection(sections: SectionMeta[]) {
  const [active, setActive] = useState(sections[0]?.id)

  useEffect(() => {
    const els = sections.map((s) => document.getElementById(s.id)).filter((el): el is HTMLElement => !!el)
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target.id)
      },
      { rootMargin: '-40% 0px -55% 0px' },
    )
    els.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [sections])

  return active
}
