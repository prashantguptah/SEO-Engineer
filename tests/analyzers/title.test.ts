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
})
