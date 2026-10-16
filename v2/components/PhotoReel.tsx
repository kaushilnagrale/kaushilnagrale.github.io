'use client'

import Image from 'next/image'
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react'
import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from 'react'

export interface Photo {
  src: string
  alt: string
  place: string | null
  year: number | null
  caption: string | null
}

const AUTOPLAY_MS = 5000

/**
 * Photos slide horizontally: swipe or scroll on touch, arrows and dots everywhere, arrow keys when focused.
 * It advances on its own every few seconds, pauses on hover, focus or the pause button, and never auto-advances
 * under reduced motion. `placeholders` shows empty slots (development only) so the layout can be seen before photos exist.
 */
export function PhotoReel({ photos, placeholders = 0 }: { photos: Photo[]; placeholders?: number }) {
  const track = useRef<HTMLDivElement>(null)
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const [hovering, setHovering] = useState(false)
  const total = photos.length + placeholders

  const goTo = useCallback(
    (i: number) => {
      const el = track.current
      if (!el || !total) return
      const next = (i + total) % total
      const slide = el.children[next] as HTMLElement | undefined
      if (!slide) return
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      el.scrollTo({ left: slide.offsetLeft - (el.clientWidth - slide.clientWidth) / 2, behavior: reduce ? 'auto' : 'smooth' })
    },
    [total],
  )

  // Keep the dots in step with swipes and scrolls.
  useEffect(() => {
    const el = track.current
    if (!el) return
    const onScroll = () => {
      const centre = el.scrollLeft + el.clientWidth / 2
      let best = 0
      let dist = Infinity
      Array.from(el.children).forEach((c, i) => {
        const s = c as HTMLElement
        const d = Math.abs(s.offsetLeft + s.clientWidth / 2 - centre)
        if (d < dist) {
          dist = d
          best = i
        }
      })
      setIndex(best)
    }
    el.addEventListener('scroll', onScroll, { passive: true })
    return () => el.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (paused || hovering || total < 2) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const id = setInterval(() => goTo(index + 1), AUTOPLAY_MS)
    return () => clearInterval(id)
  }, [paused, hovering, total, index, goTo])

  if (!total) return null

  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowRight') goTo(index + 1)
    else if (e.key === 'ArrowLeft') goTo(index - 1)
    else return
    e.preventDefault()
  }

  const control = 'inline-flex h-10 w-10 items-center justify-center rounded-full border border-line bg-surface hover:border-muted'

  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-label="Photos"
      onKeyDown={onKey}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      onFocus={() => setHovering(true)}
      onBlur={() => setHovering(false)}
    >
      <div
        ref={track}
        className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain scroll-smooth px-4 pb-2 [scrollbar-width:none] md:mx-0 md:px-0 [&::-webkit-scrollbar]:hidden"
      >
        {photos.map((p, i) => (
          <figure
            key={p.src}
            role="group"
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${total}`}
            className={`m-0 w-[86%] flex-none snap-center transition-opacity duration-500 md:w-[64%] ${i === index ? 'opacity-100' : 'opacity-50'}`}
          >
            <div className="relative aspect-[3/2] overflow-hidden rounded-2xl border border-line bg-surface-2">
              <Image src={p.src} alt={p.alt} fill sizes="(min-width: 768px) 64vw, 86vw" className="object-cover" />
            </div>
            {p.place || p.year || p.caption ? (
              <figcaption className="mt-3 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                {p.place || p.year ? <span className="t-label text-[11px] text-muted">{[p.place, p.year].filter(Boolean).join(' · ')}</span> : null}
                {p.caption ? <span className="text-[15px]">{p.caption}</span> : null}
              </figcaption>
            ) : null}
          </figure>
        ))}
        {Array.from({ length: placeholders }, (_, k) => {
          const i = photos.length + k
          return (
            <div
              key={`slot-${i}`}
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 1} of ${total}, empty`}
              className={`flex aspect-[3/2] w-[86%] flex-none snap-center items-center justify-center rounded-2xl border border-dashed border-line bg-surface-2 transition-opacity duration-500 md:w-[64%] ${
                i === index ? 'opacity-100' : 'opacity-50'
              }`}
            >
              <p className="px-6 text-center font-mono text-[12px] uppercase tracking-[0.08em] text-muted">
                Photo {i + 1} · add it to content/profile.json
                <span className="mt-1 block normal-case tracking-normal">Empty slots show in development only</span>
              </p>
            </div>
          )
        })}
      </div>

      {total > 1 ? (
        <div className="mt-5 flex items-center gap-3">
          <button type="button" onClick={() => goTo(index - 1)} className={control} aria-label="Previous photo">
            <ChevronLeft aria-hidden="true" size={18} strokeWidth={1.5} />
          </button>
          <button type="button" onClick={() => goTo(index + 1)} className={control} aria-label="Next photo">
            <ChevronRight aria-hidden="true" size={18} strokeWidth={1.5} />
          </button>
          <ol className="flex items-center gap-1.5" aria-label="Choose a photo">
            {Array.from({ length: total }, (_, i) => (
              <li key={i}>
                <button
                  type="button"
                  onClick={() => goTo(i)}
                  aria-label={`Show photo ${i + 1}`}
                  aria-current={i === index ? 'true' : undefined}
                  className="flex h-6 items-center px-0.5"
                >
                  <span className={`block h-1.5 rounded-full transition-all duration-300 ${i === index ? 'w-6 bg-text' : 'w-1.5 bg-line'}`} />
                </button>
              </li>
            ))}
          </ol>
          <button type="button" onClick={() => setPaused((p) => !p)} aria-pressed={paused} className={`${control} ml-auto w-auto gap-1.5 px-3 text-[13px]`}>
            {paused ? <Play aria-hidden="true" size={14} strokeWidth={1.5} /> : <Pause aria-hidden="true" size={14} strokeWidth={1.5} />}
            {paused ? 'Play' : 'Pause'}
          </button>
        </div>
      ) : null}
    </div>
  )
}
