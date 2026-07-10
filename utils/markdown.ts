import type { SeoReport } from '../types/report'
import { getPageTypeLabel } from '../analyzers/score'

export function reportToMarkdown(report: SeoReport): string {
  const lines: string[] = []

  lines.push(`# SEO Report: ${report.title}`)
  lines.push('')
  lines.push(`**URL:** ${report.url}`)
  lines.push(`**Page type:** ${getPageTypeLabel(report.pageType)}`)
  lines.push(`**Overall score:** ${report.scores.overall}/100`)
  lines.push(`**Analyzed:** ${new Date(report.analyzedAt).toLocaleString()}`)
  lines.push(`**Duration:** ${report.durationMs}ms`)
  lines.push('')
  lines.push('## Scores')
  lines.push(`- Content: ${report.scores.content}`)
  lines.push(`- Technical: ${report.scores.technical}`)
  lines.push(`- Performance: ${report.scores.performance}`)
  lines.push(`- Accessibility: ${report.scores.accessibility}`)
  lines.push('')

  if (report.rankReasons.length > 0) {
    lines.push('## Why This Page Ranks')
    for (const reason of report.rankReasons) {
      lines.push(`- ✅ ${reason}`)
    }
    lines.push('')
  }

  if (report.positives.length > 0) {
    lines.push("## What's Working Well")
    for (const p of report.positives) {
      lines.push(`- ✅ ${p.message}${p.context ? ` _(${p.context})_` : ''}`)
    }
    lines.push('')
  }

  if (report.recommendations.length > 0) {
    lines.push('## Recommendations')
    for (const rec of report.recommendations) {
      lines.push(`### [${rec.severity.toUpperCase()}] ${rec.problem}`)
      lines.push(`- **Why:** ${rec.whyItMatters}`)
      lines.push(`- **Fix:** ${rec.suggestedFix}`)
      if (rec.severityReason) lines.push(`- _Note: ${rec.severityReason}_`)
      lines.push('')
    }
  }

  lines.push('## Section Summary')
  for (const [id, section] of Object.entries(report.sections)) {
    lines.push(`### ${section.name} (Score: ${section.score})`)
    const entries = Object.entries(section.data as Record<string, unknown>).slice(0, 8)
    for (const [key, val] of entries) {
      if (typeof val === 'object') continue
      lines.push(`- **${key}:** ${val}`)
    }
    lines.push('')
  }

  return lines.join('\n')
}
