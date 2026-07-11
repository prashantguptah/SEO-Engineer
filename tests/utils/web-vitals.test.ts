import { describe, it, expect } from 'vitest'
import { rateMetric, CWV_THRESHOLDS } from '../../utils/web-vitals'
import { analyzePerformance } from '../../analyzers/performance'
import { createMockContext } from '../helpers/mockContext'

describe('rateMetric', () => {
  it('rates LCP thresholds', () => {
    expect(rateMetric(2000, CWV_THRESHOLDS.lcpGoodMs, CWV_THRESHOLDS.lcpPoorMs)).toBe('good')
    expect(rateMetric(3000, CWV_THRESHOLDS.lcpGoodMs, CWV_THRESHOLDS.lcpPoorMs)).toBe(
      'needs-improvement',
    )
    expect(rateMetric(5000, CWV_THRESHOLDS.lcpGoodMs, CWV_THRESHOLDS.lcpPoorMs)).toBe('poor')
    expect(rateMetric(null, CWV_THRESHOLDS.lcpGoodMs, CWV_THRESHOLDS.lcpPoorMs)).toBe(null)
  })
})

describe('analyzePerformance web vitals', () => {
  it('flags slow lab LCP and CLS', () => {
    const result = analyzePerformance(
      createMockContext({
        webVitals: {
          lcpMs: 4200,
          lcpRating: 'poor',
          cls: 0.28,
          clsRating: 'poor',
          inpMs: null,
          inpRating: null,
          ttfbMs: 200,
          ttfbRating: 'good',
          note: 'lab-only',
        },
      }),
    )
    expect(result.issues.some((i) => i.id === 'lcp-slow')).toBe(true)
    expect(result.issues.some((i) => i.id === 'cls-high')).toBe(true)
    expect((result.data as { webVitals: { lcpMs: number } }).webVitals.lcpMs).toBe(4200)
  })
})
