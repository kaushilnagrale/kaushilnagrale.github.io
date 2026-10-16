'use client'

import { ArrowUpDown, ExternalLink, LayoutGrid, Search, Table2 } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useInitialSearch } from '@/lib/hooks'
import { GithubIcon } from '@/components/BrandIcons'
import { STATUS_LABEL, StatusBadge } from '@/components/StatusBadge'
import type { Domain, Status } from '@/lib/content'

export interface GridItem {
  slug: string
  title: string
  oneLine: string
  status: Status
  domains: Domain[]
  stack: string[]
  skills: string[]
  live: string | null
  repo: string | null
  year: number | null
  archive: boolean
  pos: number
}

type View = 'grid' | 'sheet'
type SortKey = 'pos' | 'title' | 'domain' | 'year' | 'status'

const STATUS_RANK: Record<Status, number> = { live: 0, waking: 1, video: 2, planned: 3, none: 4 }

export function StartingGrid({ items, lensLabel, lensDomain }: { items: GridItem[]; lensLabel: string; lensDomain: Domain | null }) {
  // Visitor edits win; until then the values come from the URL the page was opened with (?q=, ?view=).
  const initial = new URLSearchParams(useInitialSearch())
  const [viewEdit, setView] = useState<View | null>(null)
  const [qEdit, setQ] = useState<string | null>(null)
  const view: View = viewEdit ?? (initial.get('view') === 'sheet' ? 'sheet' : 'grid')
  const q = qEdit ?? initial.get('q') ?? ''
  const [archive, setArchive] = useState(false)
  const [allDomains, setAllDomains] = useState(false)
  const [sort, setSort] = useState<{ key: SortKey; dir: 1 | -1 }>({ key: 'pos', dir: 1 })

  // Keep ?q= and ?view= in the URL (the lens is already there). Only after an edit, so a deep link
  // is never overwritten by the hydration pass, which still sees the server's empty values.
  useEffect(() => {
    if (qEdit === null && viewEdit === null) return
    const url = new URL(window.location.href)
    if (q) url.searchParams.set('q', q)
    else url.searchParams.delete('q')
    if (view === 'sheet') url.searchParams.set('view', 'sheet')
    else url.searchParams.delete('view')
    if (url.href !== window.location.href) window.history.replaceState(window.history.state, '', url)
  }, [q, view, qEdit, viewEdit])

  const archiveCount = items.filter((i) => i.archive).length

  const visible = useMemo(() => {
    const needle = q.trim().toLowerCase()
    return items.filter((i) => {
      if (i.archive && !archive) return false
      if (view === 'sheet' && lensDomain && !allDomains && !i.domains.includes(lensDomain)) return false
      if (!needle) return true
      return [i.title, i.oneLine, i.stack.join(' '), i.domains.join(' '), String(i.year ?? '')].join(' ').toLowerCase().includes(needle)
    })
  }, [items, q, archive, view, lensDomain, allDomains])

  const sorted = useMemo(() => {
    if (view !== 'sheet') return visible
    const val = (i: GridItem): string | number => {
      switch (sort.key) {
        case 'title':
          return i.title.toLowerCase()
        case 'domain':
          return i.domains.join(' ')
        case 'year':
          return i.year ?? 0
        case 'status':
          return STATUS_RANK[i.status]
        default:
          return i.pos
      }
    }
    return [...visible].sort((a, b) => (val(a) < val(b) ? -1 : val(a) > val(b) ? 1 : 0) * sort.dir)
  }, [visible, sort, view])

  const toggleSort = (key: SortKey) => setSort((s) => (s.key === key ? { key, dir: s.dir === 1 ? -1 : 1 } : { key, dir: 1 }))

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-end gap-3">
        <div className="min-w-[220px] flex-1">
          <label htmlFor="grid-search" className="t-label mb-2 block text-muted">
            Search projects
          </label>
          <div className="relative">
            <Search aria-hidden="true" size={16} strokeWidth={1.5} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
            <input
              id="grid-search"
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Name, stack or year"
              className="h-11 w-full rounded-full border border-line bg-surface pl-10 pr-4 text-[16px] outline-none placeholder:text-muted focus:border-flow"
            />
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <div role="group" aria-label="View" className="inline-flex rounded-full border border-line bg-surface p-1">
            <button
              type="button"
              aria-pressed={view === 'grid'}
              onClick={() => setView('grid')}
              className={`inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-[14px] font-semibold ${view === 'grid' ? 'bg-text text-bg' : 'text-muted hover:text-text'}`}
            >
              <LayoutGrid aria-hidden="true" size={15} strokeWidth={1.5} /> Grid
            </button>
            <button
              type="button"
              aria-pressed={view === 'sheet'}
              onClick={() => setView('sheet')}
              className={`inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-[14px] font-semibold ${view === 'sheet' ? 'bg-text text-bg' : 'text-muted hover:text-text'}`}
            >
              <Table2 aria-hidden="true" size={15} strokeWidth={1.5} /> Timing sheet
            </button>
          </div>
          {archiveCount ? (
            <button
              type="button"
              aria-pressed={archive}
              onClick={() => setArchive((a) => !a)}
              className={`inline-flex h-11 items-center rounded-full border px-4 text-[14px] font-semibold ${archive ? 'border-text' : 'border-line text-muted hover:text-text'}`}
            >
              Archive ({archiveCount})
            </button>
          ) : null}
        </div>
      </div>

      <p className="sr-only" role="status" aria-live="polite">
        {sorted.length} projects shown
      </p>

      {view === 'sheet' && lensDomain ? (
        <p className="mb-4 text-[14px] text-muted">
          {allDomains ? 'Showing every domain.' : `Filtered to the ${lensLabel} lens.`}{' '}
          <button type="button" className="link" onClick={() => setAllDomains((a) => !a)}>
            {allDomains ? `Back to ${lensLabel}` : 'Show all'}
          </button>
        </p>
      ) : null}

      {sorted.length === 0 ? <p className="py-10 text-muted">No projects match “{q}”.</p> : null}

      {view === 'grid' ? (
        <ol className="grid grid-cols-1 gap-x-10 gap-y-8 pb-0 md:grid-cols-2 md:pb-16">
          {sorted.map((item, i) => (
            <li
              key={item.slug}
              id={`grid-${item.slug}`}
              data-skills={item.skills.join(' ')}
              className={`reveal relative scroll-mt-6 rounded-2xl pt-7 ${i % 2 === 1 ? 'md:translate-y-16' : ''}`}
            >
              <span
                aria-hidden="true"
                className="absolute inset-x-0 top-0 h-5 rounded-t-sm border-[3px] border-b-0 border-text/80"
              />
              <div className="px-1">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="t-metric text-[34px]">P{i + 1}</span>
                  <span className="font-mono text-[13px] text-muted">{item.year ?? '—'}</span>
                  {item.archive ? <span className="t-label text-[11px] text-muted">Archive</span> : null}
                  <span className="ml-auto">
                    <StatusBadge status={item.status} />
                  </span>
                </div>
                <h3 className="mt-2 text-[20px] font-bold leading-snug">{item.title}</h3>
                <p className="mt-1.5 text-[15px] leading-relaxed text-muted">{item.oneLine}</p>
                {item.stack.length ? (
                  <ul className="mt-3 flex flex-wrap gap-1.5" aria-label="Stack">
                    {item.stack.map((s) => (
                      <li key={s} className="chip">
                        {s}
                      </li>
                    ))}
                  </ul>
                ) : null}
                <ItemLinks item={item} className="mt-3" />
              </div>
            </li>
          ))}
        </ol>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-line">
          <table className="w-full min-w-[760px] border-collapse text-left text-[15px]">
            <caption className="sr-only">Timing sheet: every other project. Column headers sort the table.</caption>
            <thead className="bg-surface-2">
              <tr>
                {(
                  [
                    ['pos', 'Pos'],
                    ['title', 'Project'],
                    ['domain', 'Domain'],
                    ['year', 'Year'],
                  ] as const
                ).map(([key, label]) => (
                  <SortHeader key={key} label={label} active={sort.key === key} dir={sort.dir} onClick={() => toggleSort(key)} />
                ))}
                <th scope="col" className="t-label px-3 py-3 text-[11px] font-medium text-muted">
                  Stack
                </th>
                <SortHeader label="Status" active={sort.key === 'status'} dir={sort.dir} onClick={() => toggleSort('status')} />
                <th scope="col" className="t-label px-3 py-3 text-[11px] font-medium text-muted">
                  Links
                </th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((item) => (
                <tr key={item.slug} data-skills={item.skills.join(' ')} className="border-t border-line align-top">
                  <td className="t-metric px-3 py-3 text-[22px]">{item.pos}</td>
                  <th scope="row" className="px-3 py-3 text-left font-semibold">
                    {item.title}
                    <span className="mt-0.5 block text-[13px] font-normal leading-snug text-muted">{item.oneLine}</span>
                  </th>
                  <td className="px-3 py-3 font-mono text-[13px]">{item.domains.join(' · ')}</td>
                  <td className="px-3 py-3 font-mono text-[13px]">{item.year ?? '—'}</td>
                  <td className="px-3 py-3 text-[13px] text-muted">{item.stack.join(', ') || '—'}</td>
                  <td className="whitespace-nowrap px-3 py-3 text-[13px]">
                    <span className="inline-flex items-center gap-2">
                      <span className="dot" data-status={item.status} aria-hidden="true" />
                      {STATUS_LABEL[item.status]}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    <ItemLinks item={item} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function SortHeader({ label, active, dir, onClick }: { label: string; active: boolean; dir: 1 | -1; onClick: () => void }) {
  return (
    <th scope="col" aria-sort={active ? (dir === 1 ? 'ascending' : 'descending') : 'none'} className="px-1 py-1.5">
      <button type="button" onClick={onClick} className={`t-label inline-flex items-center gap-1.5 rounded-md px-2 py-1.5 text-[11px] hover:bg-surface ${active ? 'text-text' : 'text-muted'}`}>
        {label}
        <ArrowUpDown aria-hidden="true" size={13} strokeWidth={1.5} />
      </button>
    </th>
  )
}

function ItemLinks({ item, className = '' }: { item: GridItem; className?: string }) {
  if (!item.live && !item.repo) return <span className={`block text-[13px] text-muted ${className}`}>Details on request</span>
  return (
    <span className={`flex flex-wrap gap-x-4 gap-y-1 text-[14px] ${className}`}>
      {item.live ? (
        <a href={item.live} target="_blank" rel="noopener noreferrer" className="link inline-flex items-center gap-1.5">
          <ExternalLink aria-hidden="true" size={14} strokeWidth={1.5} /> Live<span className="sr-only">: {item.title}</span>
        </a>
      ) : null}
      {item.repo ? (
        <a href={item.repo} target="_blank" rel="noopener noreferrer" className="link inline-flex items-center gap-1.5">
          <GithubIcon size={14} /> Repo<span className="sr-only">: {item.title}</span>
        </a>
      ) : null}
    </span>
  )
}
