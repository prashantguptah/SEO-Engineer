import { describe, it, expect } from 'vitest'
import { diffReports } from '../../utils/report-diff'
import type { SeoReport } from '../../types/report'
import type { Issue } from '../../types/analyzer'

function makeReport(overrides: Partial<SeoReport> & { recommendations?: Issue[] }): SeoReport {
  return {
    url: 'https://example.com/page',
    title: 'Example',
    favicon: '',
    analyzedAt: '2026-07-11T10:00:00.000Z',
    durationMs: 100,
    pageType: 'blog',
    scores: {
      overall: 70,
      content: 70,
      technical: 70,
      performance: 70,
      accessibility: 70,
    },
    rankReasons: [],
    positives: [],
    sections: {},
    recommendations: [],
    ...overrides,
  }
}

describe('diffReports', () => {
  it('detects fixed, new, and still-open issues', () => {
    const previous = makeReport({
      analyzedAt: '2026-07-11T09:00:00.000Z',
      scores: { overall: 60, content: 60, technical: 60, performance: 60, accessibility: 60 },
      recommendations: [
        {
          id: 'missing-h1',
          severity: 'high',
          problem: 'No H1',
          whyItMatters: '',
          suggestedFix: '',
        },
        {
          id: 'no-canonical',
          severity: 'medium',
          problem: 'No canonical',
          whyItMatters: '',
          suggestedFix: '',
        },
      ],
    })

    const current = makeReport({
      analyzedAt: '2026-07-11T10:00:00.000Z',
      scores: { overall: 75, content: 70, technical: 80, performance: 70, accessibility: 70 },
      recommendations: [
        {
          id: 'no-canonical',
          severity: 'medium',
          problem: 'No canonical',
          whyItMatters: '',
          suggestedFix: '',
        },
        {
          id: 'missing-meta-desc',
          severity: 'high',
          problem: 'Missing meta',
          whyItMatters: '',
          suggestedFix: '',
        },
      ],
    })

    const diff = diffReports(previous, current)
    expect(diff.scoreDelta).toBe(15)
    expect(diff.fixed.map((i) => i.id)).toEqual(['missing-h1'])
    expect(diff.newIssues.map((i) => i.id)).toEqual(['missing-meta-desc'])
    expect(diff.stillOpen.map((i) => i.id)).toEqual(['no-canonical'])
  })
})
