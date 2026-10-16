export interface SectionMeta {
  id: string
  code: string
  name: string
  plain: string
}

// Phase 1 sections, in page order. CRU (The Crusher) and DEB (Debriefs) join in phases 3 and 4.
export const SECTIONS: SectionMeta[] = [
  { id: 'home', code: 'HOM', name: 'Pit wall', plain: 'Home' },
  { id: 'bays', code: 'BAY', name: 'Garage Bays', plain: 'Flagship projects' },
  { id: 'grid', code: 'GRD', name: 'Starting Grid', plain: 'More projects' },
  { id: 'circuit', code: 'CIR', name: 'Circuit', plain: 'Experience' },
  { id: 'setup', code: 'SET', name: 'Setup Sheet', plain: 'Skills' },
  { id: 'podium', code: 'POD', name: 'Podium', plain: 'Awards and credentials' },
  { id: 'photos', code: 'PHO', name: 'Photo finish', plain: 'Off the clock' },
  { id: 'radio', code: 'RAD', name: 'Team Radio', plain: 'Contact' },
]

export const MOBILE_CODES = ['HOM', 'BAY', 'GRD', 'CIR', 'RAD']

export function sheetNumber(id: string): string {
  const i = SECTIONS.findIndex((s) => s.id === id)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `SHEET ${pad(i + 1)} / ${pad(SECTIONS.length)}`
}
