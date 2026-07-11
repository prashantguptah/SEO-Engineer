import { describe, it, expect } from 'vitest'
import { compareReports } from '../../utils/compare-reports'
import type { SeoReport } from '../../types/report'

function makeReport(partial: Partial<SeoReport>): SeoReport {
  return {
    url: 'https://a.example/',
    title: 'A',
    favicon: '',
    analyzedAt: '2026-07-11T10:00:00.000Z',
    durationMs: 100,
    pageType: 'blog',
    scores: { overall: 80, content: 80, technical: 70, performance: 60, accessibility: 90 },
    rankReasons: [],
    positives: [],
    sections: {
      content: {
        id: 'content',
        name: 'Content',
        score: 80,
        weight: 1,
        category: 'content',
        data: { wordCount: 900 },
        issues: [],
        strengths: [],
      },
    },
    recommendations: [
      {
        id: 'missing-h1',
        severity: 'high',
        problem: 'No H1',
        whyItMatters: '',
        suggestedFix: '',
      },
    ],
    ...partial,
  }
}

describe('compareReports', () => {
  it('computes score delta and issue partitions', () => {
    const a = makeReport({})
    const b = makeReport({
      url: 'https://b.example/',
      title: 'B',
      scores: { overall: 70, content: 70, technical: 70, performance: 70, accessibility: 70 },
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

    const result = compareReports(a, b)
    expect(result.scoreDelta).toBe(10)
    expect(result.inBoth.map((i) => i.id)).toContain('missing-h1')
    expect(result.onlyInB.map((i) => i.id)).toContain('no-canonical')
    expect(result.onlyInA).toHaveLength(0)
  })
})
