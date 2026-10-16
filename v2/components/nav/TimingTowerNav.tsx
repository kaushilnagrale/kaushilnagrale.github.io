'use client'

import { useEffect, useState } from 'react'
import type { SectionMeta } from '@/lib/sections'

/** S-01 · Left rail on wide screens. Plain anchors, so it works with JavaScript off. */
export function TimingTowerNav({ sections }: { sections: SectionMeta[] }) {
  const active = useActiveSection(sections)

  return (
    <nav
      aria-label="Sections"
      className="group fixed inset-y-0 left-0 z-40 hidden w-[72px] flex-col border-r border-line bg-bg/95 py-6 backdrop-blur transition-[width] duration-[250ms] ease-[var(--ease-pit)] hover:w-[220px] focus-within:w-[220px] xl:flex"
    >
      <a href="#home" className="mx-auto mb-6 block w-10 font-heavy text-[15px] font-extrabold tracking-tight">
        <span className="sr-only">Kaushil Nagrale, back to top</span>
        <span aria-hidden="true">KN</span>
      </a>
      <p className="t-label mb-2 px-[14px] text-[10px] text-muted" aria-hidden="true">
        Pos
      </p>
      <ol className="flex flex-col">
        {sections.map((s, i) => {
          const isActive = active === s.id
          return (
            <li key={s.id}>
              <a
                href={`#${s.id}`}
                aria-current={isActive ? 'location' : undefined}
                className={`relative flex h-11 items-center gap-3 overflow-hidden whitespace-nowrap px-[14px] font-mono text-[13px] font-medium tracking-[0.08em] transition-colors hover:bg-surface-2 ${
                  isActive ? 'text-s-purple' : 'text-text'
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`absolute inset-y-2 left-0 w-[3px] rounded-r ${isActive ? 'bg-s-purple' : 'bg-transparent'}`}
                />
                <span aria-hidden="true" className="w-4 text-right text-[11px] text-muted tabular-nums">
                  {i + 1}
                </span>
                <span>{s.code}</span>
                <span className="font-sans text-[14px] font-medium tracking-normal opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100">
                  {s.name}
                </span>
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
