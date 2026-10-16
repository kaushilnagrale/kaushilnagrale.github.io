import type { Status, Tyre } from '@/lib/content'

export const STATUS_LABEL: Record<Status, string> = {
  live: 'Live',
  waking: 'Waking',
  video: 'Video',
  planned: 'In the garage',
  none: 'No demo',
}

const TYRE_LABEL: Record<Tyre, string> = {
  soft: 'Soft',
  medium: 'Medium',
  hard: 'Hard',
}

export const TYRE_MEANING: Record<Tyre, string> = {
  soft: 'Soft: full live demo',
  medium: 'Medium: live demo on fixed data',
  hard: 'Hard: recorded run',
}

export function StatusDot({ status }: { status: Status }) {
  return <span className="dot" data-status={status} aria-hidden="true" />
}

export function StatusBadge({ status, tyre }: { status: Status; tyre?: Tyre }) {
  return (
    <span className="chip" title={tyre ? TYRE_MEANING[tyre] : undefined}>
      {tyre ? (
        <>
          <span className="tyre" data-tyre={tyre} aria-hidden="true" />
          <span className="sr-only">Demo compound: {TYRE_MEANING[tyre]}.</span>
          <span aria-hidden="true">{TYRE_LABEL[tyre].toUpperCase()}</span>
          <span className="text-muted" aria-hidden="true">
            ·
          </span>
        </>
      ) : null}
      <StatusDot status={status} />
      <span>
        <span className="sr-only">Demo status: </span>
        {STATUS_LABEL[status].toUpperCase()}
      </span>
    </span>
  )
}
