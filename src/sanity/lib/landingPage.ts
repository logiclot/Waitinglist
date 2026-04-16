import { client } from './client'

export interface LandingPageContent {
  title: string
  slug: string
  heroHeadline: string
  heroSubheading: string
  trustStats: string[] | null
  searchPlaceholder: string | null
  ctaLabel: string | null
  worksWith: string[] | null
  metaTitle: string | null
  metaDescription: string | null
  noIndex: boolean | null
}

const landingPageBySlugQuery = `*[_type == "landingPage" && slug.current == $slug][0]{
  title,
  "slug": slug.current,
  heroHeadline,
  heroSubheading,
  trustStats,
  searchPlaceholder,
  ctaLabel,
  worksWith,
  metaTitle,
  metaDescription,
  noIndex
}`

const allLandingPageSlugsQuery = `*[_type == "landingPage" && defined(slug.current)][].slug.current`

export async function getLandingPageBySlug(
  slug: string,
): Promise<LandingPageContent | null> {
  return client.fetch<LandingPageContent | null>(
    landingPageBySlugQuery,
    { slug },
    { next: { tags: [`landingPage:${slug}`] } },
  )
}

export async function getAllLandingPageSlugs(): Promise<string[]> {
  return client.fetch<string[]>(
    allLandingPageSlugsQuery,
    {},
    { next: { tags: ['landingPage'] } },
  )
}
