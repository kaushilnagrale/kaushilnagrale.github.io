import type { Metadata, Viewport } from 'next'
import { IBM_Plex_Mono, Manrope } from 'next/font/google'
import localFont from 'next/font/local'
import { ThemeProvider } from 'next-themes'
import { SITE_URL } from '@/lib/site'
import './globals.css'

// D-03 · Archivo at width 125 for headlines and width 75 for numbers, Manrope for body, Plex Mono for labels.
// Archivo ships as three static Latin instances (about 15 KB each) instead of the 90 KB variable font,
// and only the H1 cut is preloaded, which keeps the LCP text fast.
const archivoHeavy = localFont({
  src: './fonts/ArchivoExpanded-ExtraBold.woff2',
  weight: '800',
  variable: '--font-archivo-heavy',
  display: 'swap',
  preload: true,
})
const archivoWide = localFont({
  src: './fonts/ArchivoExpanded-Bold.woff2',
  weight: '700',
  variable: '--font-archivo-wide',
  display: 'swap',
  preload: false,
})
const archivoNarrow = localFont({
  src: './fonts/ArchivoCondensed-Bold.woff2',
  weight: '700',
  variable: '--font-archivo-narrow',
  display: 'swap',
  preload: false,
})
const manrope = Manrope({ subsets: ['latin'], variable: '--font-manrope', display: 'swap' })
const plexMono = IBM_Plex_Mono({ subsets: ['latin'], weight: ['500'], variable: '--font-plex-mono', display: 'swap', preload: false })

const title = 'Kaushil Nagrale · Software Engineer'
const description = 'Kaushil Nagrale, Software Engineer in Tempe, AZ. Spring Boot microservices, data pipelines and LLM/RAG systems on Azure and AWS, with live demos and the architecture underneath.'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: title, template: '%s · Kaushil Nagrale' },
  description,
  applicationName: 'Kaushil Nagrale',
  authors: [{ name: 'Kaushil Nagrale' }],
  openGraph: { type: 'website', siteName: 'Kaushil Nagrale', title, description, locale: 'en_US' },
  twitter: { card: 'summary_large_image', title, description },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#070B14' },
    { media: '(prefers-color-scheme: light)', color: '#F2F5FA' },
  ],
}

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${archivoHeavy.variable} ${archivoWide.variable} ${archivoNarrow.variable} ${manrope.variable} ${plexMono.variable}`}>
      <body>
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <ThemeProvider attribute="data-theme" defaultTheme="system" enableSystem disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
