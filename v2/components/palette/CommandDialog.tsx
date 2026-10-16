'use client'

import { Command } from 'cmdk'
import { useTheme } from 'next-themes'
import { useState } from 'react'
import { toast } from '@/components/Toaster'
import type { PaletteData } from './CommandPalette'

const item =
  'flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-[15px] data-[selected=true]:bg-surface-2 data-[selected=true]:text-text'
const group =
  'px-2 pb-2 [&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:pb-1.5 [&_[cmdk-group-heading]]:pt-3 [&_[cmdk-group-heading]]:font-mono [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-[0.08em] [&_[cmdk-group-heading]]:text-muted'

export default function CommandDialog({
  open,
  onOpenChange,
  data,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  data: PaletteData
}) {
  const [search, setSearch] = useState('')
  const { resolvedTheme, setTheme } = useTheme()

  const close = () => {
    onOpenChange(false)
    setSearch('')
  }

  // Close first, then act, so focus lands on the destination rather than the trigger.
  const run = (fn: () => void) => {
    close()
    setTimeout(fn, 60)
  }

  const jump = (href: string) =>
    run(() => {
      if (href.startsWith('#')) window.location.hash = href.slice(1)
      else window.location.href = href
    })

  const openRadio = () =>
    run(() => {
      window.location.hash = 'radio'
      window.dispatchEvent(new Event('radio:open'))
    })

  // "box box" is the radio call to pit.
  const onSearch = (value: string) => {
    setSearch(value)
    if (value.trim().toLowerCase().replace(/\s+/g, ' ') === 'box box') openRadio()
  }

  return (
    <Command.Dialog
      open={open}
      onOpenChange={(o) => (o ? onOpenChange(true) : close())}
      label="Command palette"
      overlayClassName="fixed inset-0 z-[70] bg-black/50 backdrop-blur-[2px]"
      contentClassName="fixed left-1/2 top-[12vh] z-[71] w-[min(640px,calc(100vw-32px))] -translate-x-1/2 overflow-hidden rounded-2xl border border-line bg-surface text-text shadow-2xl"
    >
      <div className="flex items-center gap-3 border-b border-line px-4">
        <span className="t-label text-muted" aria-hidden="true">
          CMD
        </span>
        <Command.Input
          value={search}
          onValueChange={onSearch}
          placeholder="Jump to a section or project, or run a command"
          className="h-14 w-full bg-transparent text-[16px] outline-none placeholder:text-muted"
        />
      </div>
      <Command.List className="max-h-[min(60vh,480px)] overflow-y-auto overscroll-contain py-2">
        <Command.Empty className="px-5 py-6 text-muted">No match. Try “resume”, “kafka” or “box box”.</Command.Empty>

        <Command.Group heading="Actions" className={group}>
          <Command.Item
            className={item}
            keywords={['email', 'contact', 'mail']}
            onSelect={() =>
              run(() => {
                navigator.clipboard?.writeText(data.email).then(
                  () => toast(`Copied ${data.email}`),
                  () => toast(data.email),
                )
              })
            }
          >
            Copy email
          </Command.Item>
          <Command.Item className={item} keywords={['cv', 'pdf']} onSelect={() => jump(data.resume)}>
            Download resume
          </Command.Item>
          <Command.Item className={item} keywords={['cv', 'summary', 'quick lap']} onSelect={() => jump('/cv')}>
            30 second CV
          </Command.Item>
          <Command.Item
            className={item}
            keywords={['dark', 'light', 'night', 'day', 'theme']}
            onSelect={() => run(() => setTheme(resolvedTheme === 'light' ? 'dark' : 'light'))}
          >
            Switch to {resolvedTheme === 'light' ? 'Night' : 'Day'} theme
          </Command.Item>
          <Command.Item className={item} keywords={['contact', 'message', 'radio', 'box box', 'hire']} onSelect={openRadio}>
            Open team radio
          </Command.Item>
          {data.lenses.map((l) => (
            <Command.Item key={l.href} className={item} keywords={['lens', 'role', 'view']} onSelect={() => jump(l.href)}>
              Lens: {l.label}
            </Command.Item>
          ))}
        </Command.Group>

        <Command.Group heading="Sections" className={group}>
          {data.sections.map((s) => (
            <Command.Item key={s.id} className={item} value={`${s.code} ${s.name} ${s.plain}`} onSelect={() => jump(`#${s.id}`)}>
              <span className="w-10 font-mono text-[12px] tracking-[0.08em] text-muted">{s.code}</span>
              {s.name}
              <span className="text-muted">· {s.plain}</span>
            </Command.Item>
          ))}
        </Command.Group>

        <Command.Group heading="Projects" className={group}>
          {data.projects.map((p) => (
            <Command.Item key={p.href} className={item} onSelect={() => jump(p.href)}>
              <span className="w-10 font-mono text-[12px] tracking-[0.08em] text-muted">{p.tier === 'bay' ? 'BAY' : 'GRD'}</span>
              {p.title}
            </Command.Item>
          ))}
        </Command.Group>
      </Command.List>
    </Command.Dialog>
  )
}
