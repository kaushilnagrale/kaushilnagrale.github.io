'use client'

import { ArrowLeft, ArrowRight, Check, Copy, RotateCcw, ShieldAlert, X } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { readBest, saveBest } from './best'
import { RULE, format, makeRow, type Field, type Row } from './rows'

const ROUND_MS = 45_000
const RELAXED_ROWS = 20
const FIELDS: Field[] = ['id', 'customer', 'amount', 'country', 'date']

type Choice = 'pass' | 'quarantine'
interface Result {
  correct: boolean
  timedOut?: boolean
  row: Row
  choice: Choice | null
}

/** Per-row time limit: starts at 5 s and tightens with every correct call, down to 1.6 s. */
const rowLimit = (correct: number) => Math.max(1600, 5000 - correct * 180)

/**
 * Quality Gate: rows stream in from a pipeline; pass clean ones to Silver and quarantine the broken ones.
 * Keyboard: ← or A quarantines, → or D passes. Relaxed mode removes both timers and plays 20 rows.
 */
export default function QualityGate({ relaxed, onExit }: { relaxed: boolean; onExit: () => void }) {
  const [row, setRow] = useState<Row>(() => makeRow(0, 10400, []))
  const [silver, setSilver] = useState<number[]>([])
  const [quarantined, setQuarantined] = useState(0)
  const [score, setScore] = useState(0)
  const [streak, setStreak] = useState(0)
  const [bestStreak, setBestStreak] = useState(0)
  const [results, setResults] = useState<Result[]>([])
  const [last, setLast] = useState<Result | null>(null)
  const [over, setOver] = useState(false)
  // Timestamps live in state and are only set from the animation frame or a decision, never during render.
  const [now, setNow] = useState(0)
  const [t0, setT0] = useState(0)
  const [rowT0, setRowT0] = useState(0)
  const [copied, setCopied] = useState(false)

  const nextId = useRef(10401)
  const correctCount = results.filter((r) => r.correct).length
  const limit = rowLimit(correctCount)
  const mult = 1 + Math.min(2, Math.floor(streak / 4) * 0.5)

  const finish = useCallback(() => setOver(true), [])

  const decide = useCallback(
    (choice: Choice | null) => {
      if (over) return
      const isClean = row.defect === null
      const correct = choice !== null && (choice === 'pass') === isClean
      const result: Result = { correct, timedOut: choice === null, row, choice }
      setResults((r) => [...r, result])
      setLast(result)
      if (correct) {
        setScore((s) => s + Math.round(100 * mult))
        setStreak(streak + 1)
        setBestStreak((b) => Math.max(b, streak + 1))
      } else {
        setScore((s) => Math.max(0, s - 50))
        setStreak(0)
      }
      // Clean rows passed to Silver join the ledger, so a later duplicate is spottable.
      const nextSilver = choice === 'pass' && typeof row.values.id === 'number' ? [row.values.id, ...silver].slice(0, 4) : silver
      if (choice === 'pass') setSilver(nextSilver)
      if (choice === 'quarantine') setQuarantined((q) => q + 1)
      if (relaxed && results.length + 1 >= RELAXED_ROWS) {
        finish()
        return
      }
      setRow(makeRow(row.key + 1, nextId.current++, nextSilver))
      setRowT0(performance.now())
    },
    [over, row, mult, streak, silver, relaxed, results.length, finish],
  )

  // Clock: round timer and per-row timer (both off in relaxed mode).
  useEffect(() => {
    if (over || relaxed) return
    let raf = 0
    const tick = () => {
      const t = performance.now()
      setNow(t)
      if (!t0) {
        setT0(t)
        setRowT0(t)
        return
      }
      if (t - t0 >= ROUND_MS) {
        finish()
        return
      }
      if (t - rowT0 >= limit) decide(null)
      else raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [over, relaxed, limit, decide, finish, t0, rowT0])

  // Keyboard controls while playing.
  useEffect(() => {
    if (over) return
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.closest('input, textarea, select')) return
      const k = e.key.toLowerCase()
      if (k === 'arrowleft' || k === 'a') decide('quarantine')
      else if (k === 'arrowright' || k === 'd') decide('pass')
      else if (k === 'escape') finish()
      else return
      e.preventDefault()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [over, decide, finish])

  useEffect(() => {
    if (over) saveBest(score)
  }, [over, score])

  const checked = results.length
  const accuracy = checked ? Math.round((correctCount / checked) * 100) : 0
  const elapsed = t0 ? Math.min(ROUND_MS, now - t0) : 0
  const roundLeft = relaxed ? (RELAXED_ROWS - checked) / RELAXED_ROWS : 1 - elapsed / ROUND_MS
  const rowLeft = relaxed || !rowT0 ? 1 : Math.max(0, 1 - (now - rowT0) / limit)

  if (over) {
    const best = Math.max(readBest(), score)
    const minutes = relaxed ? 0 : elapsed / 60000
    const shareText = `I scored ${score.toLocaleString()} on Quality Gate with ${accuracy}% accuracy (${checked} rows). kaushilnagrale.github.io/#play`
    return (
      <div className="text-center">
        <p className="t-label text-muted">Run complete</p>
        <p className="t-metric mt-3 text-[64px] text-s-purple">{score.toLocaleString()}</p>
        <ul className="mx-auto mt-5 grid max-w-xl grid-cols-2 gap-px overflow-hidden rounded-xl border border-line bg-line text-left sm:grid-cols-4">
          {[
            ['Accuracy', `${accuracy}%`],
            ['Rows checked', String(checked)],
            ['Best streak', String(bestStreak)],
            [relaxed ? 'Mode' : 'Rows / min', relaxed ? 'Relaxed' : minutes ? Math.round(checked / minutes).toString() : '0'],
          ].map(([label, value]) => (
            <li key={label} className="bg-surface px-4 py-3">
              <span className="t-metric block text-[26px]">{value}</span>
              <span className="text-[13px] text-muted">{label}</span>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-[15px] text-muted">{score >= best && score > 0 ? 'New personal best.' : `Your best: ${best.toLocaleString()}`}</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button type="button" onClick={onExit} className="btn btn-primary">
            <RotateCcw aria-hidden="true" size={16} strokeWidth={1.5} /> Play again
          </button>
          <button
            type="button"
            className="btn btn-outline"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(shareText)
                setCopied(true)
                setTimeout(() => setCopied(false), 1800)
              } catch {
                /* clipboard can be blocked */
              }
            }}
          >
            {copied ? <Check aria-hidden="true" size={16} strokeWidth={1.5} /> : <Copy aria-hidden="true" size={16} strokeWidth={1.5} />}
            {copied ? 'Copied' : 'Copy result'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Scoreboard */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <dl className="flex flex-wrap gap-x-8 gap-y-2">
          <div>
            <dt className="t-label text-[11px] text-muted">Score</dt>
            <dd className="t-metric text-[34px] text-s-purple">{score.toLocaleString()}</dd>
          </div>
          <div>
            <dt className="t-label text-[11px] text-muted">Streak</dt>
            <dd className="t-metric text-[34px]">
              {streak}
              <span className="ml-1 text-[18px] text-flow">×{mult}</span>
            </dd>
          </div>
          <div>
            <dt className="t-label text-[11px] text-muted">Accuracy</dt>
            <dd className="t-metric text-[34px]">{accuracy}%</dd>
          </div>
        </dl>
        <button type="button" onClick={finish} className="btn btn-text text-[14px]">
          <X aria-hidden="true" size={15} strokeWidth={1.5} /> End run
        </button>
      </div>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-line" aria-hidden="true">
        <div className="h-full rounded-full bg-text" style={{ width: `${Math.max(0, roundLeft) * 100}%` }} />
      </div>
      <p className="mt-1 text-right font-mono text-[12px] text-muted">
        {relaxed ? `${RELAXED_ROWS - checked} rows left` : `${Math.ceil(Math.max(0, ROUND_MS - elapsed) / 1000)}s left`}
      </p>

      {/* Conveyor: quarantine · row · silver */}
      <div className="mt-4 grid grid-cols-1 items-stretch gap-4 md:grid-cols-[1fr_minmax(0,1.6fr)_1fr]">
        <Bin side="left" title="Quarantine" count={quarantined} hint="← or A" />

        <div className="order-first md:order-none">
          <div key={row.key} className="qg-row overflow-hidden rounded-2xl border border-line bg-surface">
            <div className="flex items-center justify-between border-b border-line px-4 py-2">
              <span className="t-label text-[11px] text-muted">orders_bronze · row {checked + 1}</span>
              {!relaxed ? (
                <span className="h-1.5 w-24 overflow-hidden rounded-full bg-line" aria-hidden="true">
                  <span className={`block h-full rounded-full ${rowLeft < 0.3 ? 'bg-s-yellow' : 'bg-flow'}`} style={{ width: `${rowLeft * 100}%` }} />
                </span>
              ) : null}
            </div>
            <dl className="px-4 py-3 font-mono text-[14px]">
              {FIELDS.map((f) => (
                <div key={f} className="flex gap-3 py-0.5">
                  <dt className="w-20 flex-none text-muted">{f}</dt>
                  <dd className="min-w-0 break-all">{format(row.values[f], f)}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        <Bin side="right" title="Silver" count={checkedPassed(results)} hint="→ or D" ids={silver} />
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <button type="button" onClick={() => decide('quarantine')} className="btn btn-outline h-14 text-[16px]">
          <ArrowLeft aria-hidden="true" size={18} strokeWidth={1.5} /> Quarantine
        </button>
        <button type="button" onClick={() => decide('pass')} className="btn btn-primary h-14 text-[16px]">
          Pass to Silver <ArrowRight aria-hidden="true" size={18} strokeWidth={1.5} />
        </button>
      </div>

      <p role="status" aria-live="polite" className="mt-4 min-h-[1.5rem] text-center text-[15px]">
        {last ? <Feedback result={last} /> : <span className="text-muted">Spot the broken rows. Clean ones go to Silver.</span>}
      </p>
    </div>
  )
}

function checkedPassed(results: Result[]) {
  return results.filter((r) => r.choice === 'pass').length
}

function Feedback({ result }: { result: Result }) {
  const { row, correct, timedOut } = result
  const why = row.defect ? RULE[row.defect].text : 'the row was clean'
  if (timedOut) return <span className="text-s-yellow">Too slow: the row went through unchecked ({why}).</span>
  if (correct) return <span className="text-s-green">{row.defect ? `Caught it: ${why}.` : 'Clean row, passed to Silver.'}</span>
  return <span className="text-s-yellow">{row.defect ? `Missed: ${why}.` : 'That row was clean; it belonged in Silver.'}</span>
}

function Bin({ side, title, count, hint, ids }: { side: 'left' | 'right'; title: string; count: number; hint: string; ids?: number[] }) {
  return (
    <div className={`flex flex-col justify-between rounded-2xl border border-dashed border-line bg-surface-2 p-4 ${side === 'right' ? 'md:text-right' : ''}`}>
      <div>
        <p className="t-label inline-flex items-center gap-2 text-[11px] text-muted">
          {side === 'left' ? <ShieldAlert aria-hidden="true" size={14} strokeWidth={1.5} /> : null}
          {title}
        </p>
        <p className="t-metric mt-1 text-[32px]">{count}</p>
        {ids && ids.length ? (
          <p className="mt-1 font-mono text-[12px] text-muted">
            recent ids: <span className="text-text">{ids.join(', ')}</span>
          </p>
        ) : null}
      </div>
      <p className="mt-3 font-mono text-[11px] text-muted">{hint}</p>
    </div>
  )
}
