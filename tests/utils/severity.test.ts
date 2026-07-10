import { describe, it, expect } from 'vitest'
import { tuneSeverity } from '../../utils/severity'
import { createMockContext } from '../helpers/mockContext'
import type { Issue } from '../../types/analyzer'

describe('tuneSeverity', () => {
  it('downgrades noindex on utility pages', () => {
    const issue: Issue = {
      id: 'noindex',
      severity: 'high',
      problem: 'Page has noindex',
      whyItMatters: 'Blocks indexing',
      suggestedFix: 'Remove noindex',
    }
    const tuned = tuneSeverity(issue, createMockContext({ pageType: 'utility', pathname: '/thank-you' }))
    expect(tuned.severity).toBe('low')
    expect(tuned.severityReason).toBeTruthy()
  })

  it('keeps noindex high on blog pages', () => {
    const issue: Issue = {
      id: 'noindex',
      severity: 'medium',
      problem: 'Page has noindex',
      whyItMatters: 'Blocks indexing',
      suggestedFix: 'Remove noindex',
    }
    const tuned = tuneSeverity(issue, createMockContext({ pageType: 'blog' }))
    expect(tuned.severity).toBe('high')
  })

  it('downgrades thin content on homepage', () => {
    const issue: Issue = {
      id: 'thin-content',
      severity: 'high',
      problem: 'Thin content',
      whyItMatters: 'Ranks poorly',
      suggestedFix: 'Add content',
    }
    const tuned = tuneSeverity(issue, createMockContext({ pageType: 'homepage', pathname: '/' }))
    expect(tuned.severity).toBe('low')
  })
})
