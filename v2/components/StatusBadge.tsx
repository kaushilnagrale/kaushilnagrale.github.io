import type { Status } from '@/lib/content'

export const STATUS_LABEL: Record<Status, string> = {
  live: 'Live demo',
  waking: 'Waking up',
  video: 'Video',
  planned: 'Demo soon',
  none: 'No demo',
}

export function StatusDot({ status }: { status: Status }) {
  return <span className="dot" data-status={status} aria-hidden="true" />
}

export function StatusBadge({ status }: { status: Status }) {
  return (
    <span className="chip">
      <StatusDot status={status} />
      <span>
        <span className="sr-only">Demo status: </span>
        {STATUS_LABEL[status].toUpperCase()}
      </span>
    </span>
  )
}
