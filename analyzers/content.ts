import type { PageContext } from '../types/seo'
import type { AnalyzerResult } from '../types/analyzer'
import { calculateReadability } from '../utils/readability'
import { countWords, averageSentenceLength } from '../utils/keyword'
import { scoreFromChecks } from '../utils/helpers'

export function analyzeContent(ctx: PageContext): AnalyzerResult {
  const text = ctx.bodyText
  const wordCount = countWords(text)
  const charCount = text.length
  const paragraphCount = ctx.paragraphs.length
  const listCount = (ctx.html.match(/<[ou]l[\s>]/gi) || []).length
  const tableCount = (ctx.html.match(/<table[\s>]/gi) || []).length
  const imageCount = ctx.images.length
  const videoCount = (ctx.html.match(/<video[\s>]/gi) || []).length + (ctx.html.match(/<iframe[^>]+youtube|vimeo/gi) || []).length
  const codeBlocks = (ctx.html.match(/<pre[\s>]/gi) || []).length + (ctx.html.match(/<code[\s>]/gi) || []).length
  const quoteCount = (ctx.html.match(/<blockquote[\s>]/gi) || []).length
  const readingTime = Math.max(1, Math.ceil(wordCount / 200))
  const readability = calculateReadability(text)

  const issues = []
  const strengths: string[] = []

  if (wordCount >= 300) strengths.push('content-comprehensive')
  else if (wordCount < 100) {
    issues.push({
      id: 'thin-content',
      severity: 'high' as const,
      problem: `Thin content detected (${wordCount} words)`,
      whyItMatters: 'Thin pages struggle to rank for competitive queries.',
      suggestedFix: 'Add comprehensive, valuable content (300+ words minimum).',
      category: 'content',
    })
  } else {
    issues.push({
      id: 'short-content',
      severity: 'medium' as const,
      problem: `Content is relatively short (${wordCount} words)`,
      whyItMatters: 'Longer comprehensive content often ranks better.',
      suggestedFix: 'Expand content with more depth and detail.',
      category: 'content',
    })
  }

  if (readability.score >= 60) strengths.push('readability-high')
  else if (readability.score < 40) {
    issues.push({
      id: 'low-readability',
      severity: 'medium' as const,
      problem: `Low readability score (${readability.fleschReadingEase})`,
      whyItMatters: 'Hard-to-read content reduces engagement signals.',
      suggestedFix: 'Use shorter sentences and simpler vocabulary.',
      category: 'content',
    })
  }

  const score = scoreFromChecks([
    wordCount >= 300,
    wordCount >= 1000,
    paragraphCount >= 3,
    readability.score >= 50,
    imageCount > 0,
    listCount > 0 || tableCount > 0,
  ], [2, 1, 1, 2, 1, 1])

  return {
    id: 'content',
    name: 'Content Analysis',
    score,
    weight: 1.5,
    category: 'content',
    data: {
      wordCount,
      characterCount: charCount,
      paragraphCount,
      lists: listCount,
      tables: tableCount,
      images: imageCount,
      videos: videoCount,
      codeBlocks,
      quotes: quoteCount,
      readingTimeMinutes: readingTime,
      averageSentenceLength: averageSentenceLength(text),
      readability: readability.grade,
      fleschScore: readability.fleschReadingEase,
    },
    issues,
    strengths,
  }
}
