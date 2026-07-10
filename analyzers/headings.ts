import type { PageContext } from '../types/seo'
import type { AnalyzerResult } from '../types/analyzer'
import { scoreFromChecks } from '../utils/helpers'

export function analyzeHeadings(ctx: PageContext): AnalyzerResult {
  const h1s = ctx.headings.filter((h) => h.level === 1)
  const h2s = ctx.headings.filter((h) => h.level === 2)
  const h3s = ctx.headings.filter((h) => h.level === 3)
  const h4s = ctx.headings.filter((h) => h.level === 4)
  const h5s = ctx.headings.filter((h) => h.level === 5)

  const missingH1 = h1s.length === 0
  const duplicateH1 = h1s.length > 1
  const hierarchyIssues = checkHierarchy(ctx.headings)

  const issues = []
  const strengths: string[] = []

  if (missingH1) {
    issues.push({
      id: 'missing-h1',
      severity: 'high' as const,
      problem: 'No H1 heading found',
      whyItMatters: 'H1 communicates the main topic to search engines.',
      suggestedFix: 'Add exactly one H1 that describes the page topic.',
      category: 'headings',
    })
  } else if (!duplicateH1) {
    strengths.push('heading-hierarchy')
  }

  if (duplicateH1) {
    issues.push({
      id: 'duplicate-h1',
      severity: 'medium' as const,
      problem: `Multiple H1 tags found (${h1s.length})`,
      whyItMatters: 'Multiple H1s can dilute topical focus.',
      suggestedFix: 'Use a single H1 and demote others to H2.',
      category: 'headings',
    })
  }

  if (hierarchyIssues.length > 0) {
    issues.push({
      id: 'heading-hierarchy',
      severity: 'medium' as const,
      problem: `Heading hierarchy issues: ${hierarchyIssues.join(', ')}`,
      whyItMatters: 'Proper hierarchy helps crawlers understand content structure.',
      suggestedFix: 'Ensure headings follow sequential order (H1 → H2 → H3).',
      category: 'headings',
    })
  } else if (!missingH1 && h2s.length > 0) {
    strengths.push('heading-hierarchy')
  }

  const score = scoreFromChecks([
    !missingH1,
    !duplicateH1,
    hierarchyIssues.length === 0,
    h2s.length > 0,
    ctx.headings.length >= 3,
  ], [3, 2, 2, 1, 1])

  return {
    id: 'headings',
    name: 'Heading Analysis',
    score,
    weight: 1,
    category: 'content',
    data: {
      h1: h1s.map((h) => h.text),
      h2: h2s.map((h) => h.text),
      h3: h3s.map((h) => h.text),
      h4: h4s.map((h) => h.text),
      h5: h5s.map((h) => h.text),
      counts: { h1: h1s.length, h2: h2s.length, h3: h3s.length, h4: h4s.length, h5: h5s.length },
      missingH1,
      duplicateH1,
      hierarchyValid: hierarchyIssues.length === 0,
      allHeadings: ctx.headings,
    },
    issues,
    strengths,
  }
}

function checkHierarchy(headings: { level: number }[]): string[] {
  const issues: string[] = []
  let prev = 0
  for (const h of headings) {
    if (prev === 0 && h.level !== 1) {
      issues.push('First heading is not H1')
      break
    }
    if (h.level > prev + 1 && prev > 0) {
      issues.push(`Skipped from H${prev} to H${h.level}`)
    }
    prev = h.level
  }
  return [...new Set(issues)]
}
