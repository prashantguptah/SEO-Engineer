import type { PageContext } from '../types/seo'
import type { AnalyzerResult } from '../types/analyzer'
import { getMetaContent, scoreFromChecks } from '../utils/helpers'

export function analyzeTechnical(ctx: PageContext): AnalyzerResult {
  const canonical = ctx.linkRels.find((l) => l.rel === 'canonical')?.href || ''
  const robots = getMetaContent(ctx.meta, 'robots')
  const viewport = getMetaContent(ctx.meta, 'viewport')
  const noindex = robots.toLowerCase().includes('noindex')
  const description = getMetaContent(ctx.meta, 'description')

  const titleCount = (ctx.html.match(/<title/gi) || []).length
  const metaDescCount = (ctx.html.match(/name=["']description["']/gi) || []).length

  const indexable = !noindex
  const issues = []
  const strengths: string[] = []

  if (ctx.isHttps) strengths.push('https-enabled')
  if (canonical) strengths.push('metadata-proper')

  if (noindex) {
    issues.push({
      id: 'noindex',
      severity: 'high' as const,
      problem: 'Page has noindex directive',
      whyItMatters: 'noindex prevents the page from appearing in search results.',
      suggestedFix: 'Remove noindex if you want this page indexed.',
      category: 'technical',
    })
  }

  if (titleCount > 1) {
    issues.push({
      id: 'duplicate-title',
      severity: 'medium' as const,
      problem: 'Multiple title tags detected',
      whyItMatters: 'Duplicate titles confuse search engines.',
      suggestedFix: 'Ensure only one <title> tag exists.',
      category: 'technical',
    })
  }

  if (metaDescCount > 1) {
    issues.push({
      id: 'duplicate-meta',
      severity: 'low' as const,
      problem: 'Multiple meta description tags detected',
      whyItMatters: 'Duplicate meta descriptions reduce clarity.',
      suggestedFix: 'Keep only one meta description tag.',
      category: 'technical',
    })
  }

  const score = scoreFromChecks([
    ctx.isHttps,
    !!canonical,
    !!viewport,
    indexable,
    titleCount === 1,
    metaDescCount <= 1,
    !!description,
  ], [2, 2, 2, 3, 1, 1, 1])

  return {
    id: 'technical',
    name: 'Technical SEO',
    score,
    weight: 1.2,
    category: 'technical',
    data: {
      https: ctx.isHttps,
      canonical: canonical || 'Not set',
      robots: robots || 'Not set',
      noindex,
      viewport: viewport || 'Not set',
      duplicateTitle: titleCount > 1,
      duplicateMeta: metaDescCount > 1,
      indexable,
    },
    issues,
    strengths,
  }
}
