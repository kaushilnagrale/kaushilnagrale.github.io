import { renderOg } from '@/lib/og'
import { profile } from '@/lib/content'

// Written to out/og/home.png at build time; a real .png path so static hosts send an image content type.
export const dynamic = 'force-static'

export function GET() {
  return renderOg({ kicker: profile.kicker, line: profile.oneLine })
}
