import { describe, it, expect } from 'vitest'
import { analyzeKeywords } from '../../analyzers/keywords'
import { createMockContext } from '../helpers/mockContext'

describe('analyzeKeywords', () => {
  it('extracts unigrams and phrases', () => {
    const result = analyzeKeywords(createMockContext())
    const data = result.data as {
      topKeywords: unknown[]
      topBigrams: unknown[]
      primaryKeyword: string
    }
    expect(data.topKeywords.length).toBeGreaterThan(0)
    expect(data.topBigrams.length).toBeGreaterThan(0)
    expect(data.primaryKeyword).toBeTruthy()
  })

  it('uses custom target keyword when provided', () => {
    const result = analyzeKeywords(
      createMockContext({ targetKeyword: 'seo guide' }),
    )
    const data = result.data as {
      primaryKeyword: string
      primaryType: string
      customTarget: boolean
      placement: Record<string, boolean>
    }
    expect(data.primaryKeyword).toBe('seo guide')
    expect(data.primaryType).toBe('target')
    expect(data.customTarget).toBe(true)
    expect(data.placement.inTitle).toBe(true)
    expect(data.placement.inH1).toBe(true)
  })

  it('flags target keyword missing from title', () => {
    const result = analyzeKeywords(
      createMockContext({
        targetKeyword: 'quantum computing',
        title: 'Complete SEO Guide for Beginners 2026',
      }),
    )
    expect(result.issues.some((i) => i.id === 'keyword-not-in-title')).toBe(true)
  })
})
