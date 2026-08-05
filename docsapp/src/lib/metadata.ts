import type { Metadata } from 'next/types'

import { appName, baseUrl, gitConfig } from '@/lib/constants'
import { PageExtended } from '@/lib/source'

export function createMetadata(override: Metadata): Metadata {
  return {
    ...override,
    openGraph: {
      title: override.title ?? undefined,
      description: override.description ?? undefined,
      url: baseUrl,
      images: '/images/banner.png',
      siteName: appName,
      ...override.openGraph,
    },
    twitter: {
      card: 'summary_large_image',
      creator: gitConfig.user,
      title: override.title ?? undefined,
      description: override.description ?? undefined,
      images: '/images/banner.png',
      ...override.twitter,
    },
  }
}

export function getPageImageUrl(page: PageExtended) {
  const slugs = [...page?.slugs || []]
  const segments = [...slugs, 'image.webp']
  const url = '/' + [page.locale, 'og', ...segments].filter(Boolean).join('/')

  return {
    segments,
    url,
  }
}
