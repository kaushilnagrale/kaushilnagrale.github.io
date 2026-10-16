import { renderOg } from '@/lib/og'
import { profile } from '@/lib/content'

export const dynamic = 'force-static'

export function GET() {
  return renderOg({ kicker: '30 second CV', line: profile.oneLine })
}
