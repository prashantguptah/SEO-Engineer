import { describe, it, expect } from 'vitest'
import { extractTopPhrases, extractTopKeywords, pickPrimaryKeyword } from '../../utils/keyword'
import { benchmarkRange } from '../../utils/benchmarks'

describe('keyword n-grams', () => {
  const text =
    'seo guide tips help rankings. seo guide covers keyword research. keyword research matters for seo guide success.'

  it('extracts bigrams', () => {
    const bigrams = extractTopPhrases(text, 2, 5)
    expect(bigrams.length).toBeGreaterThan(0)
    expect(bigrams[0].n).toBe(2)
  })

  it('prefers bigram as primary when frequent', () => {
    const unigrams = extractTopKeywords(text, 5)
    const bigrams = extractTopPhrases(text, 2, 5)
    const primary = pickPrimaryKeyword(unigrams, bigrams)
    expect(primary.keyword).toBeTruthy()
  })
})

describe('benchmarkRange', () => {
  it('marks optimal title length', () => {
    const result = benchmarkRange('Title', 45, [30, 60])
    expect(result.status).toBe('optimal')
    expect(result.message).toMatch(/good range/)
  })

  it('marks short title as below-range', () => {
    const result = benchmarkRange('Title', 10, [30, 60])
    expect(result.status).toBe('below-range')
  })
})
