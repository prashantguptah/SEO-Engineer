import type { PageContext } from '../types/seo'
import type { AnalyzerResult } from '../types/analyzer'
import { scoreFromChecks } from '../utils/helpers'

export function analyzeLinks(ctx: PageContext): AnalyzerResult {
  const internal = ctx.links.filter((l) => l.isInternal)
  const external = ctx.links.filter((l) => l.isExternal)
  const nofollow = ctx.links.filter((l) => l.isNofollow)
  const emptyAnchor = ctx.links.filter((l) => !l.text.trim())

  const anchorTexts = ctx.links
    .filter((l) => l.text.trim())
    .slice(0, 20)
    .map((l) => ({ text: l.text.slice(0, 60), href: l.href, type: l.isInternal ? 'internal' : l.isExternal ? 'external' : 'other' }))

  const issues = []
  const strengths: string[] = []

  if (internal.length >= 3) strengths.push('internal-links-good')

  if (internal.length < 2 && ctx.links.length > 0) {
    issues.push({
      id: 'few-internal-links',
      severity: 'medium' as const,
      problem: `Only ${internal.length} internal link(s) found`,
      whyItMatters: 'Internal links distribute authority and aid crawling.',
      suggestedFix: 'Add relevant internal links to related content.',
      category: 'links',
    })
  }

  if (emptyAnchor.length > 0) {
    issues.push({
      id: 'empty-anchor',
      severity: 'medium' as const,
      problem: `${emptyAnchor.length} link(s) with empty anchor text`,
      whyItMatters: 'Descriptive anchor text helps users and search engines.',
      suggestedFix: 'Add meaningful anchor text to all links.',
      category: 'links',
    })
  }

  const score = scoreFromChecks([
    internal.length >= 2,
    internal.length >= 5,
    external.length > 0,
    emptyAnchor.length === 0,
    ctx.links.length > 0,
  ], [2, 1, 1, 2, 1])

  return {
    id: 'links',
    name: 'Links',
    score,
    weight: 0.8,
    category: 'content',
    data: {
      total: ctx.links.length,
      internal: internal.length,
      external: external.length,
      nofollow: nofollow.length,
      brokenLinks: 'Not checked (requires network requests)',
      anchorTexts,
    },
    issues,
    strengths,
  }
}
