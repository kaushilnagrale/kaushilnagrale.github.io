import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = { title: 'Off the track' }

/** Phase 1 404. The penalty shootout (S-15, F-05) arrives in phase 4. */
export default function NotFound() {
  return (
    <main id="main" className="blueprint flex min-h-svh items-center py-16">
      <div className="wrap">
        <p className="t-label text-muted">404 · Off the track</p>
        <h1 className="t-h2 mt-3">Into the gravel.</h1>
        <p className="mt-4 max-w-xl text-[18px] text-muted">That page does not exist. The homepage is this way.</p>
        <svg viewBox="0 0 600 120" className="mt-8 w-full max-w-xl text-text" aria-hidden="true">
          <path d="M0 90 C 120 90, 200 30, 330 30 L 600 30" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <path d="M0 110 C 140 110, 220 50, 340 50 L 600 50" fill="none" stroke="currentColor" strokeWidth="1.5" />
          {Array.from({ length: 60 }, (_, i) => (
            <circle key={i} cx={360 + ((i * 37) % 230)} cy={70 + ((i * 17) % 44)} r={1.6} fill="var(--muted)" />
          ))}
          <path d="M250 42 C 290 50, 330 62, 380 86" fill="none" stroke="var(--flow)" strokeWidth="1.5" strokeDasharray="4 6" />
        </svg>
        <Link href="/" className="btn btn-primary mt-8">
          Back to the homepage
        </Link>
      </div>
    </main>
  )
}
