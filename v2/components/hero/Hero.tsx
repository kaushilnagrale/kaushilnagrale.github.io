import { ArrowDown, Download } from 'lucide-react'
import { lenses, profile, type Lens } from '@/lib/content'
import { BlueprintCar } from './BlueprintCar'
import { LensSwitch } from './LensSwitch'

/** S-03 · Who Kaushil is in five seconds. The H1 is the LCP element, so nothing animates over it. */
export function Hero({ lens, resume }: { lens: Lens; resume: string }) {
  const line = lenses[lens].hero ?? profile.headline

  return (
    <section id="home" aria-labelledby="home-title" className="blueprint scanline overflow-hidden pb-14 pt-24 md:pb-20 md:pt-32">
      <div className="wrap grid grid-cols-1 gap-12 lg:grid-cols-12 lg:items-center">
        <div className="lg:col-span-7">
          <p className="t-label text-muted">{profile.kicker}</p>
          <h1 id="home-title" className="t-h1 mt-5">
            Kaushil{' '}
            <br />
            Nagrale
          </h1>
          <p className="mt-6 max-w-[38rem] text-[19px] leading-relaxed md:text-[20px]">{line}</p>

          <p className="mt-6 inline-flex flex-wrap items-center gap-x-2 gap-y-1 rounded-full border border-line bg-surface px-3.5 py-1.5 text-[14px]">
            <span className="dot" data-status="live" aria-hidden="true" />
            <span className="font-semibold">
              {profile.role}
              {profile.company ? ` @ ${profile.company}` : ''}
            </span>
            <span className="text-muted">· {profile.availability}</span>
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a href="#projects" className="btn btn-primary">
              See projects
              <ArrowDown aria-hidden="true" size={17} strokeWidth={1.5} />
            </a>
            <a href={resume} download className="btn btn-outline">
              <Download aria-hidden="true" size={17} strokeWidth={1.5} />
              Download resume
            </a>
          </div>

          <LensSwitch lens={lens} />
        </div>

        <div className="lg:col-span-5">
          <BlueprintCar />
        </div>
      </div>
    </section>
  )
}
