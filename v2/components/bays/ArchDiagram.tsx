import type { ArchNode, Architecture } from '@/lib/content'

const W = 155
const H = 54

type Box = { cx: number; cy: number; hw: number; hh: number }

// Approximate glyph widths: 14px bold sans and 10.5px mono (measured against the rendered fonts).
const LABEL_CHAR = 8
const SUB_CHAR = 6.4
const PAD = 8
const LABEL_LINE = 17
const SUB_LINE = 13

interface Layout {
  w: number
  h: number
  label: string[]
  labelSize: number
  sub: string[]
}

/** Lines of at most `max` characters, broken at spaces. */
function wrapText(text: string, max: number): string[] {
  const lines: string[] = []
  let line = ''
  for (const word of text.split(' ')) {
    if (line && (line + ' ' + word).length > max) {
      lines.push(line)
      line = word
    } else line = line ? `${line} ${word}` : word
  }
  if (line) lines.push(line)
  return lines
}

/** Fits a node's text inside its box: long subtitles wrap, long titles shrink (to 12px) and then wrap, and the box grows taller. */
function layout(n: ArchNode): Layout {
  const w = n.w ?? W
  const room = w - PAD * 2
  let labelSize = 14
  let label = [n.label]
  if (n.label.length * LABEL_CHAR > room) {
    labelSize = Math.max(12, Math.floor((room / (n.label.length * LABEL_CHAR)) * 14 * 2) / 2)
    if (n.label.length * LABEL_CHAR * (labelSize / 14) > room) {
      labelSize = 14
      label = wrapText(n.label, Math.floor(room / LABEL_CHAR))
    }
  }
  const sub = n.sub ? wrapText(n.sub, Math.floor(room / SUB_CHAR)) : []
  const content = label.length * LABEL_LINE + sub.length * SUB_LINE
  return { w, h: Math.max(n.h ?? H, content + 18), label, labelSize, sub }
}

const boxOf = (n: ArchNode, l: Layout): Box => ({ cx: n.x + l.w / 2, cy: n.y + l.h / 2, hw: l.w / 2, hh: l.h / 2 })

/** Point where the ray from the box centre toward (dx, dy) leaves the box, pushed out by `pad`. */
function exit(b: Box, dx: number, dy: number, pad: number) {
  const t = Math.min(dx ? b.hw / Math.abs(dx) : Infinity, dy ? b.hh / Math.abs(dy) : Infinity)
  const len = Math.hypot(dx, dy) || 1
  return { x: b.cx + dx * t + (dx / len) * pad, y: b.cy + dy * t + (dy / len) * pad }
}

function NodeShape({ n, l }: { n: ArchNode; l: Layout }) {
  const { w, h } = l
  const common = { x: n.x, y: n.y, width: w, height: h, fill: 'var(--surface)', stroke: 'var(--text)', strokeWidth: 1.5 }
  switch (n.kind) {
    case 'client':
      return <rect {...common} rx={14} />
    case 'store':
      return (
        <g>
          <rect {...common} rx={4} />
          <path d={`M${n.x} ${n.y + 8} H${n.x + w}`} stroke="var(--text)" strokeWidth={1} opacity={0.6} />
        </g>
      )
    case 'stream':
      return <rect {...common} rx={4} strokeDasharray="8 5" />
    case 'model':
      return (
        <g>
          <rect {...common} rx={4} />
          <path d={`M${n.x + w - 14} ${n.y} L${n.x + w} ${n.y + 14}`} stroke="var(--text)" strokeWidth={1.5} />
        </g>
      )
    case 'gate':
      return (
        <g>
          <rect {...common} rx={4} strokeWidth={2.5} />
          <rect x={n.x + 4} y={n.y + 4} width={w - 8} height={h - 8} rx={2} fill="none" stroke="var(--text)" strokeWidth={1} opacity={0.5} />
        </g>
      )
    case 'ext':
      return <rect {...common} rx={4} stroke="var(--muted)" strokeDasharray="3 4" fill="var(--surface-2)" />
    default:
      return <rect {...common} rx={4} />
  }
}

