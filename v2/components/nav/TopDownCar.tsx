/** Small top-down race car, nose pointing down (+y). Line art in theme colours; decorative only. */
export function TopDownCar({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 38" className={className} aria-hidden="true">
      <rect x="2" y="1" width="16" height="3" rx="1" fill="var(--text)" />
      <rect x="0" y="6" width="4" height="7" rx="1.2" fill="var(--text)" />
      <rect x="16" y="6" width="4" height="7" rx="1.2" fill="var(--text)" />
      <path d="M7 4 L13 4 L15 12 L15 20 L12 26 L11 33 L9 33 L8 26 L5 20 L5 12 Z" fill="var(--surface)" stroke="var(--text)" strokeWidth="1" strokeLinejoin="round" />
      <path d="M10 5.5 V12.5" stroke="var(--flow)" strokeWidth="1.6" strokeLinecap="round" />
      <ellipse cx="10" cy="17" rx="2.2" ry="3" fill="var(--bg)" stroke="var(--text)" strokeWidth="0.9" />
      <rect x="0" y="24" width="4" height="6" rx="1.2" fill="var(--text)" />
      <rect x="16" y="24" width="4" height="6" rx="1.2" fill="var(--text)" />
      <rect x="2" y="33" width="16" height="2.5" rx="1" fill="var(--text)" />
    </svg>
  )
}
