import type { PageContext } from '../types/seo'
import type { AnalyzerResult } from '../types/analyzer'
import {
  extractTopKeywords,
  extractTopPhrases,
  pickPrimaryKeyword,
  containsKeyword,
} from '../utils/keyword'
import { getMetaContent, scoreFromChecks } from '../utils/helpers'
import { parseKeywordList } from '../types/settings'

export type PlacementFlags = {
  inTitle: boolean
  inMeta: boolean
  inUrl: boolean
  inH1: boolean
  inH2: boolean
  inFirst100: boolean
  inImageAlts: boolean
}

export interface KeywordMatrixRow {
  keyword: string
  role: 'primary' | 'secondary'
  placement: PlacementFlags
  hitCount: number
}

function buildPlacement(ctx: PageContext, keyword: string): PlacementFlags {
  const first100 = ctx.bodyText.split(/\s+/).slice(0, 100).join(' ')
  const altText = ctx.images.map((img) => img.alt || '').join(' ')
  return {
    inTitle: containsKeyword(ctx.title, keyword),
    inMeta: containsKeyword(getMetaContent(ctx.meta, 'description'), keyword),
    inUrl: containsKeyword(ctx.url, keyword),
    inH1: ctx.headings.some((h) => h.level === 1 && containsKeyword(h.text, keyword)),
    inH2: ctx.headings.some((h) => h.level === 2 && containsKeyword(h.text, keyword)),
    inFirst100: containsKeyword(first100, keyword),
    inImageAlts: containsKeyword(altText, keyword),
  }
}

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

  const secondary = (ctx.secondaryKeywords?.length
    ? ctx.secondaryKeywords
    : parseKeywordList('')
  )
    .map((k) => k.trim())
    .filter((k) => k && k.toLowerCase() !== primaryKeyword.toLowerCase())
    .slice(0, 3)

  const allPhrases = [...topBigrams, ...topTrigrams]
  const stuffing =
    topKeywords.some((k) => k.density > 3) ||
    allPhrases.some((p) => p.density > 2)

  const placement = primaryKeyword ? buildPlacement(ctx, primaryKeyword) : null

  const matrix: KeywordMatrixRow[] = []
  if (primaryKeyword) {
    const p = buildPlacement(ctx, primaryKeyword)
    matrix.push({
      keyword: primaryKeyword,
      role: 'primary',
      placement: p,
      hitCount: Object.values(p).filter(Boolean).length,
    })
  }
  for (const kw of secondary) {
    const p = buildPlacement(ctx, kw)
    matrix.push({
      keyword: kw,
      role: 'secondary',
      placement: p,
      hitCount: Object.values(p).filter(Boolean).length,
    })
  }

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

  for (const row of matrix.filter((r) => r.role === 'secondary')) {
    if (row.hitCount === 0) {
      issues.push({
        id: `secondary-missing-${row.keyword.toLowerCase().replace(/\s+/g, '-')}`,
        severity: 'low' as const,
        problem: `Secondary keyword "${row.keyword}" not found in key placements`,
        whyItMatters: 'Secondary terms support topical breadth without stuffing the primary.',
        suggestedFix: `Mention "${row.keyword}" naturally in body copy, a subheading, or image alt text.`,
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
      placement ? placement.inFirst100 : false,
      topBigrams.length > 0,
    ],
    [1, 2, 2, 2, 1, 1, 1],
  )

  // Legacy placement shape for existing UI chips (map inFirst100 → inFirstParagraph label via section)
  const legacyPlacement = placement
    ? {
        inTitle: placement.inTitle,
        inMeta: placement.inMeta,
        inUrl: placement.inUrl,
        inH1: placement.inH1,
        inH2: placement.inH2,
        inFirstParagraph: placement.inFirst100,
        inLastParagraph: containsKeyword(ctx.lastParagraph, primaryKeyword),
        inImageAlts: placement.inImageAlts,
      }
    : null

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
      secondaryKeywords: secondary,
      placement: legacyPlacement,
      matrix,
      keywordStuffing: stuffing,
    },
    issues,
    strengths,
  }
}
