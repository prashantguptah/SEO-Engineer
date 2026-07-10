import type { PageContext } from '../../types/seo'
import { createEmptyEnrichment } from '../../utils/enrich'

export function createMockContext(overrides: Partial<PageContext> = {}): PageContext {
  const enrichment = createEmptyEnrichment()
  return {
    url: 'https://example.com/blog/seo-guide',
    origin: 'https://example.com',
    hostname: 'example.com',
    pathname: '/blog/seo-guide',
    protocol: 'https:',
    isHttps: true,
    html: '<html><head><title>Test</title></head><body></body></html>',
    title: 'Complete SEO Guide for Beginners 2026',
    meta: {
      description:
        'Learn how to improve your website SEO with this comprehensive beginner guide covering titles, meta tags, and content strategy.',
      viewport: 'width=device-width, initial-scale=1',
    },
    linkRels: [{ rel: 'canonical', href: 'https://example.com/blog/seo-guide' }],
    headings: [
      { level: 1, text: 'Complete SEO Guide for Beginners' },
      { level: 2, text: 'Keyword research basics' },
      { level: 2, text: 'On-page SEO checklist' },
    ],
    links: [
      {
        href: 'https://example.com/about',
        text: 'About',
        rel: '',
        isInternal: true,
        isExternal: false,
        isNofollow: false,
      },
    ],
    images: [],
    bodyText:
      'This complete SEO guide for beginners covers keyword research, on-page SEO checklist, and content strategy. SEO guide tips help rankings. Keyword research is essential for SEO guide success.',
    firstParagraph: 'This complete SEO guide for beginners covers keyword research.',
    lastParagraph: 'Keyword research is essential for SEO guide success.',
    paragraphs: [
      'This complete SEO guide for beginners covers keyword research.',
      'Keyword research is essential for SEO guide success.',
    ],
    scripts: [],
    scriptSrcs: [],
    stylesheets: [],
    jsonLd: [{ '@type': 'Article', headline: 'SEO Guide' }],
    microdataTypes: [],
    wordCount: 40,
    favicon: 'https://example.com/favicon.ico',
    ...enrichment,
    ...overrides,
  }
}
