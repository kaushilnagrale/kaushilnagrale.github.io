import { GarageBays } from '@/components/bays/GarageBays'
import { Circuit } from '@/components/Circuit'
import { StartingGrid, type GridItem } from '@/components/grid/StartingGrid'
import { Hero } from '@/components/hero/Hero'
import { MobileBar } from '@/components/nav/MobileBar'
import { TimingTowerNav } from '@/components/nav/TimingTowerNav'
import { TopCluster } from '@/components/nav/TopCluster'
import type { PaletteData } from '@/components/palette/CommandPalette'
import { PhotoReel, type Photo } from '@/components/PhotoReel'
import { Podium } from '@/components/Podium'
import { Contact } from '@/components/contact/Contact'
import { SectionHeader } from '@/components/SectionHeader'
import { SetupSheet, type ProjectLookup, type SetupRow } from '@/components/setup/SetupSheet'
import { StatusBar } from '@/components/StatusBar'
import { TelemetryStrip } from '@/components/TelemetryStrip'
import { Toaster } from '@/components/Toaster'
import { LENSES, anchorFor, baysFor, gridFor, lenses, liveCount, profile, projects, skills, skillUse, type Lens } from '@/lib/content'
import { SECTIONS, SHOW_PHOTOS } from '@/lib/sections'
import { SITE_URL, lensHref, resumeFor } from '@/lib/site'

export function HomePage({ lens }: { lens: Lens }) {
  const config = lenses[lens]
  const resume = resumeFor(lens)
  const bays = baysFor(lens)
  const grid = gridFor(lens)

  const gridItems: GridItem[] = grid.map((e, i) => ({
    slug: e.slug,
    title: e.title,
    oneLine: e.oneLine,
    status: e.status,
    domains: e.domains,
    stack: e.stack,
    skills: e.skills,
    live: e.links.live,
    repo: e.links.repo,
    year: e.year,
    archive: !!e.archive,
    pos: i + 1,
  }))

  const setupRows: SetupRow[] = skills.map((row) => ({
    id: row.id,
    component: row.component,
    mapsTo: row.mapsTo,
    emphasized: config.emphasis.includes(row.id),
    items: row.items.map((item) => {
      const use = skillUse(item.id)
      return { ...item, projects: use.projects.map((p) => p.slug), roles: use.roles }
    }),
  }))
  const projectLookup: ProjectLookup = Object.fromEntries(projects.map((p) => [p.slug, { title: p.title, href: anchorFor(p.slug) }]))

  const photos = profile.photos as Photo[]
  // Empty slots only in `npm run dev`, so the layout is visible before photos arrive.
  const photoSlots = process.env.NODE_ENV === 'development' ? Math.max(0, 3 - photos.length) : 0

  const palette: PaletteData = {
    sections: SECTIONS,
    projects: [
      ...bays.map((b) => ({ title: b.title, href: `#project-${b.slug}`, tier: 'bay' as const })),
      ...grid.map((g) => ({ title: g.title, href: `#more-${g.slug}`, tier: 'grid' as const })),
    ],
    lenses: LENSES.map((l) => ({ label: lenses[l].label, href: lensHref(l) })),
    email: profile.email,
    resume,
  }

  return (
    <>
      <TimingTowerNav sections={SECTIONS} />
      <TopCluster resume={resume} palette={palette} />

      <div className="with-rail">
        <main id="main">
          <Hero lens={lens} resume={resume} />
          <TelemetryStrip readouts={config.telemetry} />
          <GarageBays bays={bays} />

          <section id="more" aria-labelledby="more-title" className="py-20 md:py-28">
            <div className="wrap">
              <SectionHeader
                id="more"
                kicker={`${grid.length} projects`}
                intro="Smaller builds as cards or a sortable table. Search by name, stack or year."
              />
              <StartingGrid items={gridItems} lensLabel={config.label} lensDomain={config.domain} />
            </div>
          </section>

          <Circuit />

          <section id="skills" aria-labelledby="skills-title" className="py-20 md:py-28">
            <div className="wrap">
              <SectionHeader
                id="skills"
                kicker={`${skills.length} areas`}
                intro="Grouped by area. Hover or tap a skill to see the projects that use it; click it to filter the projects above."
              />
              <SetupSheet rows={setupRows} projects={projectLookup} />
            </div>
          </section>

          <Podium />

          {SHOW_PHOTOS ? (
            <section id="photos" aria-labelledby="photos-title" className="py-20 md:py-28">
              <div className="wrap">
                <SectionHeader
                  id="photos"
                  kicker={photos.length ? `${photos.length} photo${photos.length === 1 ? '' : 's'}` : 'coming soon'}
                  intro="Life outside the editor."
                />
                <PhotoReel photos={photos} placeholders={photoSlots} />
              </div>
            </section>
          ) : null}

          <section id="contact" aria-labelledby="contact-title" className="blueprint py-20 md:py-28">
            <div className="wrap">
              <SectionHeader id="contact" kicker="Email, LinkedIn, GitHub" intro={profile.contactIntro} />
              <Contact
                email={profile.email}
                linkedin={profile.links.linkedin}
                github={profile.links.github}
                booking={profile.links.booking}
                resume={resume}
                formKey={process.env.NEXT_PUBLIC_WEB3FORMS_KEY ?? null}
                timeZone={profile.timeZone}
              />
            </div>
          </section>
        </main>

        <StatusBar live={liveCount()} total={bays.length} timeZone={profile.timeZone} />
      </div>

      <MobileBar sections={SECTIONS} resume={resume} />
      <Toaster />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: personJsonLd() }} />
    </>
  )
}

function personJsonLd() {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: profile.name,
    url: SITE_URL,
    image: `${SITE_URL}${profile.photo}`,
    email: `mailto:${profile.email}`,
    jobTitle: profile.role,
    ...(profile.company ? { worksFor: { '@type': 'Organization', name: profile.company } } : {}),
    address: { '@type': 'PostalAddress', addressLocality: 'Tempe', addressRegion: 'AZ', addressCountry: 'US' },
    alumniOf: [
      { '@type': 'CollegeOrUniversity', name: 'Arizona State University' },
      { '@type': 'CollegeOrUniversity', name: 'RV College of Engineering' },
    ],
    hasCredential: { '@type': 'EducationalOccupationalCredential', name: 'Microsoft Certified: Azure Developer Associate (AZ-204)' },
    knowsAbout: ['Data engineering', 'Spring Boot', 'FastAPI', 'Apache Spark', 'Kafka', 'Machine learning', 'Retrieval-augmented generation', 'Azure', 'AWS'],
    sameAs: [profile.links.github, profile.links.linkedin],
  }
  return JSON.stringify(data).replace(/</g, '\\u003c')
}
