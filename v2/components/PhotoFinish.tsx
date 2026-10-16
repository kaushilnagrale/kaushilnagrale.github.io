import Image from 'next/image'

export interface Photo {
  src: string
  alt: string
  place: string | null
  year: number | null
  caption: string | null
}

const SLOTS = 3
// Where the finish line settles on each frame, so the three frames do not line up.
const FINISH = ['64%', '38%', '72%']
const TIMES = ['0.000', '+0.014', '+0.031']

/**
 * Photo finish: up to three photos as frames from a finish-line camera. Crop marks, a frame number and a
 * cyan finish line that sweeps across on hover. In development, empty slots show where the next photos go.
 */
export function PhotoFinish({ photos }: { photos: Photo[] }) {
  const placeholders = process.env.NODE_ENV === 'development' ? Math.max(0, SLOTS - photos.length) : 0
  const count = photos.length + placeholders
  if (!count) return null

  return (
    <div>
      <p className="t-label mb-4 text-[11px] text-muted" aria-hidden="true">
        Line scan · {String(count).padStart(2, '0')} {count === 1 ? 'frame' : 'frames'}
      </p>

      <ol className={`grid grid-cols-1 gap-6 ${count >= 2 ? 'md:grid-cols-12' : ''}`}>
        {photos.slice(0, SLOTS).map((photo, i) => (
          <li key={photo.src} className={slotClass(i, count)}>
            <Frame index={i}>
              <figure className="m-0">
                <div className={`relative overflow-hidden rounded-lg bg-surface-2 ${aspect(i, count)}`}>
                  <Image src={photo.src} alt={photo.alt} fill sizes={i === 0 ? '(min-width: 768px) 58vw, 100vw' : '(min-width: 768px) 40vw, 100vw'} className="object-cover object-top" />
                  <FinishLine index={i} />
                </div>
                <figcaption className="mt-3 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <span className="t-label text-[11px] text-flow">Frame {String(i + 1).padStart(2, '0')}</span>
                  {photo.place || photo.year ? (
                    <span className="t-label text-[11px] text-muted">{[photo.place, photo.year].filter(Boolean).join(' · ')}</span>
                  ) : null}
                  {photo.caption ? <span className="w-full text-[15px]">{photo.caption}</span> : null}
                </figcaption>
              </figure>
            </Frame>
          </li>
        ))}
        {Array.from({ length: placeholders }, (_, k) => {
          const i = photos.length + k
          return (
            <li key={`slot-${i}`} className={slotClass(i, count)} aria-hidden="true">
              <Frame index={i}>
                <div className={`flex items-center justify-center rounded-lg border border-dashed border-line bg-surface-2 ${aspect(i, count)}`}>
                  <p className="px-6 text-center font-mono text-[12px] uppercase tracking-[0.08em] text-muted">
                    Frame {String(i + 1).padStart(2, '0')} · add a photo in content/profile.json
                    <span className="mt-1 block normal-case tracking-normal">Shown in development only</span>
                  </p>
                </div>
              </Frame>
            </li>
          )
        })}
      </ol>
    </div>
  )
}

function slotClass(i: number, count: number) {
  if (count === 1) return 'md:max-w-xl'
  if (count === 2) return 'md:col-span-6'
  return i === 0 ? 'md:col-span-7 md:row-span-2' : 'md:col-span-5'
}

function aspect(i: number, count: number) {
  if (count >= 3 && i === 0) return 'aspect-[5/6]'
  if (count >= 3) return 'aspect-[4/3]'
  return 'aspect-[4/5]'
}

/** Crop marks at the four corners, like a frame on a contact sheet. */
function Frame({ index, children }: { index: number; children: React.ReactNode }) {
  const mark = 'pointer-events-none absolute h-4 w-4 border-flow'
  return (
    <div className="photo-frame reveal relative h-full p-2" style={{ ['--finish' as string]: FINISH[index % FINISH.length] }}>
      <span aria-hidden="true" className={`${mark} left-0 top-0 border-l-2 border-t-2`} />
      <span aria-hidden="true" className={`${mark} right-0 top-0 border-r-2 border-t-2`} />
      <span aria-hidden="true" className={`${mark} bottom-0 left-0 border-b-2 border-l-2`} />
      <span aria-hidden="true" className={`${mark} bottom-0 right-0 border-b-2 border-r-2`} />
      {children}
    </div>
  )
}

function FinishLine({ index }: { index: number }) {
  return (
    <span aria-hidden="true" className="finish-line pointer-events-none absolute inset-y-0 w-px bg-flow shadow-[0_0_12px_var(--flow)]">
      <span className="absolute left-1.5 top-2 rounded bg-bg/80 px-1.5 py-0.5 font-mono text-[11px] tabular-nums text-flow">{TIMES[index % TIMES.length]}</span>
    </span>
  )
}
