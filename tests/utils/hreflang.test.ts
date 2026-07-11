import { describe, it, expect } from 'vitest'
import { analyzeHreflangEntries, isValidHreflangCode } from '../../utils/hreflang'
import { analyzeHreflang } from '../../analyzers/hreflang'
import { createMockContext } from '../helpers/mockContext'

describe('hreflang helpers', () => {
  it('validates language codes', () => {
    expect(isValidHreflangCode('en')).toBe(true)
    expect(isValidHreflangCode('en-US')).toBe(true)
    expect(isValidHreflangCode('x-default')).toBe(true)
    expect(isValidHreflangCode('english')).toBe(false)
  })

  it('detects missing x-default and self reference', () => {
    const result = analyzeHreflangEntries(
      [
        { lang: 'en', href: 'https://example.com/en' },
        { lang: 'fr', href: 'https://example.com/fr' },
      ],
      'https://example.com/en',
    )
    expect(result.hasXDefault).toBe(false)
    expect(result.selfReference).toBe(true)
  })
})

describe('analyzeHreflang', () => {
  it('does not flag absence as an issue', () => {
    const result = analyzeHreflang(createMockContext({ hreflang: [] }))
    expect(result.issues).toHaveLength(0)
    expect(result.data.count).toBe(0)
  })

  it('flags missing x-default when annotations exist', () => {
    const result = analyzeHreflang(
      createMockContext({
        url: 'https://example.com/en',
        hreflang: [
          { lang: 'en', href: 'https://example.com/en' },
          { lang: 'de', href: 'https://example.com/de' },
        ],
      }),
    )
    expect(result.issues.some((i) => i.id === 'hreflang-no-x-default')).toBe(true)
  })
})
