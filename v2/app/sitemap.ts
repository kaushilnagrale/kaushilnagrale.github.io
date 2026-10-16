import type { MetadataRoute } from 'next'
import { BUILD_TIME, SITE_URL } from '@/lib/site'

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date(BUILD_TIME)
  return [
    { url: `${SITE_URL}/`, lastModified, changeFrequency: 'weekly', priority: 1 },
    { url: `${SITE_URL}/cv`, lastModified, changeFrequency: 'monthly', priority: 0.6 },
  ]
}
