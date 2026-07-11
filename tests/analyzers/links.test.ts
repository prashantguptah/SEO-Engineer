import { describe, it, expect } from 'vitest'
import { analyzeLinks } from '../../analyzers/links'
import { createMockContext } from '../helpers/mockContext'

describe('analyzeLinks internal table', () => {
  it('aggregates internal destinations with depth and anchors', () => {
    const result = analyzeLinks(
      createMockContext({
        links: [
          {
            href: 'https://example.com/about',
            text: 'About us',
            rel: '',
            isInternal: true,
            isExternal: false,
            isNofollow: false,
            selector: 'a.about',
          },
          {
            href: 'https://example.com/about',
            text: 'About',
            rel: '',
            isInternal: true,
            isExternal: false,
            isNofollow: false,
          },
          {
            href: 'https://example.com/blog/seo',
            text: 'click here',
            rel: '',
            isInternal: true,
            isExternal: false,
            isNofollow: false,
          },
          {
            href: 'https://other.com/x',
            text: 'External',
            rel: '',
            isInternal: false,
            isExternal: true,
            isNofollow: false,
          },
        ],
      }),
    )

    const data = result.data as {
      internalTable: { path: string; count: number; depth: number; weakAnchors: number }[]
      uniqueInternalDestinations: number
      weakAnchorDestinations: number
    }

    expect(data.uniqueInternalDestinations).toBe(2)
    const about = data.internalTable.find((r) => r.path === '/about')
    expect(about?.count).toBe(2)
    expect(about?.depth).toBe(1)
    expect(data.weakAnchorDestinations).toBeGreaterThanOrEqual(1)
    expect(result.issues.some((i) => i.id === 'weak-anchors')).toBe(false) // only 1 weak dest
  })
})
