import type { PageContext } from '../types/seo'
import type { AnalyzerResult } from '../types/analyzer'
import { scoreFromChecks } from '../utils/helpers'

export function analyzeLinks(ctx: PageContext): AnalyzerResult {
  const internal = ctx.links.filter((l) => l.isInternal)
  const external = ctx.links.filter((l) => l.isExternal)
  const nofollow = ctx.links.filter((l) => l.isNofollow)
  const emptyAnchor = ctx.links.filter((l) => !l.text.trim())

  const broken = ctx.brokenLinks.filter((l) => l.broken)
  const brokenCount = broken.length
  const checkedCount = ctx.brokenLinks.length

  const anchorTexts = ctx.links
    .filter((l) => l.text.trim())
    .slice(0, 20)
    .map((l) => ({
      text: l.text.slice(0, 60),
      href: l.href,
      type: l.isInternal ? 'internal' : l.isExternal ? 'external' : 'other',
    }))

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

  if (brokenCount > 0) {
    issues.push({
      id: 'broken-links',
      severity: 'high' as const,
      problem: `${brokenCount} broken internal link(s) detected (of ${checkedCount} checked)`,
      whyItMatters: 'Broken links waste crawl budget and hurt user experience.',
      suggestedFix: 'Fix or remove broken internal links.',
      category: 'links',
      elementSelector: broken[0]?.selector,
    })
  } else if (checkedCount > 0) {
    strengths.push('internal-links-good')
  }

  const score = scoreFromChecks(
    [
      internal.length >= 2,
      internal.length >= 5,
      external.length > 0,
      emptyAnchor.length === 0,
      ctx.links.length > 0,
      checkedCount === 0 || brokenCount === 0,
    ],
    [2, 1, 1, 2, 1, 2],
  )

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
      brokenLinks: brokenCount,
      brokenLinksChecked: checkedCount,
      brokenLinkDetails: broken.slice(0, 5),
      enrichSkipped: ctx.enrichSkipped?.includes('broken-links') ?? false,
      anchorTexts,
    },
    issues,
    strengths,
  }
}
