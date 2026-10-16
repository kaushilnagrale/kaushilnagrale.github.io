import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { lenses, type Lens } from './content'

// Decision 3 (domain) is still open, so the canonical origin comes from the environment.
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : 'http://localhost:3000')

export const BUILD_SHA = process.env.NEXT_PUBLIC_BUILD_SHA ?? 'local'
export const BUILD_TIME = process.env.NEXT_PUBLIC_BUILD_TIME ?? '2026-10-15T00:00:00.000Z'

/** Tailored PDFs (R-06) fall back to the general resume until they exist in /public/resume. */
export function resumeFor(lens: Lens): string {
  const path = lenses[lens].resume
  return existsSync(join(process.cwd(), 'public', path)) ? path : lenses.all.resume
}

/** Each lens is its own prerendered page (GitHub Pages cannot rewrite `?lens=`). */
export function lensHref(lens: Lens): string {
  return lens === 'all' ? '/' : `/lens/${lens}/`
}
