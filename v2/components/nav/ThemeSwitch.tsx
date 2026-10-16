'use client'

import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'

/** D-01 · Night by default, Day on request. The icon follows the data-theme attribute, so it is right before hydration too. */
export function ThemeSwitch() {
  const { resolvedTheme, setTheme } = useTheme()

  return (
    <button
      type="button"
      onClick={() => setTheme(resolvedTheme === 'light' ? 'dark' : 'light')}
      className="inline-flex h-10 items-center gap-2 rounded-full border border-line bg-surface px-3 font-mono text-[12px] font-medium tracking-[0.08em] hover:border-muted"
      aria-label="Switch between Night and Day themes"
    >
      <span className="theme-night inline-flex items-center gap-2">
        <Moon aria-hidden="true" size={16} strokeWidth={1.5} />
        NIGHT
      </span>
      <span className="theme-day items-center gap-2">
        <Sun aria-hidden="true" size={16} strokeWidth={1.5} />
        DAY
      </span>
    </button>
  )
}
