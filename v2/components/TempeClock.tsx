'use client'

import { useEffect, useState } from 'react'

/** Local time in Tempe (America/Phoenix has no daylight saving, so it is always MST). */
export function TempeClock({ timeZone }: { timeZone: string }) {
  const [now, setNow] = useState<string | null>(null)

  useEffect(() => {
    const fmt = new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', timeZone })
    const tick = () => setNow(fmt.format(new Date()))
    tick()
    const id = setInterval(tick, 30_000)
    return () => clearInterval(id)
  }, [timeZone])

  return (
    <span>
      Tempe <time className="inline-block min-w-[7ch] text-text tabular-nums">{now ?? '--:--'}</time> MST
    </span>
  )
}
