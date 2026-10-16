import { OG_SIZE, renderOg } from '@/lib/og'
import { profile } from '@/lib/content'

export const alt = 'Kaushil Nagrale, Software Engineer'
export const size = OG_SIZE
export const contentType = 'image/png'

export default function Image() {
  return renderOg({ kicker: profile.kicker, line: profile.oneLine })
}
