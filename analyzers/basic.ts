import type { PageContext } from '../types/seo'
import type { AnalyzerResult } from '../types/analyzer'
import { getMetaContent, scoreFromChecks } from '../utils/helpers'

export function analyzeBasic(ctx: PageContext): AnalyzerResult {
  const canonical = ctx.linkRels.find((l) => l.rel === 'canonical')?.href || getMetaContent(ctx.meta, 'canonical')
  const language =
    (typeof document !== 'undefined' ? document.documentElement?.lang : '') ||
    getMetaContent(ctx.meta, 'content-language') ||
    getMetaContent(ctx.meta, 'language')
  const charset =
    (typeof document !== 'undefined' ? document.characterSet : '') ||
    getMetaContent(ctx.meta, 'charset')
  const viewport = getMetaContent(ctx.meta, 'viewport')
  const robots = getMetaContent(ctx.meta, 'robots')

  const issues = []
  const strengths: string[] = []

  if (ctx.isHttps) strengths.push('https-enabled')
  else {
    issues.push({
      id: 'no-https',
      severity: 'high' as const,
      problem: 'Page is not served over HTTPS',
      whyItMatters: 'HTTPS is a ranking signal and builds user trust.',
      suggestedFix: 'Install an SSL certificate and redirect HTTP to HTTPS.',
      category: 'basic',
    })
  }

  if (!canonical) {
    issues.push({
      id: 'no-canonical',
      severity: 'medium' as const,
      problem: 'No canonical URL specified',
      whyItMatters: 'Canonical tags prevent duplicate content issues.',
      suggestedFix: 'Add a <link rel="canonical"> tag pointing to the preferred URL.',
      category: 'basic',
    })
  }

  if (!language) {
    issues.push({
      id: 'no-language',
      severity: 'low' as const,
      problem: 'No language attribute detected',
      whyItMatters: 'Language helps search engines serve the right audience.',
      suggestedFix: 'Add lang attribute to the <html> element.',
      category: 'basic',
    })
  }

  if (!viewport) {
    issues.push({
      id: 'no-viewport',
      severity: 'high' as const,
      problem: 'No viewport meta tag',
      whyItMatters: 'Viewport is required for mobile-friendly pages.',
      suggestedFix: 'Add <meta name="viewport" content="width=device-width, initial-scale=1">',
      category: 'basic',
    })
  } else {
    strengths.push('mobile-friendly')
  }

  const score = scoreFromChecks([
    ctx.isHttps,
    !!canonical,
    !!language,
    !!charset,
    !!viewport,
    !!robots || true,
  ], [2, 1, 1, 1, 2, 0.5])

  return {
    id: 'basic',
    name: 'Basic Information',
    score,
    weight: 1,
    category: 'technical',
    data: {
      domain: ctx.hostname,
      url: ctx.url,
      https: ctx.isHttps,
      canonical: canonical || 'Not set',
      language: language || 'Not set',
      charset: charset || 'Not set',
      viewport: viewport || 'Not set',
      robots: robots || 'Not set',
    },
    issues,
    strengths,
  }
}
