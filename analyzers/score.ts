import type { AnalyzerResult, Issue } from '../types/analyzer'
import type { ScoreBreakdown } from '../types/report'
import { clamp, sortBySeverity } from '../utils/helpers'

const STRENGTH_LABELS: Record<string, string> = {
  'https-enabled': 'HTTPS enabled',
  'title-optimized': 'Optimized page title',
  'heading-hierarchy': 'Strong heading hierarchy',
  'content-comprehensive': 'Comprehensive article',
  'internal-links-good': 'Good internal linking',
  'faq-schema': 'FAQ Schema detected',
  'mobile-friendly': 'Mobile friendly',
  'metadata-proper': 'Proper metadata',
  'images-optimized': 'Optimized images',
  'readability-high': 'High readability',
  'keyword-placement': 'Strong keyword placement',
  'author-present': 'Author information present',
  'date-present': 'Publish date present',
  'breadcrumb-present': 'Breadcrumb navigation',
  'toc-present': 'Table of contents',
}

export function computeScores(results: AnalyzerResult[]): ScoreBreakdown {
  const categoryMap: Record<string, string[]> = {
    content: ['content', 'keywords', 'headings', 'images', 'eeat', 'ux'],
    technical: ['basic', 'title', 'schema', 'technical', 'technology'],
    performance: ['performance'],
    accessibility: ['accessibility', 'mobile'],
  }

  const avg = (ids: string[]) => {
    const subset = results.filter((r) => ids.includes(r.id))
    if (subset.length === 0) return 0
    const totalWeight = subset.reduce((s, r) => s + r.weight, 0)
    const weighted = subset.reduce((s, r) => s + r.score * r.weight, 0)
    return clamp(weighted / totalWeight)
  }

  const content = avg(categoryMap.content)
  const technical = avg(categoryMap.technical)
  const performance = avg(categoryMap.performance)
  const accessibility = avg(categoryMap.accessibility)
  const overall = clamp(content * 0.35 + technical * 0.3 + performance * 0.15 + accessibility * 0.2)

  return { overall, content, technical, performance, accessibility }
}

export function generateRankReasons(results: AnalyzerResult[]): string[] {
  const reasons: string[] = []
  const seen = new Set<string>()

  for (const result of results) {
    for (const strength of result.strengths) {
      const label = STRENGTH_LABELS[strength]
      if (label && !seen.has(label)) {
        seen.add(label)
        reasons.push(label)
      }
    }
  }

  if (reasons.length === 0) {
    reasons.push('Page has indexable content')
  }

  return reasons
}

export function generateRecommendations(results: AnalyzerResult[]): Issue[] {
  const allIssues = results.flatMap((r) => r.issues)
  return sortBySeverity(allIssues)
}
