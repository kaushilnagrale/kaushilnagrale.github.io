import profile from '@/content/profile.json'

export interface SectionMeta {
  id: string
  /** Short label for the side rail and mobile bar. */
  label: string
  /** The section heading: says plainly what is inside. */
  title: string
}

// Photos appear once there is at least one photo; in `npm run dev` the empty slots show where they go.
export const SHOW_PHOTOS = profile.photos.length > 0 || process.env.NODE_ENV === 'development'

const ALL: SectionMeta[] = [
  { id: 'home', label: 'Home', title: 'Home' },
  { id: 'projects', label: 'Projects', title: 'Featured projects' },
  { id: 'more', label: 'More', title: 'More projects' },
  { id: 'experience', label: 'Experience', title: 'Experience and education' },
  { id: 'skills', label: 'Skills', title: 'Skills' },
  { id: 'awards', label: 'Awards', title: 'Awards and certifications' },
  { id: 'photos', label: 'Photos', title: 'Photos' },
  { id: 'contact', label: 'Contact', title: 'Contact' },
]

export const SECTIONS = ALL.filter((s) => s.id !== 'photos' || SHOW_PHOTOS)

export function sectionNumber(id: string): string {
  return String(SECTIONS.findIndex((s) => s.id === id) + 1).padStart(2, '0')
}

export function sheetNumber(id: string): string {
  return `SHEET ${sectionNumber(id)} / ${String(SECTIONS.length).padStart(2, '0')}`
}
