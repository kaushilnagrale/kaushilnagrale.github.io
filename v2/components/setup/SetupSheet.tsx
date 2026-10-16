'use client'

import { X } from 'lucide-react'
import { useEffect, useId, useState } from 'react'

export interface SetupItem {
  id: string
  name: string
  /** Project slugs; titles and anchors come from the shared `projects` lookup. */
  projects: string[]
  roles: string[]
}

export type ProjectLookup = Record<string, { title: string; href: string }>

export interface SetupRow {
  id: string
  component: string
  mapsTo: string
  emphasized: boolean
  items: SetupItem[]
}

const STYLE_ID = 'setup-sheet-style'

/**
 * Skills by area. Hover or focus a skill to highlight every project that uses it; click to filter.
 * Highlighting is a generated stylesheet keyed on data-skills, so nothing else re-renders.
 */
export function SetupSheet({ rows, projects }: { rows: SetupRow[]; projects: ProjectLookup }) {
  const [hover, setHover] = useState<string | null>(null)
  const [filter, setFilter] = useState<string | null>(null)
  const detailId = useId()
  const items = rows.flatMap((r) => r.items)
  const shown = items.find((i) => i.id === (hover ?? filter))
  const filtered = items.find((i) => i.id === filter)

  useEffect(() => {
    let el = document.getElementById(STYLE_ID)
    if (!el) {
      el = document.createElement('style')
      el.id = STYLE_ID
      document.head.appendChild(el)
    }
    const css: string[] = []
    if (hover) css.push(`#projects [data-skills~="${hover}"], #more li[data-skills~="${hover}"] { box-shadow: 0 0 0 2px var(--flow); }`)
    if (filter)
      css.push(
        // filter, not opacity: the scroll-reveal animation owns opacity on bays.
        `#projects [data-skills]:not([data-skills~="${filter}"]) { filter: opacity(0.3) grayscale(0.5); }`,
        `#more [data-skills]:not([data-skills~="${filter}"]) { display: none; }`,
      )
    el.textContent = css.join('\n')
  }, [hover, filter])

  useEffect(() => () => document.getElementById(STYLE_ID)?.remove(), [])

  return (
    <>
      <div className="overflow-hidden rounded-2xl border border-line">
        <div className="grid grid-cols-[1fr] border-b border-line bg-surface-2 px-4 py-2.5 md:grid-cols-[240px_1fr]">
          <span className="t-label text-[11px] text-muted">Area</span>
          <span className="t-label hidden text-[11px] text-muted md:block">Skills</span>
        </div>
        {rows.map((row) => (
          <div
            key={row.id}
            id={`skills-${row.id}`}
            className={`grid scroll-mt-6 grid-cols-1 gap-3 border-b border-line px-4 py-4 last:border-b-0 md:grid-cols-[240px_1fr] md:gap-6 ${
              row.emphasized ? 'bg-surface' : 'bg-bg'
            }`}
          >
            <div>
              <h3 className="t-h3 text-[19px]">{row.mapsTo}</h3>
              {row.emphasized ? <p className="font-mono text-[12px] uppercase tracking-[0.08em] text-s-purple">Focus for this role</p> : null}
            </div>
            <ul className="flex flex-wrap gap-2">
              {row.items.map((item) => {
                const count = item.projects.length + item.roles.length
                if (!count) {
                  return (
                    <li key={item.id}>
                      <span className="chip border-dashed text-muted" title="Not linked to a project yet">
                        {item.name}
                      </span>
                    </li>
                  )
                }
                const active = filter === item.id
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      aria-pressed={active}
                      aria-describedby={detailId}
                      onMouseEnter={() => setHover(item.id)}
                      onMouseLeave={() => setHover(null)}
                      onFocus={() => setHover(item.id)}
                      onBlur={() => setHover(null)}
                      onClick={() => setFilter((f) => (f === item.id ? null : item.id))}
                      className={`chip cursor-pointer whitespace-normal text-left !py-1.5 text-[13px] transition-colors hover:border-flow ${active ? '!border-text !bg-text !text-bg' : ''}`}
                    >
                      {item.name}
                      <span className={`font-mono text-[11px] ${active ? '' : 'text-muted'}`} aria-hidden="true">
                        {count}
                      </span>
                    </button>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </div>

      <div id={detailId} aria-live="polite" className="mt-4 min-h-[3.5rem] text-[15px]">
        {shown ? (
          <p>
            <span className="font-semibold">{shown.name}</span>
            <span className="text-muted">
              {' '}
              · used in {shown.projects.length} project{shown.projects.length === 1 ? '' : 's'}
              {shown.projects.length ? ': ' : ''}
            </span>
            {shown.projects.map((slug, i) => (
              <span key={slug}>
                {i ? ', ' : ''}
                <a href={projects[slug].href} className="link">
                  {projects[slug].title}
                </a>
              </span>
            ))}
            {shown.roles.length ? <span className="text-muted"> · at work: {shown.roles.join(', ')}</span> : null}
          </p>
        ) : (
          <p className="text-muted">Hover or focus a skill to see where it is used. Click it to filter the projects.</p>
        )}
      </div>

      {filtered ? (
        <div className="no-print fixed inset-x-0 bottom-20 z-50 flex justify-center px-4 xl:bottom-14">
          <p className="inline-flex items-center gap-3 rounded-full border border-flow bg-surface px-4 py-2 text-[14px] shadow-lg">
            <span>
              <span className="t-label mr-2 text-[11px] text-muted">Filter</span>
              {filtered.name} · {filtered.projects.length} project{filtered.projects.length === 1 ? '' : 's'}
            </span>
            <a href="#projects" className="link">
              View
            </a>
            <button type="button" onClick={() => setFilter(null)} className="inline-flex h-7 w-7 items-center justify-center rounded-full hover:bg-surface-2" aria-label="Clear filter">
              <X aria-hidden="true" size={15} strokeWidth={1.5} />
            </button>
          </p>
        </div>
      ) : null}
    </>
  )
}
