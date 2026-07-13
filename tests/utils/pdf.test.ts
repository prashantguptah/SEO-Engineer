import { describe, it, expect } from 'vitest'
import { buildBrandedReportHtml } from '../../utils/pdf'
import type { SeoReport } from '../../types/report'

function makeReport(): SeoReport {
  return {
    url: 'https://example.com/page',
    title: 'Example Page Title',
    favicon: '',
    analyzedAt: '2026-07-11T10:00:00.000Z',
    durationMs: 1200,
    pageType: 'blog',
    scores: { overall: 72, content: 70, technical: 75, performance: 60, accessibility: 80 },
    rankReasons: ['HTTPS enabled', 'Strong heading hierarchy'],
    positives: [{ id: 'a', message: 'Good title length' }],
    sections: {},
    recommendations: [
      {
        id: 'missing-h1',
        severity: 'high',
        problem: 'No H1 heading found',
        whyItMatters: 'H1 matters',
        suggestedFix: 'Add an H1',
      },
      {
        id: 'meta-desc-short',
        severity: 'medium',
        problem: 'Meta description is short',
        whyItMatters: 'CTR',
        suggestedFix: 'Expand description',
      },
    ],
  }
}

describe('buildBrandedReportHtml', () => {
  it('includes brand, executive summary, scores, and top fixes', () => {
    const html = buildBrandedReportHtml(makeReport())
    expect(html).toContain('keywordwalks')
    expect(html).toContain('Executive summary')
    expect(html).toContain('Score breakdown')
    expect(html).toContain('Top fixes')
    expect(html).toContain('No H1 heading found')
    expect(html).toContain('Example Page Title')
    expect(html).toContain('72')
  })
})
