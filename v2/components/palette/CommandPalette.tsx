'use client'

import { lazy, Suspense, useEffect, useState, useSyncExternalStore } from 'react'

export interface PaletteData {
  sections: { id: string; code: string; name: string; plain: string }[]
  projects: { title: string; href: string; tier: 'bay' | 'grid' }[]
  lenses: { label: string; href: string }[]
  email: string
  resume: string
}

const loadDialog = () => import('./CommandDialog')
const CommandDialog = lazy(loadDialog)

/** F-10 · ⌘K / Ctrl+K. cmdk loads only when the palette is first opened. */
export function CommandPalette({ data }: { data: PaletteData }) {
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const mac = useSyncExternalStore(
    () => () => {},
    () => /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent),
    () => true,
  )

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setMounted(true)
        setOpen((o) => !o)
      }
    }
    const onOpen = () => {
      setMounted(true)
      setOpen(true)
    }
    window.addEventListener('keydown', onKey)
    window.addEventListener('palette:open', onOpen)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('palette:open', onOpen)
    }
  }, [])

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setMounted(true)
          setOpen(true)
        }}
        onPointerEnter={() => void loadDialog()}
        onFocus={() => void loadDialog()}
        aria-keyshortcuts="Meta+K Control+K"
        className="hidden h-10 items-center gap-1 rounded-full border border-line bg-surface px-3 font-mono text-[12px] font-medium tracking-[0.08em] hover:border-muted md:inline-flex"
      >
        {mac ? '⌘K' : 'Ctrl K'}
        <span className="sr-only"> Command palette</span>
      </button>
      {mounted ? (
        <Suspense fallback={null}>
          <CommandDialog open={open} onOpenChange={setOpen} data={data} />
        </Suspense>
      ) : null}
    </>
  )
}
