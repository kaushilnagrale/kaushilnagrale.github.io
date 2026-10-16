import type { ArchNode, Architecture } from '@/lib/content'

const W = 155
const H = 54

type Box = { cx: number; cy: number; hw: number; hh: number }

const box = (n: ArchNode): Box => {
  const w = n.w ?? W
  const h = n.h ?? H
  return { cx: n.x + w / 2, cy: n.y + h / 2, hw: w / 2, hh: h / 2 }
}

/** Point where the ray from the box centre toward (dx, dy) leaves the box, pushed out by `pad`. */
function exit(b: Box, dx: number, dy: number, pad: number) {
  const t = Math.min(dx ? b.hw / Math.abs(dx) : Infinity, dy ? b.hh / Math.abs(dy) : Infinity)
  const len = Math.hypot(dx, dy) || 1
  return { x: b.cx + dx * t + (dx / len) * pad, y: b.cy + dy * t + (dy / len) * pad }
}

function NodeShape({ n }: { n: ArchNode }) {
  const w = n.w ?? W
  const h = n.h ?? H
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
        const A = box(a)
        const B = box(b)
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
        const w = n.w ?? W
        const h = n.h ?? H
        return (
          <g key={n.id}>
            <NodeShape n={n} />
            <text x={n.x + w / 2} y={n.y + (n.sub ? h / 2 - 3 : h / 2 + 5)} textAnchor="middle" fontSize="14" fontWeight={700} fill={n.kind === 'ext' ? 'var(--muted)' : 'var(--text)'} className="font-sans">
              {n.label}
            </text>
            {n.sub ? (
              <text x={n.x + w / 2} y={n.y + h / 2 + 15} textAnchor="middle" fontSize="10.5" fill="var(--muted)" className="font-mono">
                {n.sub}
              </text>
            ) : null}
          </g>
        )
      })}
    </svg>
  )
}
