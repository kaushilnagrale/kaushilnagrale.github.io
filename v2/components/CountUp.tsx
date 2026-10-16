'use client'

import { useEffect, useRef } from 'react'

const NUMERIC = /^(\d+(?:\.\d+)?)(.*)$/

/**
 * D-06 · Numbers count up once. The server renders the final value (no JS, no flicker for readouts
 * already on screen); readouts below the fold reset and count up the first time they scroll into view.
 */
export function CountUp({ value, className }: { value: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const el = ref.current
    const m = value.match(NUMERIC)
    if (!el || !m || Number(m[1]) === 0) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const rect = el.getBoundingClientRect()
    if (rect.top < window.innerHeight && rect.bottom > 0) return

    const target = Number(m[1])
    const decimals = m[1].includes('.') ? m[1].split('.')[1].length : 0
    const suffix = m[2]
    const render = (n: number) => (el.textContent = n.toFixed(decimals) + suffix)
    render(0)

    let raf = 0
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return
      observer.disconnect()
      const start = performance.now()
      const tick = (now: number) => {
        const t = Math.min(1, (now - start) / 900)
        render(target * (1 - Math.pow(1 - t, 3)))
        if (t < 1) raf = requestAnimationFrame(tick)
      }
      raf = requestAnimationFrame(tick)
    })
    observer.observe(el)
    return () => {
      observer.disconnect()
      cancelAnimationFrame(raf)
      el.textContent = value
    }
  }, [value])

  return (
    <span ref={ref} className={className}>
      {value}
    </span>
  )
}
