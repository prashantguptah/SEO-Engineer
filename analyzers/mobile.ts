import type { PageContext } from '../types/seo'
import type { AnalyzerResult } from '../types/analyzer'
import { getMetaContent, scoreFromChecks } from '../utils/helpers'

export function analyzeMobile(ctx: PageContext): AnalyzerResult {
  const viewport = getMetaContent(ctx.meta, 'viewport')
  const hasViewport = !!viewport && viewport.includes('width=device-width')
  const responsiveImages = ctx.images.filter((i) => i.hasSrcset).length
  const responsiveMeta = viewport.includes('initial-scale')

  const audit = ctx.mobileAudit
  const fontSizeIssues = audit.smallFonts
  const smallTouchTargets = audit.smallTargets
  const mediaQueries =
    (ctx.html.match(/@media/gi) || []).length + (ctx.stylesheets.length > 0 ? 1 : 0)

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
      problem: `${fontSizeIssues} elements with font size below 12px (of ${audit.sampledTextElements} sampled)`,
      whyItMatters: 'Small fonts are hard to read on mobile devices.',
      suggestedFix: 'Use minimum 16px font size for body text on mobile.',
      category: 'mobile',
    })
  }

  if (smallTouchTargets > 3) {
    issues.push({
      id: 'mobile-small-targets',
      severity: 'medium' as const,
      problem: `${smallTouchTargets} touch targets smaller than 44×44px (of ${audit.sampledClickables} sampled)`,
      whyItMatters: 'Small tap targets frustrate mobile users.',
      suggestedFix: 'Ensure buttons and links are at least 44×44 pixels.',
      category: 'mobile',
    })
  }

  const score = scoreFromChecks(
    [
      hasViewport,
      responsiveMeta,
      mediaQueries > 0,
      responsiveImages > 0 || ctx.images.length === 0,
      fontSizeIssues <= 3,
      smallTouchTargets <= 3,
    ],
    [3, 1, 2, 1, 1, 1],
  )

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
      sampledTextElements: audit.sampledTextElements,
      sampledClickables: audit.sampledClickables,
      auditMethod: 'getComputedStyle + getBoundingClientRect',
    },
    issues,
    strengths,
  }
}
