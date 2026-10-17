'use client'

import { useEffect, useRef, useState } from 'react'
import type { SectionMeta } from '@/lib/sections'
import { ROAD_WIDTH, raceProgress, roadPath, roadSlope, roadX } from '@/lib/race'
import { TopDownCar } from './TopDownCar'

const CENTRE = roadPath()
const EDGE_L = roadPath(-8)
const EDGE_R = roadPath(8)
const CAR_W = 20
const CAR_H = 38

/**
 * Left rail on wide screens: the section list is a winding road and a car drives down it as you scroll,
 * steering through the bends and reaching each section's checkpoint as that section arrives on screen.
 * The links are plain anchors, so the rail still navigates with JavaScript off (the car just waits at the start).
 */
export function TimingTowerNav({ sections }: { sections: SectionMeta[] }) {
  const ids = sections.map((s) => s.id)
  const [active, setActive] = useState(0)
  const lane = useRef<HTMLDivElement>(null)
  const car = useRef<HTMLDivElement>(null)
  const trail = useRef<SVGRectElement>(null)
  const wind = useRef<HTMLDivElement>(null)
  const n = sections.length

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let target = 0
    let current = 0
    let raf = 0

    const place = (p: number, speed: number) => {
      const h = lane.current?.clientHeight ?? 0
      const x = roadX(p)
      const y = p * h
      const heading = -(Math.atan2(roadSlope(p), Math.max(h, 1)) * 180) / Math.PI
      if (car.current) car.current.style.transform = `translate(${x - CAR_W / 2}px, ${y - CAR_H / 2}px) rotate(${heading}deg)`
      if (trail.current) trail.current.setAttribute('height', String(p * 1000))
      if (wind.current) wind.current.style.opacity = reduce ? '0' : String(Math.min(1, speed * 60))
    }

    const tick = () => {
      const prev = current
      current = reduce ? target : current + (target - current) * 0.16
      if (Math.abs(target - current) < 0.0005) current = target
      place(current, Math.abs(current - prev))
      raf = current !== target ? requestAnimationFrame(tick) : 0
      if (!raf) place(current, 0)
    }

    const onScroll = () => {
      const { p, index } = raceProgress(ids)
      target = p
      setActive(index)
      if (!raf) raf = requestAnimationFrame(tick)
    }

    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ids.join()])

  return (
    <nav aria-label="Sections" className="fixed inset-y-0 left-0 z-40 hidden w-[148px] flex-col border-r border-line bg-bg/95 backdrop-blur xl:flex">
      <a href="#home" className="block px-5 pb-3 pt-6 font-heavy text-[15px] font-extrabold tracking-tight">
        <span className="sr-only">Kaushil Nagrale, back to top</span>
        <span aria-hidden="true">KN</span>
      </a>

      <div className="relative mb-12 ml-2 mt-8 flex-1">
        <div ref={lane} className="absolute inset-y-0 left-0" style={{ width: ROAD_WIDTH }} aria-hidden="true">
          <svg viewBox={`0 0 ${ROAD_WIDTH} 1000`} preserveAspectRatio="none" className="absolute inset-0 h-full w-full overflow-visible">
            <defs>
              <clipPath id="road-trail">
                <rect ref={trail} x="-10" y="0" width={ROAD_WIDTH + 20} height="0" />
              </clipPath>
            </defs>
            <path d={EDGE_L} fill="none" stroke="var(--line)" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
            <path d={EDGE_R} fill="none" stroke="var(--line)" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
            <path d={CENTRE} fill="none" stroke="var(--muted)" strokeOpacity="0.45" strokeWidth="1" strokeDasharray="4 6" vectorEffect="non-scaling-stroke" />
            <path d={CENTRE} fill="none" stroke="var(--flow)" strokeWidth="2.5" vectorEffect="non-scaling-stroke" clipPath="url(#road-trail)" className="drop-shadow-[0_0_4px_var(--flow)]" />
          </svg>

          {/* Checkered finish */}
          <span
            className="absolute bottom-[-14px] h-2 w-6 bg-[conic-gradient(var(--text)_25%,transparent_0_50%,var(--text)_0_75%,transparent_0)] bg-[length:6px_6px]"
            style={{ left: roadX(1) - 12 }}
          />

          {/* The car: transformed every frame while it moves; no React re-render per frame */}
          <div ref={car} className="absolute left-0 top-0 will-change-transform" style={{ width: CAR_W, height: CAR_H, transform: `translate(${roadX(0) - CAR_W / 2}px, ${-CAR_H / 2}px)` }}>
            <div ref={wind} className="absolute -top-5 left-1/2 flex -translate-x-1/2 gap-[3px] opacity-0 transition-opacity duration-150">
              <span className="h-4 w-px bg-flow/70" />
              <span className="mt-1 h-3 w-px bg-flow/50" />
              <span className="h-4 w-px bg-flow/70" />
            </div>
            <span className="absolute left-1/2 top-[34px] h-8 w-5 -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_top,color-mix(in_srgb,var(--flow)_45%,transparent),transparent_70%)]" />
            <TopDownCar className="relative h-full w-full drop-shadow-[0_2px_6px_rgb(0_0_0/0.4)]" />
          </div>
        </div>

        <ol className="absolute inset-0">
          {sections.map((s, i) => {
            const t = i / (n - 1)
            const isActive = active === i
            const passed = i <= active
            return (
              <li key={s.id} className="absolute left-0 right-0 -translate-y-1/2" style={{ top: `${t * 100}%` }}>
                <span
                  aria-hidden="true"
                  className={`absolute top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 transition-colors ${
                    passed ? 'border-flow bg-flow' : 'border-line bg-bg'
                  }`}
                  style={{ left: roadX(t) }}
                />
                <a
                  href={`#${s.id}`}
                  aria-current={isActive ? 'location' : undefined}
                  className={`relative ml-[50px] flex h-9 items-center gap-2 rounded-l-lg pl-2 text-[14px] font-medium transition-colors hover:bg-surface-2 ${
                    isActive ? 'text-s-purple' : 'text-text'
                  }`}
                >
                  <span aria-hidden="true" className="font-mono text-[10px] text-muted tabular-nums">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  {s.label}
                </a>
              </li>
            )
          })}
        </ol>
      </div>
    </nav>
  )
}
