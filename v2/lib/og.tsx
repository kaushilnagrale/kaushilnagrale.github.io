import { ImageResponse } from 'next/og'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { lenses, profile } from './content'

export const OG_SIZE = { width: 1200, height: 630 }

const font = (file: string) => readFile(join(process.cwd(), 'assets/fonts', file))

// Loaded once at module scope so the images prerender at build time.
const [wide, narrow, sans, mono, photo] = await Promise.all([
  font('Archivo-Expanded-ExtraBold.woff'),
  font('Archivo-Condensed-Bold.woff'),
  font('Manrope-Medium.woff'),
  font('IBMPlexMono-Medium.woff'),
  readFile(join(process.cwd(), 'public', profile.photo), 'base64'),
])

/** Q-04 · Shared OG card: name, role, three readouts, photo. Night palette. */
export async function renderOg({ kicker, line }: { kicker: string; line: string }) {
  const readouts = lenses.all.telemetry.slice(0, 4)

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          background: '#070B14',
          backgroundImage:
            'linear-gradient(to right, rgba(238,241,246,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(238,241,246,0.05) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
          color: '#EEF1F6',
          padding: '56px 64px',
          position: 'relative',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
          <div style={{ fontFamily: 'Mono', fontSize: 20, letterSpacing: 2, color: '#8B97B0' }}>{kicker.toUpperCase()}</div>
          <div style={{ fontFamily: 'Wide', fontSize: 84, lineHeight: 0.95, marginTop: 22, display: 'flex', flexDirection: 'column' }}>
            <span>Kaushil</span>
            <span>Nagrale</span>
          </div>
          <div style={{ fontFamily: 'Sans', fontSize: 28, lineHeight: 1.35, color: '#C9D1E0', marginTop: 24, maxWidth: 640 }}>{line}</div>
          <div style={{ display: 'flex', marginTop: 'auto', borderTop: '1px solid #22304F' }}>
            {readouts.map((r) => (
              <div key={r.value} style={{ display: 'flex', flexDirection: 'column', paddingTop: 18, paddingRight: 34 }}>
                <span style={{ fontFamily: 'Narrow', fontSize: 52, color: r.best ? '#A78BFA' : '#EEF1F6' }}>{r.value}</span>
                <span style={{ fontFamily: 'Mono', fontSize: 15, color: '#8B97B0', maxWidth: 170 }}>{r.caption}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 330 }}>
          <div style={{ display: 'flex', width: 300, height: 300, borderRadius: 999, border: '3px solid #22D3EE', padding: 8 }}>
            {/* eslint-disable-next-line @next/next/no-img-element -- Satori renders plain <img> only */}
            <img
              src={`data:image/jpeg;base64,${photo}`}
              width={278}
              height={278}
              style={{ borderRadius: 999, objectFit: 'cover', objectPosition: '50% 20%' }}
              alt=""
            />
          </div>
        </div>
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 10, display: 'flex' }}>
          {Array.from({ length: 120 }, (_, i) => (
            <div key={i} style={{ width: 10, height: 10, background: i % 2 ? '#EEF1F6' : '#070B14' }} />
          ))}
        </div>
      </div>
    ),
    {
      ...OG_SIZE,
      fonts: [
        { name: 'Wide', data: wide, weight: 800, style: 'normal' },
        { name: 'Narrow', data: narrow, weight: 700, style: 'normal' },
        { name: 'Sans', data: sans, weight: 500, style: 'normal' },
        { name: 'Mono', data: mono, weight: 500, style: 'normal' },
      ],
    },
  )
}
