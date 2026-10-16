import { ExternalLink, MessageSquare, PlayCircle } from 'lucide-react'
import { GithubIcon } from '@/components/BrandIcons'
import { SectionHeader } from '@/components/SectionHeader'
import { StatusBadge } from '@/components/StatusBadge'
import type { Bay } from '@/lib/content'
import { BayViewport } from './BayViewport'

/** Featured projects, ordered by the current lens. */
export function GarageBays({ bays }: { bays: Bay[] }) {
  const live = bays.filter((b) => b.status === 'live').length
  return (
    <section id="projects" aria-labelledby="projects-title" className="blueprint py-20 md:py-28">
      <div className="wrap">
        <SectionHeader
          id="projects"
          kicker={`${bays.length} projects · ${live} live demos`}
          intro="Each project has an overview and a demo panel. Live demo runs the real app once you press Launch; Architecture slides across to show how it is built."
        />
        <ol className="flex flex-col gap-10 md:gap-14">
          {bays.map((bay, i) => (
            <li key={bay.slug}>
              <GarageBay bay={bay} index={i + 1} />
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

function GarageBay({ bay, index }: { bay: Bay; index: number }) {
  const headingId = `project-${bay.slug}-title`
  // A team object without size 1 marks a team project; null means not confirmed yet.
  const isTeam = !!bay.team && bay.team.size !== 1

  return (
    <article id={`project-${bay.slug}`} aria-labelledby={headingId} data-skills={bay.skills.join(' ')} className="card reveal scroll-mt-6 p-4 sm:p-6 md:p-8">
      <header>
        <div className="flex items-center gap-3">
          <span className="t-label text-muted">Project {String(index).padStart(2, '0')}</span>
          <span className="h-px flex-1 bg-line" aria-hidden="true" />
          <StatusBadge status={bay.status} />
        </div>
        <div className="mt-4 flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
          <div className="min-w-0">
            <h3 id={headingId} className="t-h3 text-[30px] sm:text-[36px] md:text-[44px]">
              {bay.title}
            </h3>
            <p className="mt-2 text-[18px] text-muted">{bay.tagline}</p>
          </div>
          <ul className="flex flex-wrap gap-1.5" aria-label="Domains">
            {bay.domains.map((d) => (
              <li key={d} className="chip">
                {d}
              </li>
            ))}
          </ul>
        </div>
      </header>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-4">
          <p className="t-label mb-3 text-muted" aria-hidden="true">
            Overview
          </p>
          <dl className="divide-y divide-line border-y border-line text-[15px]">
            <SpecRow term="Problem">{bay.problem}</SpecRow>
            {isTeam || bay.role ? (
              <SpecRow term="My role">
                {isTeam ? (
                  <span className="chip mb-1 whitespace-normal">
                    {bay.team?.size ? `Team of ${bay.team.size}` : 'Team project'}
                    {bay.team?.myPart ? ` · my part: ${bay.team.myPart}` : ''}
                  </span>
                ) : null}
                {bay.role ? <span className="block">{bay.role}</span> : null}
              </SpecRow>
            ) : null}
            <SpecRow term="Stack">
              <ul className="flex flex-wrap gap-1.5">
                {bay.stack.map((s) => (
                  <li key={s} className="chip">
                    {s}
                  </li>
                ))}
              </ul>
            </SpecRow>
          </dl>

          <p className="t-label mb-2 mt-5 text-muted">Key results</p>
          <ol className="grid gap-px overflow-hidden rounded-xl border border-line bg-line">
            {bay.sectors.map((s) => (
              <li key={s.id} className="bg-surface px-3 py-2.5">
                <span className="block min-w-0">
                  <span className={`t-metric block text-[28px] ${s.best ? 'text-s-purple' : ''}`}>
                    {s.value}
                    {s.best ? <span className="sr-only"> (headline result)</span> : null}
                  </span>
                  <span className="mt-0.5 block text-[14px] leading-snug text-muted">{s.caption}</span>
                </span>
              </li>
            ))}
          </ol>

          <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-[15px]" aria-label={`${bay.title} links`}>
            {bay.links.live ? (
              <li>
                <a href={bay.links.live} target="_blank" rel="noopener noreferrer" className="link inline-flex items-center gap-1.5">
                  <ExternalLink aria-hidden="true" size={15} strokeWidth={1.5} /> Live
                </a>
              </li>
            ) : null}
            {bay.links.repo ? (
              <li>
                <a href={bay.links.repo} target="_blank" rel="noopener noreferrer" className="link inline-flex items-center gap-1.5">
                  <GithubIcon size={15} /> Repo
                </a>
              </li>
            ) : (
              <li>
                <a href="#contact" className="link inline-flex items-center gap-1.5">
                  <MessageSquare aria-hidden="true" size={15} strokeWidth={1.5} /> Code walkthrough on request
                </a>
              </li>
            )}
            {bay.links.caseStudy ? (
              <li>
                <a href={bay.links.caseStudy} className="link">
                  Case study
                </a>
              </li>
            ) : null}
            {bay.links.video ? (
              <li>
                <a href={bay.links.video} className="link inline-flex items-center gap-1.5">
                  <PlayCircle aria-hidden="true" size={15} strokeWidth={1.5} /> Video
                </a>
              </li>
            ) : null}
          </ul>
        </div>

        <div className="lg:col-span-8">
          <BayViewport
            bay={{
              slug: bay.slug,
              title: bay.title,
              tagline: bay.tagline,
              domains: bay.domains,
              sectors: bay.sectors,
              index,
              status: bay.status,
              links: { live: bay.links.live, embed: bay.links.embed ?? null, health: bay.links.health ?? null, video: bay.links.video },
              media: bay.media,
              architecture: bay.architecture,
              telemetry: bay.telemetry,
            }}
          />
          <p className="mt-3 text-[14px] text-muted">
            <span className="t-label mr-2 text-[11px]">Demo scope</span>
            {bay.demoScope}
          </p>
        </div>
      </div>
    </article>
  )
}

function SpecRow({ term, children }: { term: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[84px_1fr] gap-3 py-3">
      <dt className="t-label pt-0.5 text-[11px] text-muted">{term}</dt>
      <dd className="min-w-0">{children}</dd>
    </div>
  )
}
