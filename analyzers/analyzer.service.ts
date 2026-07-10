import type { PageContext } from '../types/seo'
import type { SeoReport } from '../types/report'
import type { AnalyzerFn } from '../types/analyzer'
import { analyzeBasic } from './basic'
import { analyzeTitle } from './title'
import { analyzeHeadings } from './headings'
import { analyzeContent } from './content'
import { analyzeKeywords } from './keywords'
import { analyzeImages } from './images'
import { analyzeLinks } from './links'
import { analyzeSchema } from './schema'
import { analyzePerformance } from './performance'
import { analyzeTechnical } from './technical'
import { analyzeAccessibility } from './accessibility'
import { analyzeMobile } from './mobile'
import { analyzeTechnology } from './technology'
import { analyzeEeat } from './eeat'
import { analyzeUxSignals } from './ux'
import { computeScores, generateRankReasons, generateRecommendations } from './score'

const analyzers: AnalyzerFn[] = [
  analyzeBasic,
  analyzeTitle,
  analyzeHeadings,
  analyzeContent,
  analyzeKeywords,
  analyzeImages,
  analyzeLinks,
  analyzeSchema,
  analyzePerformance,
  analyzeTechnical,
  analyzeAccessibility,
  analyzeMobile,
  analyzeTechnology,
  analyzeEeat,
  analyzeUxSignals,
]

export function runAnalysis(ctx: PageContext): SeoReport {
  const start = performance.now()
  const results = analyzers.map((fn) => fn(ctx))
  const sections = Object.fromEntries(results.map((r) => [r.id, r]))
  const scores = computeScores(results)

  return {
    url: ctx.url,
    title: ctx.title,
    favicon: ctx.favicon,
    analyzedAt: new Date().toISOString(),
    durationMs: Math.round(performance.now() - start),
    scores,
    rankReasons: generateRankReasons(results),
    sections,
    recommendations: generateRecommendations(results),
  }
}
