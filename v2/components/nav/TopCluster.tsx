import { Download } from 'lucide-react'
import { CommandPalette, type PaletteData } from '@/components/palette/CommandPalette'
import { ThemeSwitch } from './ThemeSwitch'

/** S-01 · Top-right cluster: theme, command palette, 30s CV and resume. Sound arrives with F-14. */
export function TopCluster({ resume, palette }: { resume: string; palette: PaletteData }) {
  return (
    <header aria-label="Quick actions" className="no-print fixed right-3 top-3 z-50 flex items-center gap-2 md:right-6 md:top-5">
      <ThemeSwitch />
      <CommandPalette data={palette} />
      <a
        href="/cv"
        className="hidden h-10 items-center rounded-full border border-line bg-surface px-3 font-mono text-[12px] font-medium tracking-[0.08em] hover:border-muted md:inline-flex"
      >
        30S CV
      </a>
      <a
        href={resume}
        download
        className="inline-flex h-10 items-center gap-2 rounded-full border border-text bg-text px-3.5 font-mono text-[12px] font-medium tracking-[0.08em] text-bg hover:opacity-90"
      >
        <Download aria-hidden="true" size={15} strokeWidth={1.5} />
        RESUME
      </a>
    </header>
  )
}
