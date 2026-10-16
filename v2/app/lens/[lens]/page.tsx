import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { HomePage } from '@/components/HomePage'
import { isLens, lenses } from '@/lib/content'

// R-01 · Reached through the `/?lens=` rewrite in next.config.ts. Each lens is prerendered.
export function generateStaticParams() {
  return [{ lens: 'data' }, { lens: 'ml' }, { lens: 'swe' }]
}

export async function generateMetadata({ params }: PageProps<'/lens/[lens]'>): Promise<Metadata> {
  const { lens } = await params
  if (!isLens(lens) || lens === 'all') return {}
  return {
    title: { absolute: `Kaushil Nagrale · ${lenses[lens].label} lens` },
    description: lenses[lens].hero ?? undefined,
    alternates: { canonical: '/' },
  }
}

export default async function LensPage({ params }: PageProps<'/lens/[lens]'>) {
  const { lens } = await params
  if (!isLens(lens) || lens === 'all') notFound()
  return <HomePage lens={lens} />
}
