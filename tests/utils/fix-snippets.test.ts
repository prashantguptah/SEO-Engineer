import { describe, it, expect } from 'vitest'
import { buildFixSnippet, attachFixSnippets } from '../../utils/fix-snippets'
import { createMockContext } from '../helpers/mockContext'
import type { Issue } from '../../types/analyzer'

describe('buildFixSnippet', () => {
  it('returns title tag snippet for missing title', () => {
    const ctx = createMockContext({ title: '', targetKeyword: 'seo tools' })
    const snippet = buildFixSnippet(
      {
        id: 'missing-title',
        severity: 'high',
        problem: 'missing',
        whyItMatters: '',
        suggestedFix: '',
      },
      ctx,
    )
    expect(snippet).toContain('<title>')
    expect(snippet).toMatch(/seo tools/i)
  })

  it('returns canonical link snippet', () => {
    const ctx = createMockContext()
    const snippet = buildFixSnippet(
      {
        id: 'no-canonical',
        severity: 'medium',
        problem: 'missing',
        whyItMatters: '',
        suggestedFix: '',
      },
      ctx,
    )
    expect(snippet).toContain('rel="canonical"')
    expect(snippet).toContain(ctx.url)
  })

  it('attaches snippets to matching issues', () => {
    const issues: Issue[] = [
      {
        id: 'no-viewport',
        severity: 'high',
        problem: 'No viewport',
        whyItMatters: '',
        suggestedFix: '',
      },
      {
        id: 'many-scripts',
        severity: 'low',
        problem: 'Too many scripts',
        whyItMatters: '',
        suggestedFix: '',
      },
    ]
    const result = attachFixSnippets(issues, createMockContext())
    expect(result[0].fixSnippet).toContain('viewport')
    expect(result[1].fixSnippet).toBeUndefined()
  })
})
