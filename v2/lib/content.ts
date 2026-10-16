import profileJson from '@/content/profile.json'
import projectsJson from '@/content/projects.json'
import experienceJson from '@/content/experience.json'
import awardsJson from '@/content/awards.json'
import lensesJson from '@/content/lenses.json'
import skillsJson from '@/content/skills.json'

export type Lens = 'all' | 'data' | 'ml' | 'swe'
export const LENSES: Lens[] = ['all', 'data', 'ml', 'swe']
export const isLens = (v: unknown): v is Lens => LENSES.includes(v as Lens)

/** live: demo is up · waking: host is cold-starting · video: recording only · planned: demo not deployed yet · none: no demo planned */
export type Status = 'live' | 'waking' | 'video' | 'planned' | 'none'
export type Domain = 'SWE' | 'ML' | 'DATA' | 'MECH'
export type Tyre = 'soft' | 'medium' | 'hard'

export interface Sector {
  id: string
  value: string
  caption: string
  best?: boolean
}

export interface ArchNode {
  id: string
  label: string
  sub?: string
  kind: 'client' | 'service' | 'store' | 'stream' | 'model' | 'gate' | 'ext'
  x: number
  y: number
  w?: number
  h?: number
}

export interface ArchEdge {
  from: string
  to: string
  flow?: boolean
  both?: boolean
  label?: string
}

export interface Architecture {
  nodes: ArchNode[]
  edges: ArchEdge[]
}

export interface ProjectLinks {
  live: string | null
  embed?: string | null
  health?: string | null
  repo: string | null
  video: string | null
  caseStudy?: string | null
}

export interface Team {
  size: number | null
  myPart: string | null
}

interface ProjectBase {
  slug: string
  title: string
  status: Status
  domains: Domain[]
  stack: string[]
  skills: string[]
  links: ProjectLinks
  year: number | null
  team?: Team | null
}

export interface Bay extends ProjectBase {
  tier: 'bay'
  tagline: string
  tyre: Tyre
  lenses: Record<Lens, number>
  problem: string
  role: string | null
  sectors: Sector[]
  /** poster: still image · loop: short muted clip shown as a moving thumbnail · xrayUi / xrayArch: X-Ray layers */
  media: { poster: string | null; loop?: string | null; xrayUi: string | null; xrayArch: string | null }
  /** Live dashboard for the demo backend (Grafana, Prometheus, MLflow…). The TELEMETRY tab appears once embed or url is set. */
  telemetry: { provider: string | null; embed: string | null; url: string | null }
  demoScope: string
  architecture: Architecture
}

export interface GridEntry extends ProjectBase {
  tier: 'grid'
  oneLine: string
  archive?: boolean
}

export type Project = Bay | GridEntry

export interface Readout {
  value: string
  caption: string
  target: string
  best?: boolean
}

export interface LensConfig {
  label: string
  hero: string | null
  resume: string
  domain: Domain | null
  emphasis: string[]
  telemetry: Readout[]
}

export interface Corner {
  id: string
  sector: string
  date: string
  title: string
  org: string
  points: { text: string; tag: Domain }[]
  project?: string
  skills?: string[]
  current?: boolean
}

export interface SkillRow {
  id: string
  component: string
  mapsTo: string
  items: { id: string; name: string }[]
}

export const profile = profileJson
export const projects = projectsJson as unknown as Project[]
export const experience = experienceJson as unknown as { sectors: { id: string; name: string }[]; corners: Corner[] }
export const awards = awardsJson
export const lenses = lensesJson as unknown as Record<Lens, LensConfig>
export const skills = skillsJson as SkillRow[]

export const bays = projects.filter((p): p is Bay => p.tier === 'bay')
export const gridEntries = projects.filter((p): p is GridEntry => p.tier === 'grid')

export function baysFor(lens: Lens): Bay[] {
  return [...bays].sort((a, b) => a.lenses[lens] - b.lenses[lens])
}

/** Grid slots keep their curated order; a lens pulls its matching domain to the front. */
export function gridFor(lens: Lens): GridEntry[] {
  const domain = lenses[lens].domain
  if (!domain) return gridEntries
  const hit = gridEntries.filter((e) => e.domains.includes(domain))
  return [...hit, ...gridEntries.filter((e) => !hit.includes(e))]
}

export function anchorFor(slugOrHash: string): string {
  if (slugOrHash.startsWith('#')) return slugOrHash
  const p = projects.find((x) => x.slug === slugOrHash)
  if (!p) return '#projects'
  return p.tier === 'bay' ? `#project-${p.slug}` : `#more-${p.slug}`
}

export function projectTitle(slug: string): string {
  return projects.find((p) => p.slug === slug)?.title ?? slug
}

export interface SkillUse {
  projects: { slug: string; title: string; href: string }[]
  roles: string[]
}

export function skillUse(skillId: string): SkillUse {
  return {
    projects: projects
      .filter((p) => p.skills.includes(skillId))
      .map((p) => ({ slug: p.slug, title: p.title, href: anchorFor(p.slug) })),
    roles: experience.corners.filter((c) => c.skills?.includes(skillId)).map((c) => c.org),
  }
}

export const liveCount = () => bays.filter((b) => b.status === 'live').length
