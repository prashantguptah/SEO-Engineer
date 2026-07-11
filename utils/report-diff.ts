import type { Issue } from '../types/analyzer'
import type {
  AuditLibraryEntry,
  DiffIssueSummary,
  ReportDiff,
  ScoreBreakdown,
  SeoReport,
} from '../types/report'

function toSummary(issue: Issue): DiffIssueSummary {
  return {
    id: issue.id,
    problem: issue.problem,
    severity: issue.severity,
  }
}

/**
 * Compare the latest report against the previous run for the same URL.
 */
export function diffReports(previous: SeoReport, current: SeoReport): ReportDiff {
  const prevById = new Map(previous.recommendations.map((i) => [i.id, i]))
  const currById = new Map(current.recommendations.map((i) => [i.id, i]))

  const fixed: DiffIssueSummary[] = []
  const stillOpen: DiffIssueSummary[] = []
  const newIssues: DiffIssueSummary[] = []

  for (const [id, issue] of prevById) {
    if (currById.has(id)) stillOpen.push(toSummary(currById.get(id)!))
    else fixed.push(toSummary(issue))
  }

  for (const [id, issue] of currById) {
    if (!prevById.has(id)) newIssues.push(toSummary(issue))
  }

  const keys: (keyof ScoreBreakdown)[] = [
    'overall',
    'content',
    'technical',
    'performance',
    'accessibility',
  ]
  const scoreBreakdownDelta: ReportDiff['scoreBreakdownDelta'] = {}
  for (const key of keys) {
    scoreBreakdownDelta[key] = current.scores[key] - previous.scores[key]
  }

  return {
    previousScore: previous.scores.overall,
    previousAnalyzedAt: previous.analyzedAt,
    scoreDelta: current.scores.overall - previous.scores.overall,
    scoreBreakdownDelta,
    fixed,
    newIssues,
    stillOpen,
  }
}

export function makeAuditId(url: string, analyzedAt: string): string {
  return `${url}|${analyzedAt}`
}

export function toLibraryEntry(report: SeoReport): AuditLibraryEntry {
  // Strip nested diff/history from stored copy to limit storage size
  const { reportDiff: _diff, scoreHistory: _hist, ...rest } = report
  return {
    id: makeAuditId(report.url, report.analyzedAt),
    url: report.url,
    title: report.title,
    favicon: report.favicon,
    score: report.scores.overall,
    analyzedAt: report.analyzedAt,
    pageType: report.pageType,
    report: rest,
  }
}
