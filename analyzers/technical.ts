import type { PageContext } from '../types/seo'
import type { AnalyzerResult } from '../types/analyzer'
import { getMetaContent, scoreFromChecks } from '../utils/helpers'

export function analyzeTechnical(ctx: PageContext): AnalyzerResult {
  const canonical = ctx.linkRels.find((l) => l.rel === 'canonical')?.href || ''
  const robots = getMetaContent(ctx.meta, 'robots')
  const viewport = getMetaContent(ctx.meta, 'viewport')
  const noindex = robots.toLowerCase().includes('noindex')
  const description = getMetaContent(ctx.meta, 'description')
  const robotsTxt = ctx.robotsTxt
  const sitemap = ctx.sitemap

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

  if (robotsTxt?.fetched && robotsTxt.disallowsCurrentPath) {
    issues.push({
      id: 'robots-disallow',
      severity: 'high' as const,
      problem: `robots.txt disallows this path (${robotsTxt.matchingDisallows.join(', ') || 'matched rule'})`,
      whyItMatters: 'Disallowed paths are typically not crawled or indexed by search engines.',
      suggestedFix: 'Remove or narrow the Disallow rule in robots.txt if this page should be indexed.',
      category: 'technical',
    })
  }

  if (robotsTxt && !robotsTxt.fetched && robotsTxt.error && robotsTxt.error !== 'Skipped') {
    issues.push({
      id: 'robots-missing',
      severity: 'low' as const,
      problem: `Could not fetch robots.txt (${robotsTxt.error})`,
      whyItMatters: 'A robots.txt file helps control crawling and advertise sitemaps.',
      suggestedFix: 'Publish a robots.txt at the site root with appropriate Allow/Disallow and Sitemap directives.',
      category: 'technical',
    })
  }

  if (robotsTxt?.fetched && robotsTxt.sitemaps.length === 0 && sitemap && !sitemap.fetched) {
    issues.push({
      id: 'no-sitemap',
      severity: 'medium' as const,
      problem: 'No sitemap found in robots.txt or at /sitemap.xml',
      whyItMatters: 'Sitemaps help search engines discover URLs efficiently.',
      suggestedFix: 'Add a Sitemap: line in robots.txt and publish sitemap.xml.',
      category: 'technical',
    })
  }

  if (
    sitemap?.fetched &&
    sitemap.includesCurrentUrl === false &&
    (sitemap.urlCount ?? 0) > 0 &&
    !sitemap.truncated
  ) {
    issues.push({
      id: 'url-not-in-sitemap',
      severity: 'low' as const,
      problem: 'Current URL was not found in the sampled sitemap URLs',
      whyItMatters: 'Pages missing from the sitemap may be discovered more slowly.',
      suggestedFix: 'Include important URLs in your XML sitemap.',
      category: 'technical',
    })
  }

  if (robotsTxt?.fetched) strengths.push('metadata-proper')
  if (sitemap?.fetched) strengths.push('metadata-proper')

  const score = scoreFromChecks(
    [
      ctx.isHttps,
      !!canonical,
      !!viewport,
      indexable,
      titleCount === 1,
      metaDescCount <= 1,
      !!description,
      !robotsTxt?.disallowsCurrentPath,
      !(robotsTxt && !robotsTxt.fetched && robotsTxt.error && robotsTxt.error !== 'Skipped'),
    ],
    [2, 2, 2, 3, 1, 1, 1, 2, 1],
  )

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
      robotsTxt: robotsTxt
        ? {
            fetched: robotsTxt.fetched,
            status: robotsTxt.status,
            sitemaps: robotsTxt.sitemaps,
            disallowsCurrentPath: robotsTxt.disallowsCurrentPath,
            matchingDisallows: robotsTxt.matchingDisallows,
            error: robotsTxt.error,
          }
        : null,
      sitemap: sitemap
        ? {
            fetched: sitemap.fetched,
            sourceUrl: sitemap.sourceUrl,
            urlCount: sitemap.urlCount,
            includesCurrentUrl: sitemap.includesCurrentUrl,
            truncated: sitemap.truncated,
            sampleUrls: sitemap.sampleUrls,
            error: sitemap.error,
          }
        : null,
    },
    issues,
    strengths,
  }
}
