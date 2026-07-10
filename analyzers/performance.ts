import type { PageContext } from '../types/seo'
import type { AnalyzerResult } from '../types/analyzer'
import { scoreFromChecks } from '../utils/helpers'

export function analyzePerformance(ctx: PageContext): AnalyzerResult {
  const timing = ctx.resourceTiming
  const domNodes = (ctx.html.match(/<[^>]+>/g) || []).length
  const scriptCount = ctx.scriptSrcs.length
  const inlineScripts = ctx.scripts.length - ctx.scriptSrcs.length
  const stylesheetCount = ctx.stylesheets.length
  const htmlSize = new Blob([ctx.html]).size
  const lazyImages = ctx.images.filter((i) => i.loading === 'lazy').length
  const deferAsync = (ctx.html.match(/<script[^>]*(defer|async)/gi) || []).length

  const transferKB = Math.round(timing.transferSizeTotal / 1024)
  const dclMs = timing.domContentLoaded ? Math.round(timing.domContentLoaded) : null
  const loadMs = timing.loadEventEnd ? Math.round(timing.loadEventEnd) : null

  const issues = []
  const strengths: string[] = []

  if (scriptCount > 20) {
    issues.push({
      id: 'many-scripts',
      severity: 'medium' as const,
      problem: `High script count (${scriptCount} external scripts)`,
      whyItMatters: 'Excessive scripts slow page load and hurt Core Web Vitals.',
      suggestedFix: 'Defer non-critical scripts and reduce third-party scripts.',
      category: 'performance',
    })
  }

  if (htmlSize > 500000) {
    issues.push({
      id: 'large-html',
      severity: 'medium' as const,
      problem: `Large HTML document (${Math.round(htmlSize / 1024)}KB)`,
      whyItMatters: 'Large HTML increases parse time and TTFB perception.',
      suggestedFix: 'Reduce inline content and optimize HTML structure.',
      category: 'performance',
    })
  }

  if (timing.slowResources > 3) {
    issues.push({
      id: 'slow-resources',
      severity: 'medium' as const,
      problem: `${timing.slowResources} resources took over 1 second to load`,
      whyItMatters: 'Slow resources delay rendering and hurt user experience.',
      suggestedFix: 'Optimize or defer slow-loading scripts, fonts, and images.',
      category: 'performance',
    })
  }

  if (transferKB > 3000) {
    issues.push({
      id: 'large-transfer',
      severity: 'medium' as const,
      problem: `High total transfer size (${transferKB}KB across ${timing.resourceCount} resources)`,
      whyItMatters: 'Large payloads increase load time, especially on mobile networks.',
      suggestedFix: 'Compress assets, use modern formats, and remove unused resources.',
      category: 'performance',
    })
  }

  if (lazyImages > 0) strengths.push('images-optimized')
  if (dclMs !== null && dclMs < 2000) strengths.push('metadata-proper')

  const score = scoreFromChecks(
    [
      scriptCount <= 15,
      scriptCount <= 25,
      htmlSize < 300000,
      htmlSize < 500000,
      lazyImages > 0 || ctx.images.length === 0,
      deferAsync > 0 || scriptCount === 0,
      domNodes < 1500,
      timing.slowResources <= 2,
      transferKB < 2000,
      dclMs === null || dclMs < 3000,
    ],
    [2, 1, 2, 1, 1, 1, 1, 2, 2, 2],
  )

  return {
    id: 'performance',
    name: 'Performance',
    score,
    weight: 1,
    category: 'performance',
    data: {
      domNodes,
      scriptCount,
      inlineScripts,
      stylesheetCount,
      htmlSizeKB: Math.round(htmlSize / 1024),
      lazyImages,
      deferAsyncScripts: deferAsync,
      resourceCount: timing.resourceCount,
      transferSizeKB: transferKB,
      slowResources: timing.slowResources,
      domContentLoadedMs: dclMs,
      loadEventEndMs: loadMs,
      resourcesByType: timing.byType,
    },
    issues,
    strengths,
  }
}
