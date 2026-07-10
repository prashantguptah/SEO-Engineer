import type { PageContext } from '../types/seo'
import type { AnalyzerResult } from '../types/analyzer'
import { scoreFromChecks } from '../utils/helpers'

export function analyzePerformance(ctx: PageContext): AnalyzerResult {
  const domNodes = (ctx.html.match(/<[^>]+>/g) || []).length
  const scriptCount = ctx.scriptSrcs.length
  const inlineScripts = ctx.scripts.length - ctx.scriptSrcs.length
  const stylesheetCount = ctx.stylesheets.length
  const htmlSize = new Blob([ctx.html]).size
  const lazyImages = ctx.images.filter((i) => i.loading === 'lazy').length
  const deferAsync = (ctx.html.match(/<script[^>]*(defer|async)/gi) || []).length

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

  if (lazyImages > 0) strengths.push('images-optimized')

  const score = scoreFromChecks([
    scriptCount <= 15,
    scriptCount <= 25,
    htmlSize < 300000,
    htmlSize < 500000,
    lazyImages > 0 || ctx.images.length === 0,
    deferAsync > 0 || scriptCount === 0,
    domNodes < 1500,
  ], [2, 1, 2, 1, 1, 1, 1])

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
    },
    issues,
    strengths,
  }
}
