import { SectionHeader } from '@/components/SectionHeader'
import { anchorFor, experience, projectTitle, type Corner } from '@/lib/content'

/** Experience and education as one timeline, oldest first, grouped by where it happened. */
export function Circuit() {
  const { sectors, corners } = experience
  const roles = corners.filter((c) => /engineer/i.test(c.title)).length

  return (
    <section id="experience" aria-labelledby="experience-title" className="blueprint py-20 md:py-28">
      <div className="wrap">
        <SectionHeader
          id="experience"
          kicker={`${roles} roles · 2 degrees`}
          intro="Mechanical engineering at RVCE, software engineering at Cognizant, then an MS at Arizona State University."
        />

        <ol className="max-w-4xl">
          {corners.map((c, i) => {
            const sector = sectors.find((s) => s.id === c.sector)!
            const firstInSector = i === 0 || corners[i - 1].sector !== c.sector
            return (
              <li key={c.id} className="reveal">
                {firstInSector ? (
                  <p className={`t-label mb-4 flex items-center gap-3 text-muted ${i ? 'mt-10' : ''}`}>
                    {sector.name}
                    <span className="h-px flex-1 bg-line" aria-hidden="true" />
                  </p>
                ) : null}
                <Entry corner={c} />
              </li>
            )
          })}
        </ol>
      </div>
    </section>
  )
}

function Entry({ corner: c }: { corner: Corner }) {
  return (
    <article className="relative mb-3 grid grid-cols-1 gap-x-6 border-l-2 border-line py-3 pl-5 sm:grid-cols-[150px_1fr]">
      <span aria-hidden="true" className="absolute -left-[5px] top-5 h-2 w-2 rounded-full bg-text" />
      <p className="font-mono text-[13px] text-muted sm:pt-1">{c.date}</p>
      <div>
        <h3 className="text-[19px] font-bold leading-snug">{c.title}</h3>
        <p className="text-[15px] text-muted">{c.org}</p>
        {c.points.length ? (
          <ul className="mt-2 space-y-1.5">
            {c.points.map((p) => (
              <li key={p.text} className="flex gap-3 text-[15px] leading-relaxed">
                <span className="chip h-fit w-12 flex-none justify-center !px-0 !py-0 text-[11px]">{p.tag}</span>
                <span>{p.text}</span>
              </li>
            ))}
          </ul>
        ) : null}
        {c.project ? (
          <a href={anchorFor(c.project)} className="link mt-2 inline-block text-[14px]">
            See {projectTitle(c.project)}
          </a>
        ) : null}
      </div>
    </article>
  )
}
