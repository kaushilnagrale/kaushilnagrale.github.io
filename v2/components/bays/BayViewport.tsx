'use client'

import Image from 'next/image'
import { Activity, ExternalLink, Pause, Play, Square } from 'lucide-react'
import { useCallback, useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from 'react'
import type { Architecture, Bay, Status } from '@/lib/content'
import { ArchDiagram } from './ArchDiagram'
import { Poster, type PosterData } from './Poster'

type Mode = 'live' | 'xray' | 'telemetry'
type Phase = 'idle' | 'checking' | 'warming' | 'ready' | 'down' | 'running' | 'playing'

/** Compact bay data: posters and diagrams render here from JSON instead of travelling as serialized SVG trees. */
export interface ViewportBay extends PosterData {
  index: number
  status: Status
  links: { live: string | null; embed: string | null; health: string | null; video: string | null }
  media: Bay['media']
  architecture: Architecture
  telemetry: Bay['telemetry']
}

interface Props {
  slug: string
  title: string
  status: Status
  links: ViewportBay['links']
  poster: ReactNode
  /** Short muted screen recording that plays over the poster like a moving thumbnail. */
  loop: string | null
  ui: ReactNode
  arch: ReactNode
}

const SIZES = '(min-width: 1024px) 760px, 100vw'

/** S-05 · LIVE, X-RAY and (when a dashboard exists) TELEMETRY. No iframe exists until a visitor asks for one. */
export function BayViewport({ bay }: { bay: ViewportBay }) {
  const { media } = bay
  const props: Props = {
    slug: bay.slug,
    title: bay.title,
    status: bay.status,
    links: bay.links,
    poster: media.poster ? <Image src={media.poster} alt="" fill sizes={SIZES} className="object-cover" /> : <Poster bay={bay} index={bay.index} />,
    loop: media.loop ?? null,
    ui: media.xrayUi ? (
      <Image src={media.xrayUi} alt={`${bay.title} app screen`} fill sizes={SIZES} className="object-cover" />
    ) : (
      <Poster bay={bay} index={bay.index} variant="xray" />
    ),
    arch: media.xrayArch ? (
      <Image src={media.xrayArch} alt={`${bay.title} architecture`} fill sizes={SIZES} className="object-contain" />
    ) : (
      <ArchDiagram slug={bay.slug} title={bay.title} arch={bay.architecture} />
    ),
  }
  const { slug, title } = props
  const hasTelemetry = !!(bay.telemetry.embed || bay.telemetry.url)
  const MODES: { id: Mode; label: string }[] = [
    { id: 'live', label: 'Live' },
    { id: 'xray', label: 'X-Ray' },
    ...(hasTelemetry ? [{ id: 'telemetry' as const, label: 'Telemetry' }] : []),
  ]
  const [mode, setMode] = useState<Mode>('live')
  const tabs = useRef<(HTMLButtonElement | null)[]>([])

  const onTabKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const i = MODES.findIndex((m) => m.id === mode)
    let next = i
    if (e.key === 'ArrowRight') next = (i + 1) % MODES.length
    else if (e.key === 'ArrowLeft') next = (i - 1 + MODES.length) % MODES.length
    else if (e.key === 'Home') next = 0
    else if (e.key === 'End') next = MODES.length - 1
    else return
    e.preventDefault()
    setMode(MODES[next].id)
    tabs.current[next]?.focus()
  }

  return (
    <div>
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="t-label text-muted" aria-hidden="true">
          Viewport
        </p>
        <div role="tablist" aria-label={`${title} viewport mode`} onKeyDown={onTabKey} className="inline-flex rounded-full border border-line bg-surface-2 p-1">
          {MODES.map((m, i) => (
            <button
              key={m.id}
              ref={(el) => {
                tabs.current[i] = el
              }}
              role="tab"
              type="button"
              id={`${slug}-tab-${m.id}`}
              aria-controls={`${slug}-panel-${m.id}`}
              aria-selected={mode === m.id}
              tabIndex={mode === m.id ? 0 : -1}
              onClick={() => setMode(m.id)}
              className={`h-8 rounded-full px-3.5 font-mono text-[12px] font-medium uppercase tracking-[0.08em] transition-colors ${
                mode === m.id ? 'bg-text text-bg' : 'text-muted hover:text-text'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      <div className="relative aspect-[16/10] overflow-hidden rounded-xl border border-line bg-surface-2">
        <div role="tabpanel" id={`${slug}-panel-live`} aria-labelledby={`${slug}-tab-live`} hidden={mode !== 'live'} className="absolute inset-0">
          <LivePanel {...props} />
        </div>
        <div role="tabpanel" id={`${slug}-panel-xray`} aria-labelledby={`${slug}-tab-xray`} hidden={mode !== 'xray'} className="absolute inset-0">
          {mode === 'xray' ? <XRay title={title} ui={props.ui} arch={props.arch} /> : null}
        </div>
        {hasTelemetry ? (
          <div role="tabpanel" id={`${slug}-panel-telemetry`} aria-labelledby={`${slug}-tab-telemetry`} hidden={mode !== 'telemetry'} className="absolute inset-0">
            <TelemetryPanel title={title} telemetry={bay.telemetry} />
          </div>
        ) : null}
      </div>
    </div>
  )
}

function LivePanel({ title, status, links, poster, loop }: Props) {
  const [phase, setPhase] = useState<Phase>('idle')
  const [progress, setProgress] = useState(0)
  const root = useRef<HTMLDivElement>(null)
  const runnable = status === 'live' || status === 'waking'

  const ping = useCallback(async () => {
    if (!links.health) {
      setPhase('ready')
      return
    }
    // Launch stays available while the host is checked in the background; a slow answer shows the warm-up bar,
    // and a finished check never interrupts a demo the visitor already opened.
    const settle = (next: Phase) => setPhase((p) => (p === 'running' || p === 'playing' ? p : next))
    if (status === 'waking') setPhase('warming')
    const started = performance.now()
    const slow = setTimeout(() => setPhase((p) => (p === 'idle' ? 'warming' : p)), 1500)
    const tick = setInterval(() => setProgress(Math.min(95, ((performance.now() - started) / 30000) * 100)), 250)
    try {
      // A sleeping host answers once it is awake; no-cors is enough to know it is reachable.
      await fetch(links.health, { mode: 'no-cors', cache: 'no-store', signal: AbortSignal.timeout(45000) })
      setProgress(100)
      settle('ready')
    } catch {
      settle('down')
    } finally {
      clearTimeout(slow)
      clearInterval(tick)
    }
  }, [links.health, status])

  // Health ping fires the first time the bay scrolls into view.
  useEffect(() => {
    if (!runnable || !root.current) return
    const observer = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        observer.disconnect()
        void ping()
      }
    })
    observer.observe(root.current)
    return () => observer.disconnect()
  }, [runnable, ping])

  const launch = () => {
    if (links.embed) setPhase('running')
    else if (links.live) window.open(links.live, '_blank', 'noopener,noreferrer')
  }

  if (phase === 'running' && links.embed) {
    return (
      <div className="absolute inset-0 flex flex-col">
        <div className="flex items-center justify-between gap-2 border-b border-line bg-surface px-3 py-1.5">
          <span className="t-label inline-flex items-center gap-2 text-[11px]">
            <span className="dot" data-status="live" aria-hidden="true" /> Running
          </span>
          <span className="flex items-center gap-1">
            {links.live ? (
              <a href={links.live} target="_blank" rel="noopener noreferrer" className="inline-flex h-8 items-center gap-1.5 rounded-full px-2.5 text-[13px] hover:bg-surface-2">
                <ExternalLink aria-hidden="true" size={14} strokeWidth={1.5} /> New tab
              </a>
            ) : null}
            <button type="button" onClick={() => setPhase('ready')} className="inline-flex h-8 items-center gap-1.5 rounded-full px-2.5 text-[13px] hover:bg-surface-2">
              <Square aria-hidden="true" size={13} strokeWidth={1.5} /> Stop
            </button>
          </span>
        </div>
        <iframe
          src={links.embed}
          title={`${title} live demo`}
          className="w-full flex-1 bg-white"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
          allow="clipboard-write; fullscreen"
          referrerPolicy="strict-origin-when-cross-origin"
        />
      </div>
    )
  }

  if (phase === 'playing' && links.video) {
    const hosted = videoEmbed(links.video)
    return hosted ? (
      <iframe
        src={hosted}
        title={`${title} demo video`}
        allow="autoplay; fullscreen; picture-in-picture"
        allowFullScreen
        className="absolute inset-0 h-full w-full bg-black"
      />
    ) : (
      <video src={links.video} controls autoPlay muted playsInline className="absolute inset-0 h-full w-full bg-black object-contain" />
    )
  }

  return (
    <div ref={root} className="absolute inset-0">
      {poster}
      {loop ? <LoopPreview src={loop} /> : null}
      <div className="absolute inset-x-0 bottom-0 flex flex-wrap items-end justify-between gap-3 bg-gradient-to-t from-bg/90 via-bg/60 to-transparent p-4 pt-12 md:p-5 md:pt-16">
        <Overlay phase={phase} progress={progress} status={status} links={links} onLaunch={launch} onPlay={() => setPhase('playing')} />
      </div>
    </div>
  )
}

function Overlay({
  phase,
  progress,
  status,
  links,
  onLaunch,
  onPlay,
}: {
  phase: Phase
  progress: number
  status: Status
  links: Props['links']
  onLaunch: () => void
  onPlay: () => void
}) {
  const play = links.video ? (
    <button type="button" onClick={onPlay} className="btn btn-outline bg-bg/70 !min-h-10 !py-2">
      <Play aria-hidden="true" size={16} strokeWidth={1.5} /> Play the run
    </button>
  ) : null

  if (status === 'planned' || status === 'none') {
    return (
      <div className="flex flex-wrap items-center gap-3">
        <p className="max-w-md text-[14px] leading-snug" role="status">
          <span className="t-label mr-2 text-[11px] text-muted">In the garage</span>
          Live demo is being set up. {links.video ? 'Watch the recorded run meanwhile.' : 'X-Ray shows the architecture now.'}
        </p>
        {play}
      </div>
    )
  }

  if (status === 'video') {
    return play ?? <p className="text-[14px] text-muted">Recording coming soon.</p>
  }

  if (phase === 'down') {
    return (
      <div className="flex flex-wrap items-center gap-3" role="status">
        <p className="text-[14px]">
          <span className="t-label mr-2 text-[11px] text-s-yellow">Pit stop</span>
          The demo host is not answering.
        </p>
        {links.live ? (
          <a href={links.live} target="_blank" rel="noopener noreferrer" className="btn btn-outline bg-bg/70 !min-h-10 !py-2">
            <ExternalLink aria-hidden="true" size={16} strokeWidth={1.5} /> Try in a new tab
          </a>
        ) : null}
        {play}
      </div>
    )
  }

  if (phase === 'warming' || phase === 'checking') {
    return (
      <div className="w-full max-w-sm" role="status" aria-live="polite">
        <p className="t-label text-[11px] text-s-yellow">{phase === 'warming' ? 'Warming tyres' : 'Checking the garage'}</p>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-line" aria-hidden="true">
          <div className="h-full rounded-full bg-s-yellow transition-[width] duration-250" style={{ width: `${progress}%` }} />
        </div>
        <p className="mt-2 text-[13px] text-muted">Free hosts sleep when idle. This takes up to 30 seconds.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <button type="button" onClick={onLaunch} className="btn btn-primary">
        <Play aria-hidden="true" size={16} strokeWidth={1.5} /> Launch demo
      </button>
      {play}
    </div>
  )
}

function XRay({ title, ui, arch }: { title: string; ui: ReactNode; arch: ReactNode }) {
  const [pos, setPos] = useState(50)
  const [narrow, setNarrow] = useState(false)
  const [showArch, setShowArch] = useState(true)
  const frame = useRef<HTMLDivElement>(null)
  const dragging = useRef(false)

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)')
    const update = () => setNarrow(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])

  const moveTo = (clientX: number) => {
    const r = frame.current?.getBoundingClientRect()
    if (!r) return
    setPos(Math.round(Math.max(0, Math.min(100, ((clientX - r.left) / r.width) * 100))))
  }

  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const step = { ArrowLeft: -5, ArrowDown: -5, ArrowRight: 5, ArrowUp: 5, PageDown: -20, PageUp: 20 }[e.key]
    if (step !== undefined) setPos((p) => Math.max(0, Math.min(100, p + step)))
    else if (e.key === 'Home') setPos(0)
    else if (e.key === 'End') setPos(100)
    else return
    e.preventDefault()
  }

  if (narrow) {
    return (
      <div className="absolute inset-0">
        <div className="absolute inset-0">{showArch ? arch : ui}</div>
        <button
          type="button"
          onClick={() => setShowArch((s) => !s)}
          aria-pressed={showArch}
          className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full border border-line bg-bg/90 px-4 py-2 font-mono text-[12px] uppercase tracking-[0.08em]"
        >
          {showArch ? 'Showing architecture · tap for app' : 'Showing app · tap for architecture'}
        </button>
      </div>
    )
  }

  return (
    <div
      ref={frame}
      className="absolute inset-0 cursor-ew-resize touch-none select-none"
      onPointerDown={(e) => {
        dragging.current = true
        e.currentTarget.setPointerCapture(e.pointerId)
        moveTo(e.clientX)
      }}
      onPointerMove={(e) => dragging.current && moveTo(e.clientX)}
      onPointerUp={() => (dragging.current = false)}
      onPointerCancel={() => (dragging.current = false)}
    >
      <div className="absolute inset-0">{ui}</div>
      <div className="absolute inset-0" style={{ clipPath: `inset(0 0 0 ${pos}%)` }}>
        {arch}
      </div>
      <span className="t-label pointer-events-none absolute left-3 top-3 rounded-full bg-bg/80 px-2.5 py-1 text-[11px]">App</span>
      <span className="t-label pointer-events-none absolute right-3 top-3 rounded-full bg-bg/80 px-2.5 py-1 text-[11px] text-flow">Architecture</span>
      <div
        role="slider"
        tabIndex={0}
        aria-label={`${title}: X-ray handle. Move left to reveal more architecture.`}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={pos}
        aria-valuetext={`${100 - pos}% architecture`}
        onKeyDown={onKey}
        className="absolute inset-y-0 z-10 -ml-5 flex w-10 items-center justify-center focus-visible:outline-none [&:focus-visible>span]:ring-2 [&:focus-visible>span]:ring-flow"
        style={{ left: `${pos}%` }}
      >
        <span aria-hidden="true" className="absolute inset-y-0 left-1/2 w-0.5 -translate-x-1/2 bg-flow" />
        <span aria-hidden="true" className="relative flex h-10 w-10 items-center justify-center rounded-full border-2 border-flow bg-bg font-mono text-[12px] text-flow">
          ⟷
        </span>
      </div>
    </div>
  )
}

/** Live dashboard (Grafana, Prometheus, MLflow…) for the demo's backend. Loads only when asked. */
function TelemetryPanel({ title, telemetry }: { title: string; telemetry: Bay['telemetry'] }) {
  const [on, setOn] = useState(false)
  const provider = telemetry.provider ?? 'dashboard'

  if (on && telemetry.embed) {
    return (
      <div className="absolute inset-0 flex flex-col">
        <div className="flex items-center justify-between gap-2 border-b border-line bg-surface px-3 py-1.5">
          <span className="t-label inline-flex items-center gap-2 text-[11px]">
            <span className="dot" data-status="live" aria-hidden="true" /> {provider}
          </span>
          <span className="flex items-center gap-1">
            {telemetry.url ? (
              <a href={telemetry.url} target="_blank" rel="noopener noreferrer" className="inline-flex h-8 items-center gap-1.5 rounded-full px-2.5 text-[13px] hover:bg-surface-2">
                <ExternalLink aria-hidden="true" size={14} strokeWidth={1.5} /> New tab
              </a>
            ) : null}
            <button type="button" onClick={() => setOn(false)} className="inline-flex h-8 items-center gap-1.5 rounded-full px-2.5 text-[13px] hover:bg-surface-2">
              <Square aria-hidden="true" size={13} strokeWidth={1.5} /> Close
            </button>
          </span>
        </div>
        <iframe
          src={telemetry.embed}
          title={`${title} live telemetry (${provider})`}
          className="w-full flex-1 bg-surface-2"
          sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
          referrerPolicy="strict-origin-when-cross-origin"
        />
      </div>
    )
  }

  return (
    <div className="absolute inset-0 flex flex-col justify-end gap-3 bg-surface-2 p-5">
      <svg viewBox="0 0 400 160" preserveAspectRatio="none" className="absolute inset-x-0 top-6 h-1/2 w-full text-flow" aria-hidden="true">
        <path d="M0 120 L40 110 L80 116 L120 80 L160 92 L200 60 L240 72 L280 40 L320 52 L360 30 L400 36" fill="none" stroke="currentColor" strokeWidth="2" vectorEffect="non-scaling-stroke" />
        <path d="M0 140 L40 136 L80 128 L120 132 L160 118 L200 124 L240 104 L280 112 L320 96 L360 100 L400 88" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 6" opacity="0.6" vectorEffect="non-scaling-stroke" />
      </svg>
      <p className="t-label relative inline-flex items-center gap-2 text-[11px] text-flow">
        <Activity aria-hidden="true" size={14} strokeWidth={1.5} /> Telemetry · {provider}
      </p>
      <p className="relative max-w-md text-[15px]">Live metrics from the running demo: throughput, latency and errors as they happen.</p>
      <div className="relative flex flex-wrap gap-3">
        {telemetry.embed ? (
          <button type="button" onClick={() => setOn(true)} className="btn btn-primary">
            <Activity aria-hidden="true" size={16} strokeWidth={1.5} /> Load dashboard
          </button>
        ) : null}
        {telemetry.url ? (
          <a href={telemetry.url} target="_blank" rel="noopener noreferrer" className="btn btn-outline">
            <ExternalLink aria-hidden="true" size={16} strokeWidth={1.5} /> Open in {provider}
          </a>
        ) : null}
      </div>
    </div>
  )
}

/** YouTube and Vimeo links play through their own players; anything else is treated as a video file. */
function videoEmbed(url: string): string | null {
  const yt = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/)
  if (yt) return `https://www.youtube-nocookie.com/embed/${yt[1]}?autoplay=1&rel=0`
  const vimeo = url.match(/vimeo\.com\/(?:video\/)?(\d+)/)
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}?autoplay=1`
  return null
}

/**
 * Moving thumbnail for the LIVE viewport. The file loads only once the bay is on screen, pauses when it
 * scrolls away, and never loads under reduced motion or Save-Data, where the poster stays.
 * It has a pause control because it loops for longer than five seconds (WCAG 2.2.2).
 */
function LoopPreview({ src }: { src: string }) {
  const video = useRef<HTMLVideoElement>(null)
  const [load, setLoad] = useState(false)
  const [visible, setVisible] = useState(false)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    const el = video.current
    if (!el) return
    const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData
    if (saveData || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setLoad(true)
          if (el.currentSrc && !el.dataset.userPaused) el.play().catch(() => {})
        } else el.pause()
      },
      { threshold: 0.25 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const toggle = () => {
    const el = video.current
    if (!el) return
    if (el.paused) {
      delete el.dataset.userPaused
      el.play().catch(() => {})
      setPaused(false)
    } else {
      el.dataset.userPaused = '1'
      el.pause()
      setPaused(true)
    }
  }

  return (
    <>
      <video
        ref={video}
        src={load ? src : undefined}
        autoPlay={load}
        muted
        loop
        playsInline
        preload="none"
        aria-hidden="true"
        tabIndex={-1}
        onPlaying={() => setVisible(true)}
        className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${visible ? 'opacity-100' : 'opacity-0'}`}
      />
      {visible ? (
        <button
          type="button"
          onClick={toggle}
          aria-pressed={paused}
          className="absolute left-3 top-3 z-10 inline-flex h-8 items-center gap-1.5 rounded-full border border-line bg-bg/80 px-2.5 font-mono text-[11px] uppercase tracking-[0.08em]"
        >
          {paused ? <Play aria-hidden="true" size={12} strokeWidth={1.5} /> : <Pause aria-hidden="true" size={12} strokeWidth={1.5} />}
          {paused ? 'Play preview' : 'Pause preview'}
        </button>
      ) : null}
    </>
  )
}
