import Link from 'next/link'
import { LENSES, lenses, type Lens } from '@/lib/content'
import { lensHref } from '@/lib/site'

/** R-01 · Role lenses. Plain links, so a lens URL can be shared and works without JavaScript. */
export function LensSwitch({ lens }: { lens: Lens }) {
  return (
    <nav aria-label="Role lens" className="mt-8">
      <p className="t-label mb-2 text-muted" id="lens-label">
        Lens
      </p>
      <ul className="inline-flex flex-wrap gap-1 rounded-full border border-line bg-surface p-1" aria-labelledby="lens-label">
        {LENSES.map((l) => {
          const active = l === lens
          return (
            <li key={l}>
              <Link
                href={lensHref(l)}
                scroll={false}
                prefetch={false}
                aria-current={active ? 'page' : undefined}
                className={`inline-flex h-9 items-center rounded-full px-3.5 text-[14px] font-semibold transition-colors ${
                  active ? 'bg-text text-bg' : 'text-muted hover:text-text'
                }`}
              >
                {lenses[l].label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
