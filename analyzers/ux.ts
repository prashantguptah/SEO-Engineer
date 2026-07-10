import type { PageContext } from '../types/seo'
import type { AnalyzerResult } from '../types/analyzer'
import { scoreFromChecks } from '../utils/helpers'

export function analyzeUxSignals(ctx: PageContext): AnalyzerResult {
  const html = ctx.html.toLowerCase()

  const tableOfContents =
    html.includes('table-of-contents') ||
    html.includes('table_of_contents') ||
    html.includes('id="toc"') ||
    html.includes('class="toc"') ||
    html.includes('wp-block-table-of-contents')

  const breadcrumb =
    html.includes('breadcrumb') ||
    ctx.microdataTypes.some((t) => t.toLowerCase().includes('breadcrumb')) ||
    html.includes('aria-label="breadcrumb"')

  const stickyNav =
    html.includes('position: sticky') ||
    html.includes('position:sticky') ||
    html.includes('sticky-nav') ||
    html.includes('fixed-top')

  const comments =
    html.includes('wpdiscuz') ||
    html.includes('disqus') ||
    html.includes('comment-form') ||
    html.includes('id="comments"')

  const relatedPosts =
    html.includes('related-posts') ||
    html.includes('related_posts') ||
    html.includes('related-articles')

  const searchBar =
    html.includes('type="search"') ||
    html.includes('search-form') ||
    html.includes('role="search"')

  const adPatterns = [
    /adsbygoogle/gi, /doubleclick/gi, /googlesyndication/gi,
    /class="[^"]*ad[^"]*"/gi, /id="[^"]*ad[^"]*"/gi,
    /<iframe[^>]+ad/gi,
  ]
  let adMatches = 0
  for (const p of adPatterns) {
    adMatches += (ctx.html.match(p) || []).length
  }
  const adDensity = adMatches > 10 ? 'High' : adMatches > 4 ? 'Medium' : adMatches > 0 ? 'Low' : 'None'

  const issues = []
  const strengths: string[] = []

  if (breadcrumb) strengths.push('breadcrumb-present')
  if (tableOfContents) strengths.push('toc-present')

  if (adDensity === 'High') {
    issues.push({
      id: 'ux-high-ads',
      severity: 'medium' as const,
      problem: 'High ad density detected',
      whyItMatters: 'Excessive ads hurt user experience and may affect rankings.',
      suggestedFix: 'Reduce ad placements and prioritize content visibility.',
      category: 'ux',
    })
  }

  const score = scoreFromChecks([
    tableOfContents,
    breadcrumb,
    searchBar,
    relatedPosts,
    comments,
    adDensity !== 'High',
  ], [1, 2, 1, 1, 1, 2])

  return {
    id: 'ux',
    name: 'UX Signals',
    score,
    weight: 0.6,
    category: 'content',
    data: {
      tableOfContents,
      breadcrumb,
      stickyNavigation: stickyNav,
      comments,
      relatedPosts,
      searchBar,
      adDensity,
      adSignals: adMatches,
    },
    issues,
    strengths,
  }
}
