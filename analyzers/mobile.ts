import type { PageContext } from '../types/seo'
import type { AnalyzerResult } from '../types/analyzer'
import { getMetaContent, scoreFromChecks } from '../utils/helpers'

export function analyzeMobile(ctx: PageContext): AnalyzerResult {
  const viewport = getMetaContent(ctx.meta, 'viewport')
  const hasViewport = !!viewport && viewport.includes('width=device-width')
  const responsiveImages = ctx.images.filter((i) => i.hasSrcset).length
  const responsiveMeta = viewport.includes('initial-scale')

  const html = ctx.html
  const smallTouchTargets = (html.match(/(?:width|height):\s*[1-9]px/gi) || []).length
  const fontSizeIssues = (html.match(/font-size:\s*[1-9]px/gi) || []).length
  const mediaQueries = (html.match(/@media/gi) || []).length + (ctx.stylesheets.length > 0 ? 1 : 0)

  const issues = []
  const strengths: string[] = []

  if (hasViewport) strengths.push('mobile-friendly')

  if (!hasViewport) {
    issues.push({
      id: 'mobile-no-viewport',
      severity: 'high' as const,
      problem: 'Missing or invalid viewport meta tag',
      whyItMatters: 'Mobile-friendliness is a ranking factor.',
      suggestedFix: 'Add viewport meta with width=device-width.',
      category: 'mobile',
    })
  }

  if (fontSizeIssues > 3) {
    issues.push({
      id: 'mobile-small-font',
      severity: 'medium' as const,
      problem: 'Very small font sizes detected in CSS',
      whyItMatters: 'Small fonts are hard to read on mobile devices.',
      suggestedFix: 'Use minimum 16px font size for body text on mobile.',
      category: 'mobile',
    })
  }

  const score = scoreFromChecks([
    hasViewport,
    responsiveMeta,
    mediaQueries > 0,
    responsiveImages > 0 || ctx.images.length === 0,
    fontSizeIssues <= 3,
    smallTouchTargets <= 5,
  ], [3, 1, 2, 1, 1, 1])

  return {
    id: 'mobile',
    name: 'Mobile',
    score,
    weight: 1,
    category: 'accessibility',
    data: {
      viewport: viewport || 'Not set',
      hasViewport,
      responsive: mediaQueries > 0,
      responsiveImages,
      touchTargetWarnings: smallTouchTargets,
      fontSizeWarnings: fontSizeIssues,
    },
    issues,
    strengths,
  }
}
