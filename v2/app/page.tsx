import type { Metadata } from 'next'
import { HomePage } from '@/components/HomePage'

export const metadata: Metadata = {
  alternates: { canonical: '/' },
}

// Outreach links use /?lens=ml (R-07); a static host cannot rewrite them, so send them to the lens page.
const LENS_REDIRECT = `(function(){var p=new URLSearchParams(location.search),l=p.get('lens');if(l==='data'||l==='ml'||l==='swe'){p.delete('lens');var q=p.toString();location.replace('/lens/'+l+'/'+(q?'?'+q:'')+location.hash)}})()`

export default function Page() {
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: LENS_REDIRECT }} />
      <HomePage lens="all" />
    </>
  )
}
