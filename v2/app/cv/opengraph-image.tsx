import { OG_SIZE, renderOg } from '@/lib/og'
import { profile } from '@/lib/content'

export const alt = 'Kaushil Nagrale, 30 second CV'
export const size = OG_SIZE
export const contentType = 'image/png'

export default function Image() {
  return renderOg({ kicker: '30 second CV', line: profile.oneLine })
}
