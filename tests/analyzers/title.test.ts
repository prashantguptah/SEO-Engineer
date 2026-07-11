import { describe, it, expect } from 'vitest'
import { analyzeTitle } from '../../analyzers/title'
import { createMockContext } from '../helpers/mockContext'

describe('analyzeTitle', () => {
  it('scores optimal title and meta lengths as strengths', () => {
    const result = analyzeTitle(createMockContext())
    expect(result.strengths).toContain('title-optimized')
    expect(result.positives?.some((p) => p.id === 'title-length')).toBe(true)
    expect(result.data).toHaveProperty('serpPreview')
  })

  it('flags missing title', () => {
    const result = analyzeTitle(createMockContext({ title: '' }))
    expect(result.issues.some((i) => i.id === 'missing-title')).toBe(true)
  })

  it('flags short title with benchmark message', () => {
    const result = analyzeTitle(createMockContext({ title: 'Short title' }))
    const issue = result.issues.find((i) => i.id === 'title-short')
    expect(issue).toBeDefined()
    expect(issue?.problem).toMatch(/good range|recommended/i)
  })

  it('flags missing meta description', () => {
    const result = analyzeTitle(createMockContext({ meta: { viewport: 'width=device-width' } }))
    expect(result.issues.some((i) => i.id === 'missing-meta-desc')).toBe(true)
  })

  it('builds socialPreview with OG fields and fallbacks', () => {
    const result = analyzeTitle(
      createMockContext({
        meta: {
          description:
            'Learn how to improve your website SEO with this comprehensive beginner guide covering titles, meta tags, and content strategy.',
          'og:title': 'OG SEO Title',
          'og:description': 'OG description for social sharing that is long enough.',
          'og:image': '/images/share.png',
          'og:site_name': 'Example Blog',
          'twitter:card': 'summary_large_image',
        },
      }),
    )
    const social = result.data.socialPreview as {
      openGraph: { title: string; image: string; missing: { image: boolean } }
      twitter: { card: string; title: string; missing: { card: boolean } }
    }
    expect(social.openGraph.title).toBe('OG SEO Title')
    expect(social.openGraph.image).toBe('https://example.com/images/share.png')
    expect(social.openGraph.missing.image).toBe(false)
    expect(social.twitter.card).toBe('summary_large_image')
    expect(social.twitter.missing.card).toBe(false)
    expect(social.twitter.title).toBe('OG SEO Title')
  })

  it('falls back to page title when social tags are missing', () => {
    const result = analyzeTitle(createMockContext())
    const social = result.data.socialPreview as {
      openGraph: { title: string; missing: { title: boolean; image: boolean } }
      twitter: { missing: { card: boolean } }
    }
    expect(social.openGraph.title).toContain('SEO Guide')
    expect(social.openGraph.missing.title).toBe(true)
    expect(social.openGraph.missing.image).toBe(true)
    expect(social.twitter.missing.card).toBe(true)
  })
})
