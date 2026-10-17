'use client'

import { Play, Timer } from 'lucide-react'
import { lazy, Suspense, useState, useSyncExternalStore } from 'react'
import { readBest } from './best'

const loadGame = () => import('./QualityGate')
const QualityGate = lazy(loadGame)

const EXAMPLES = ['null customer', 'malformed email', 'negative amount', 'text in a number field', 'future date', 'unknown country code', 'duplicate id']

/** Intro card for Quality Gate; the game code downloads only when a visitor starts a run. */
export function PlaySection() {
  const [mode, setMode] = useState<'timed' | 'relaxed' | null>(null)
  const [run, setRun] = useState(0)
  const best = useSyncExternalStore(
    () => () => {},
    () => readBest(),
    () => 0,
  )

  if (mode) {
    return (
      <div className="card p-5 md:p-7">
        <Suspense fallback={<p className="py-16 text-center text-muted">Loading the pipeline…</p>}>
          <QualityGate key={run} relaxed={mode === 'relaxed'} onExit={() => setRun((r) => r + 1)} />
        </Suspense>
      </div>
    )
  }

  return (
    <div className="card grid grid-cols-1 gap-8 p-5 md:p-8 lg:grid-cols-12">
      <div className="lg:col-span-7">
        <h3 className="t-h3 text-[28px] md:text-[34px]">Can you run a quality gate?</h3>
        <ol className="mt-5 space-y-3 text-[16px] leading-relaxed">
          <li className="flex gap-3">
            <span className="font-mono text-[13px] text-flow">01</span>A row arrives from the Bronze layer.
          </li>
          <li className="flex gap-3">
            <span className="font-mono text-[13px] text-flow">02</span>
            <span>
              Clean? <span className="font-semibold">Pass it to Silver</span> (→ or D). Broken? <span className="font-semibold">Quarantine it</span> (← or A).
            </span>
          </li>
          <li className="flex gap-3">
            <span className="font-mono text-[13px] text-flow">03</span>
            The timer tightens as you get them right; streaks multiply your score.
          </li>
        </ol>
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setMode('timed')}
            onPointerEnter={() => void loadGame()}
            onFocus={() => void loadGame()}
            className="btn btn-primary"
          >
            <Play aria-hidden="true" size={16} strokeWidth={1.5} /> Start · 45 s
          </button>
          <button type="button" onClick={() => setMode('relaxed')} className="btn btn-outline">
            <Timer aria-hidden="true" size={16} strokeWidth={1.5} /> Relaxed · no timer
          </button>
        </div>
        <p className="mt-3 text-[14px] text-muted">{best ? `Your best: ${best.toLocaleString()}` : 'No score yet in this browser.'}</p>
        <noscript>
          <p className="mt-3 text-[14px] text-muted">The game needs JavaScript.</p>
        </noscript>
      </div>
      <div className="lg:col-span-5">
        <p className="t-label mb-3 text-[11px] text-muted">Defects you will meet</p>
        <ul className="flex flex-wrap gap-2">
          {EXAMPLES.map((e) => (
            <li key={e} className="chip">
              {e}
            </li>
          ))}
        </ul>
        <pre className="mt-5 overflow-hidden rounded-xl border border-line bg-surface-2 p-4 font-mono text-[13px] leading-relaxed text-muted">
          {`id        10427
customer  "maya@@mail.com"
amount    42.10
country   "US"
date      "2026-09-30"`}
        </pre>
        <p className="mt-2 text-[13px] text-muted">Broken: the email has two @ signs. Quarantine it.</p>
      </div>
    </div>
  )
}
