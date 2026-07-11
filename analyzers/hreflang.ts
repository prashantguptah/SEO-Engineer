import type { PageContext } from '../types/seo'
import type { AnalyzerResult } from '../types/analyzer'
import { analyzeHreflangEntries } from '../utils/hreflang'
import { scoreFromChecks } from '../utils/helpers'

export function analyzeHreflang(ctx: PageContext): AnalyzerResult {
  const entries = ctx.hreflang ?? []
  const analysis = analyzeHreflangEntries(entries, ctx.url)
  const issues = []
  const strengths: string[] = []
  const positives = []

  if (entries.length === 0) {
    // Most sites are single-locale — absence is informational, not an issue
  } else {
    strengths.push('metadata-proper')
    positives.push({
      id: 'hreflang-present',
      message: `${entries.length} hreflang annotation(s) found`,
      category: 'hreflang',
    })

    if (!analysis.hasXDefault) {
      issues.push({
        id: 'hreflang-no-x-default',
        severity: 'medium' as const,
        problem: 'Missing hreflang x-default',
        whyItMatters: 'x-default tells search engines which URL to use when no language matches.',
        suggestedFix: 'Add <link rel="alternate" hreflang="x-default" href="…">.',
        category: 'hreflang',
      })
    }

    if (analysis.invalidCodes.length > 0) {
      issues.push({
        id: 'hreflang-invalid',
        severity: 'medium' as const,
        problem: `Invalid hreflang code(s): ${analysis.invalidCodes.join(', ')}`,
        whyItMatters: 'Invalid codes are ignored by search engines.',
        suggestedFix: 'Use valid ISO language codes (e.g. en, en-US) or x-default.',
        category: 'hreflang',
      })
    }

    if (analysis.duplicateLangs.length > 0) {
      issues.push({
        id: 'hreflang-duplicate',
        severity: 'medium' as const,
        problem: `Duplicate hreflang code(s): ${analysis.duplicateLangs.join(', ')}`,
        whyItMatters: 'Each language/region should map to a single URL.',
        suggestedFix: 'Remove duplicate hreflang entries for the same language code.',
        category: 'hreflang',
      })
    }

    if (!analysis.selfReference) {
      issues.push({
        id: 'hreflang-no-self',
        severity: 'low' as const,
        problem: 'Current page URL is not listed in its own hreflang set',
        whyItMatters: 'Each page should include a self-referencing hreflang annotation.',
        suggestedFix: 'Add an alternate link with hreflang pointing to this page URL.',
        category: 'hreflang',
      })
    }
  }

  const score =
    entries.length === 0
      ? 70
      : scoreFromChecks([
          entries.length > 0,
          analysis.hasXDefault,
          analysis.invalidCodes.length === 0,
          analysis.duplicateLangs.length === 0,
          analysis.selfReference,
        ])

  return {
    id: 'hreflang',
    name: 'Hreflang',
    score,
    weight: 0.8,
    category: 'technical',
    data: {
      count: entries.length,
      entries: entries.slice(0, 20),
      hasXDefault: analysis.hasXDefault,
      uniqueLangs: analysis.uniqueLangs,
      invalidCodes: analysis.invalidCodes,
      duplicateLangs: analysis.duplicateLangs,
      selfReference: analysis.selfReference,
    },
    issues,
    strengths,
    positives,
  }
}