/** X-RAY architecture drawing, rendered from content so it follows the theme. */
export function ArchDiagram({ slug, title, arch }: { slug: string; title: string; arch: Architecture }) {
  const byId = new Map(arch.nodes.map((n) => [n.id, n]))
  const fit = new Map(arch.nodes.map((n) => [n.id, layout(n)]))
  const mk = (k: string) => `arch-${slug}-${k}`

  return (
    <svg viewBox="0 0 800 500" className="block h-full w-full" role="img" aria-labelledby={mk('t')}>
      <title id={mk('t')}>{`${title} architecture: ${arch.nodes.map((n) => n.label).join(', ')}`}</title>
      <defs>
        <pattern id={mk('grid')} width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M20 0H0V20" fill="none" stroke="var(--text)" strokeOpacity="0.06" strokeWidth="1" />
        </pattern>
        {(['text', 'flow'] as const).map((c) => (
          <marker key={c} id={mk(`arrow-${c}`)} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M0 0L10 5L0 10z" fill={`var(--${c})`} />
          </marker>
        ))}
      </defs>
      <rect width="800" height="500" fill="var(--surface-2)" />
      <rect width="800" height="500" fill={`url(#${mk('grid')})`} />

      {arch.edges.map((e) => {
        const a = byId.get(e.from)
        const b = byId.get(e.to)
        if (!a || !b) return null
        const A = boxOf(a, fit.get(a.id)!)
        const B = boxOf(b, fit.get(b.id)!)
        const dx = B.cx - A.cx
        const dy = B.cy - A.cy
        const p1 = exit(A, dx, dy, e.both ? 6 : 2)
        const p2 = exit(B, -dx, -dy, 6)
        const color = e.flow ? 'flow' : 'text'
        return (
          <g key={`${e.from}-${e.to}`}>
            <line
              x1={p1.x}
              y1={p1.y}
              x2={p2.x}
              y2={p2.y}
              stroke={`var(--${color})`}
              strokeWidth={e.flow ? 2 : 1.5}
              opacity={e.flow ? 1 : 0.6}
              className={e.flow ? 'flow-dash' : undefined}
              markerEnd={`url(#${mk(`arrow-${color}`)})`}
              markerStart={e.both ? `url(#${mk(`arrow-${color}`)})` : undefined}
            />
            {e.label ? (
              <text
                x={(p1.x + p2.x) / 2 + (Math.abs(dy) > Math.abs(dx) ? 8 : 0)}
                y={(p1.y + p2.y) / 2 - (Math.abs(dy) > Math.abs(dx) ? 0 : 8)}
                fontSize="11"
                fill="var(--muted)"
                className="font-mono"
                textAnchor={Math.abs(dy) > Math.abs(dx) ? 'start' : 'middle'}
              >
                {e.label}
              </text>
            ) : null}
          </g>
        )
      })}

      {arch.nodes.map((n) => {
        const l = fit.get(n.id)!
        const block = l.label.length * LABEL_LINE + l.sub.length * SUB_LINE
        const top = n.y + (l.h - block) / 2
        const cx = n.x + l.w / 2
        return (
          <g key={n.id}>
            <NodeShape n={n} l={l} />
            {l.label.map((line, i) => (
              <text
                key={`l${i}`}
                x={cx}
                y={top + (i + 1) * LABEL_LINE - 4}
                textAnchor="middle"
                fontSize={l.labelSize}
                fontWeight={700}
                fill={n.kind === 'ext' ? 'var(--muted)' : 'var(--text)'}
                className="font-sans"
              >
                {line}
              </text>
            ))}
            {l.sub.map((line, i) => (
              <text
                key={`s${i}`}
                x={cx}
                y={top + l.label.length * LABEL_LINE + (i + 1) * SUB_LINE - 2}
                textAnchor="middle"
                fontSize="10.5"
                fill="var(--muted)"
                className="font-mono"
              >
                {line}
              </text>
            ))}
          </g>
        )
      })}
    </svg>
  )
}
