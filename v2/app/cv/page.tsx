import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Download, Mail } from 'lucide-react'
import { GithubIcon, LinkedinIcon } from '@/components/BrandIcons'
import { anchorFor, baysFor, lenses, profile } from '@/lib/content'
import { resumeFor } from '@/lib/site'

export const metadata: Metadata = {
  title: '30 second CV',
  description: 'Kaushil Nagrale on one screen: current role, three numbers, three projects, resume and email.',
  alternates: { canonical: '/cv/' },
  openGraph: { images: [{ url: '/og/cv.png', width: 1200, height: 630, alt: 'Kaushil Nagrale, 30 second CV' }] },
  twitter: { card: 'summary_large_image', images: ['/og/cv.png'] },
}

/** R-02 · Quick Lap CV: one screen, prints to one page. */
export default function QuickLapCv() {
  const resume = resumeFor('all')
  const projects = baysFor('all').slice(0, 3)
  const metrics = lenses.all.telemetry.filter((r) => ['2.8%', '262K', '510 ms'].includes(r.value))

  return (
    <main id="main" className="min-h-svh py-8 md:py-14 print:py-0">
      <div className="wrap !max-w-[900px]">
        <Link href="/" className="no-print link inline-flex items-center gap-2 text-[15px]">
          <ArrowLeft aria-hidden="true" size={16} strokeWidth={1.5} /> Back to the pit wall
        </Link>

        <article className="card mt-6 p-6 md:p-10 print:mt-0 print:border-0 print:p-0 print:shadow-none">
          <header className="flex flex-col gap-6 sm:flex-row sm:items-center">
            <Image src={profile.photo} alt="Kaushil Nagrale" width={120} height={142} priority className="h-[120px] w-[120px] flex-none rounded-full border border-line object-cover object-top" />
            <div>
              <p className="t-label text-muted">Quick lap · 30 second CV</p>
              <h1 className="t-h2 mt-2">{profile.name}</h1>
              <p className="mt-2 text-[18px]">{profile.oneLine}</p>
              <p className="mt-2 inline-flex items-center gap-2 text-[15px]">
                <span className="dot" data-status="live" aria-hidden="true" />
                <span className="font-semibold">{profile.role}</span>
                <span className="text-muted">· {profile.location}</span>
              </p>
            </div>
          </header>

          <h2 className="t-label mb-3 mt-8 text-muted">Top numbers</h2>
          <ul className="grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-3">
            {metrics.map((m) => (
              <li key={m.value} className="bg-surface px-4 py-4">
                <span className={`t-metric block text-[40px] ${m.best ? 'text-s-purple' : ''}`}>{m.value}</span>
                <span className="text-[14px] text-muted">{m.caption}</span>
              </li>
            ))}
          </ul>

          <h2 className="t-label mb-3 mt-8 text-muted">Top projects</h2>
          <ol className="divide-y divide-line border-y border-line">
            {projects.map((p) => {
              const best = p.sectors.find((s) => s.best) ?? p.sectors[0]
              return (
                <li key={p.slug} className="flex flex-wrap items-baseline gap-x-4 gap-y-1 py-3.5">
                  <a href={`/${anchorFor(p.slug)}`} className="font-bold hover:underline">
                    {p.title}
                  </a>
                  <span className="text-muted">{p.tagline}</span>
                  <span className="ml-auto font-mono text-[13px]">
                    <span className="text-s-purple">{best.value}</span> <span className="text-muted">{best.caption}</span>
                  </span>
                </li>
              )
            })}
          </ol>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a href={resume} download className="btn btn-primary no-print">
              <Download aria-hidden="true" size={17} strokeWidth={1.5} /> Download resume
            </a>
            <a href={`mailto:${profile.email}`} className="btn btn-outline">
              <Mail aria-hidden="true" size={17} strokeWidth={1.5} /> {profile.email}
            </a>
            <a href={profile.links.linkedin} className="btn btn-text" target="_blank" rel="noopener noreferrer">
              <LinkedinIcon size={16} /> LinkedIn
            </a>
            <a href={profile.links.github} className="btn btn-text" target="_blank" rel="noopener noreferrer">
              <GithubIcon size={16} /> GitHub
            </a>
          </div>
        </article>
      </div>
    </main>
  )
}
