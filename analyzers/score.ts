import type { AnalyzerResult, Issue, PositiveNote } from '../types/analyzer'
import type { ScoreBreakdown } from '../types/report'
import type { PageContext, PageType } from '../types/seo'
import { clamp, sortBySeverity } from '../utils/helpers'
import { tuneAllIssues } from '../utils/severity'
import { attachFixSnippets } from '../utils/fix-snippets'

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

const OVERALL_WEIGHTS: Record<PageType, ScoreBreakdown> = {
  blog: { overall: 0, content: 0.45, technical: 0.25, performance: 0.1, accessibility: 0.2 },
  product: { overall: 0, content: 0.3, technical: 0.35, performance: 0.2, accessibility: 0.15 },
  homepage: { overall: 0, content: 0.25, technical: 0.35, performance: 0.2, accessibility: 0.2 },
  utility: { overall: 0, content: 0.1, technical: 0.4, performance: 0.3, accessibility: 0.2 },
  unknown: { overall: 0, content: 0.35, technical: 0.3, performance: 0.15, accessibility: 0.2 },
}

const ANALYZER_WEIGHT_MULTIPLIERS: Record<PageType, Record<string, number>> = {
  blog: { eeat: 1.5, content: 1.3, keywords: 1.2, schema: 1.2 },
  product: { schema: 1.5, images: 1.3, title: 1.2, technical: 1.2 },
  homepage: { technical: 1.3, performance: 1.2, schema: 1.3 },
  utility: { technical: 1.5, performance: 1.3 },
  unknown: {},
}

export function computeScores(results: AnalyzerResult[], pageType: PageType): ScoreBreakdown {
  const categoryMap: Record<string, string[]> = {
    content: ['content', 'keywords', 'headings', 'images', 'eeat', 'ux'],
    technical: ['basic', 'title', 'schema', 'technical', 'technology', 'hreflang'],
    performance: ['performance'],
    accessibility: ['accessibility', 'mobile'],
  }

  const multipliers = ANALYZER_WEIGHT_MULTIPLIERS[pageType] ?? {}

  const avg = (ids: string[]) => {
    const subset = results.filter((r) => ids.includes(r.id))
    if (subset.length === 0) return 0
    let totalWeight = 0
    let weighted = 0
    for (const r of subset) {
      const w = r.weight * (multipliers[r.id] ?? 1)
      totalWeight += w
      weighted += r.score * w
    }
    return clamp(weighted / totalWeight)
  }

  const content = avg(categoryMap.content)
  const technical = avg(categoryMap.technical)
  const performance = avg(categoryMap.performance)
  const accessibility = avg(categoryMap.accessibility)

  const weights = OVERALL_WEIGHTS[pageType] ?? OVERALL_WEIGHTS.unknown
  const overall = clamp(
    content * weights.content +
      technical * weights.technical +
      performance * weights.performance +
      accessibility * weights.accessibility,
  )

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

export function generatePositives(results: AnalyzerResult[]): PositiveNote[] {
  const positives: PositiveNote[] = []
  const seen = new Set<string>()

  for (const result of results) {
    if (result.positives) {
      for (const p of result.positives) {
        if (!seen.has(p.id)) {
          seen.add(p.id)
          positives.push(p)
        }
      }
    }
    for (const strength of result.strengths) {
      const label = STRENGTH_LABELS[strength]
      if (label && !seen.has(strength)) {
        seen.add(strength)
        positives.push({
          id: strength,
          message: label,
          category: result.id,
        })
      }
    }
  }

  return positives
}

export function generateRecommendations(results: AnalyzerResult[], ctx: PageContext): Issue[] {
  const allIssues = results.flatMap((r) => r.issues)
  const tuned = tuneAllIssues(allIssues, ctx)
  return attachFixSnippets(sortBySeverity(tuned), ctx)
}

export function getPageTypeLabel(pageType: PageType): string {
  const labels: Record<PageType, string> = {
    blog: 'Blog / Article',
    product: 'Product Page',
    homepage: 'Homepage',
    utility: 'Utility Page',
    unknown: 'General Page',
  }
  return labels[pageType]
}
