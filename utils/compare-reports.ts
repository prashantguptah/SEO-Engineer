import type { Issue } from '../types/analyzer'
import type { ScoreBreakdown, SeoReport } from '../types/report'

export interface CompareMetric {
  key: string
  label: string
  a: number | string
  b: number | string
  delta?: number
}

export interface ReportCompareResult {
  scoreDelta: number
  metrics: CompareMetric[]
  onlyInA: { id: string; problem: string; severity: string }[]
  onlyInB: { id: string; problem: string; severity: string }[]
  inBoth: { id: string; problem: string; severity: string }[]
}

function sectionScore(report: SeoReport, id: string): number | null {
  return report.sections[id]?.score ?? null
}

function issueSummary(issue: Issue) {
  return { id: issue.id, problem: issue.problem, severity: issue.severity }
}

/**
 * Compare report A (usually current) vs report B (saved / competitor).
 */
export function compareReports(a: SeoReport, b: SeoReport): ReportCompareResult {
  const keys: (keyof ScoreBreakdown)[] = [
    'overall',
    'content',
    'technical',
    'performance',
    'accessibility',
  ]
  const metrics: CompareMetric[] = keys.map((key) => ({
    key,
    label: key.charAt(0).toUpperCase() + key.slice(1),
    a: a.scores[key],
    b: b.scores[key],
    delta: a.scores[key] - b.scores[key],
  }))

  const sectionIds = ['title', 'content', 'headings', 'keywords', 'images', 'links', 'schema', 'technical']
  for (const id of sectionIds) {
    const sa = sectionScore(a, id)
    const sb = sectionScore(b, id)
    if (sa === null && sb === null) continue
    metrics.push({
      key: `section-${id}`,
      label: id,
      a: sa ?? '—',
      b: sb ?? '—',
      delta: typeof sa === 'number' && typeof sb === 'number' ? sa - sb : undefined,
    })
  }

  // Word count if available
  const wa = (a.sections.content?.data as { wordCount?: number } | undefined)?.wordCount
  const wb = (b.sections.content?.data as { wordCount?: number } | undefined)?.wordCount
  if (wa != null || wb != null) {
    metrics.push({
      key: 'wordCount',
      label: 'Word count',
      a: wa ?? '—',
      b: wb ?? '—',
      delta: typeof wa === 'number' && typeof wb === 'number' ? wa - wb : undefined,
    })
  }

  const mapA = new Map(a.recommendations.map((i) => [i.id, i]))
  const mapB = new Map(b.recommendations.map((i) => [i.id, i]))

  const onlyInA: ReportCompareResult['onlyInA'] = []
  const onlyInB: ReportCompareResult['onlyInB'] = []
  const inBoth: ReportCompareResult['inBoth'] = []

  for (const [id, issue] of mapA) {
    if (mapB.has(id)) inBoth.push(issueSummary(issue))
    else onlyInA.push(issueSummary(issue))
  }
  for (const [id, issue] of mapB) {
    if (!mapA.has(id)) onlyInB.push(issueSummary(issue))
  }

  return {
    scoreDelta: a.scores.overall - b.scores.overall,
    metrics,
    onlyInA,
    onlyInB,
    inBoth,
  }
}
