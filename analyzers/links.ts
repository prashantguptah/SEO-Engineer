import type { PageContext, LinkItem } from '../types/seo'
import type { AnalyzerResult } from '../types/analyzer'
import { scoreFromChecks } from '../utils/helpers'

const WEAK_ANCHORS = new Set([
  'click here',
  'here',
  'read more',
  'learn more',
  'more',
  'link',
  'this',
  'this page',
  'this link',
  'website',
  'page',
])

export interface InternalLinkRow {
  href: string
  path: string
  depth: number
  count: number
  anchors: string[]
  weakAnchors: number
  emptyAnchors: number
  nofollow: boolean
  selector?: string
}

function pathDepth(pathname: string): number {
  return pathname.split('/').filter(Boolean).length
}

function isWeakAnchor(text: string): boolean {
  const t = text.trim().toLowerCase().replace(/\s+/g, ' ')
  if (!t) return false
  return WEAK_ANCHORS.has(t) || t.length < 3
}

function buildInternalTable(links: LinkItem[], origin: string): InternalLinkRow[] {
  const map = new Map<string, InternalLinkRow>()

  for (const link of links.filter((l) => l.isInternal)) {
    let href = link.href
    let path = link.href
    try {
      const u = new URL(link.href, origin)
      href = u.origin === origin ? `${u.pathname}${u.search}` : u.href
      path = u.pathname || '/'
    } catch {
      path = link.href.split('?')[0] || link.href
    }

    const key = href
    const existing = map.get(key)
    const text = link.text.trim()
    if (existing) {
      existing.count++
      if (text && !existing.anchors.includes(text) && existing.anchors.length < 5) {
        existing.anchors.push(text.slice(0, 60))
      }
      if (!text) existing.emptyAnchors++
      else if (isWeakAnchor(text)) existing.weakAnchors++
      if (link.isNofollow) existing.nofollow = true
      if (!existing.selector && link.selector) existing.selector = link.selector
    } else {
      map.set(key, {
        href,
        path,
        depth: pathDepth(path),
        count: 1,
        anchors: text ? [text.slice(0, 60)] : [],
        weakAnchors: text && isWeakAnchor(text) ? 1 : 0,
        emptyAnchors: text ? 0 : 1,
        nofollow: link.isNofollow,
        selector: link.selector,
      })
    }
  }

  return [...map.values()].sort((a, b) => b.count - a.count || a.path.localeCompare(b.path))
}

export function analyzeLinks(ctx: PageContext): AnalyzerResult {
  const internal = ctx.links.filter((l) => l.isInternal)
  const external = ctx.links.filter((l) => l.isExternal)
  const nofollow = ctx.links.filter((l) => l.isNofollow)
  const emptyAnchor = ctx.links.filter((l) => !l.text.trim())

  const broken = ctx.brokenLinks.filter((l) => l.broken)
  const brokenCount = broken.length
  const checkedCount = ctx.brokenLinks.length

  const internalTable = buildInternalTable(ctx.links, ctx.origin)
  const weakInternal = internalTable.filter((r) => r.weakAnchors > 0 || r.emptyAnchors > 0)
  const linkedOnce = internalTable.filter((r) => r.count === 1)

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

  if (weakInternal.length >= 3) {
    issues.push({
      id: 'weak-anchors',
      severity: 'low' as const,
      problem: `${weakInternal.length} internal destination(s) use weak or empty anchor text`,
      whyItMatters: 'Generic anchors like “click here” waste relevance signals.',
      suggestedFix: 'Use descriptive anchors that match the destination topic.',
      category: 'links',
      elementSelector: weakInternal[0]?.selector,
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
      weakInternal.length < 3,
    ],
    [2, 1, 1, 2, 1, 2, 1],
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
      internalTable: internalTable.slice(0, 40),
      uniqueInternalDestinations: internalTable.length,
      linkedOnceCount: linkedOnce.length,
      weakAnchorDestinations: weakInternal.length,
    },
    issues,
    strengths,
  }
}
