import type { PageContext } from '../types/seo'
import type { AnalyzerResult } from '../types/analyzer'
import {
  extractTopKeywords,
  extractTopPhrases,
  pickPrimaryKeyword,
  containsKeyword,
} from '../utils/keyword'
import { getMetaContent, scoreFromChecks } from '../utils/helpers'

export function analyzeKeywords(ctx: PageContext): AnalyzerResult {
  const topKeywords = extractTopKeywords(ctx.bodyText, 10)
  const topBigrams = extractTopPhrases(ctx.bodyText, 2, 10)
  const topTrigrams = extractTopPhrases(ctx.bodyText, 3, 10)

  const customKeyword = ctx.targetKeyword?.trim()
  let primaryKeyword: string
  let primaryType: string

  if (customKeyword) {
    primaryKeyword = customKeyword
    primaryType = 'target'
  } else {
    const picked = pickPrimaryKeyword(topKeywords, topBigrams)
    primaryKeyword = picked.keyword
    primaryType = picked.type
  }

  const allPhrases = [...topBigrams, ...topTrigrams]
  const stuffing =
    topKeywords.some((k) => k.density > 3) ||
    allPhrases.some((p) => p.density > 2)

  const placement = primaryKeyword
    ? {
        inTitle: containsKeyword(ctx.title, primaryKeyword),
        inMeta: containsKeyword(getMetaContent(ctx.meta, 'description'), primaryKeyword),
        inUrl: containsKeyword(ctx.url, primaryKeyword),
        inH1: ctx.headings.some((h) => h.level === 1 && containsKeyword(h.text, primaryKeyword)),
        inH2: ctx.headings.some((h) => h.level === 2 && containsKeyword(h.text, primaryKeyword)),
        inFirstParagraph: containsKeyword(ctx.firstParagraph, primaryKeyword),
        inLastParagraph: containsKeyword(ctx.lastParagraph, primaryKeyword),
      }
    : null

  const issues = []
  const strengths: string[] = []

  if (stuffing) {
    issues.push({
      id: 'keyword-stuffing',
      severity: 'high' as const,
      problem: 'Possible keyword stuffing detected (high phrase density)',
      whyItMatters: 'Keyword stuffing can trigger spam penalties.',
      suggestedFix: 'Use keywords naturally and vary vocabulary.',
      category: 'keywords',
    })
  }

  if (placement) {
    const placementCount = Object.values(placement).filter(Boolean).length
    if (placementCount >= 5) strengths.push('keyword-placement')
    if (!placement.inTitle && primaryKeyword) {
      issues.push({
        id: 'keyword-not-in-title',
        severity: 'medium' as const,
        problem: `Primary ${primaryType} "${primaryKeyword}" not in title`,
        whyItMatters: 'Keywords in title strengthen topical relevance.',
        suggestedFix: 'Include primary keyword naturally in the page title.',
        category: 'keywords',
      })
    }
    if (!placement.inH1 && primaryKeyword) {
      issues.push({
        id: 'keyword-not-in-h1',
        severity: 'medium' as const,
        problem: `Primary ${primaryType} "${primaryKeyword}" not in H1`,
        whyItMatters: 'H1 keyword usage reinforces page topic.',
        suggestedFix: 'Include primary keyword in the H1 heading.',
        category: 'keywords',
      })
    }
  }

  const score = scoreFromChecks(
    [
      topKeywords.length > 0,
      !stuffing,
      placement ? placement.inTitle : false,
      placement ? placement.inH1 : false,
      placement ? placement.inMeta : false,
      placement ? placement.inFirstParagraph : false,
      topBigrams.length > 0,
    ],
    [1, 2, 2, 2, 1, 1, 1],
  )

  return {
    id: 'keywords',
    name: 'Keyword Analysis',
    score,
    weight: 1,
    category: 'content',
    data: {
      topKeywords,
      topBigrams,
      topTrigrams,
      primaryKeyword,
      primaryType,
      customTarget: !!customKeyword,
      placement,
      keywordStuffing: stuffing,
    },
    issues,
    strengths,
  }
}
