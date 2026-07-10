import type { Issue, Severity } from '../types/analyzer'
import type { PageContext } from '../types/seo'

const UTILITY_PATH = /\/(thank-you|thanks|checkout|cart|login|signup|register|confirm|password)/i

export function tuneSeverity(issue: Issue, ctx: PageContext): Issue {
  const tuned = { ...issue }

  if (issue.id === 'noindex' && ctx.pageType === 'utility') {
    tuned.severity = 'low'
    tuned.severityReason = 'noindex is expected on utility/checkout pages'
    return tuned
  }

  if (issue.id === 'thin-content' && ctx.pageType === 'homepage') {
    tuned.severity = 'low'
    tuned.severityReason = 'Homepages often have less body copy by design'
    return tuned
  }

  if (issue.id === 'short-content' && ctx.pageType === 'homepage') {
    tuned.severity = 'low'
    tuned.severityReason = 'Short content is normal for homepages'
    return tuned
  }

  if (issue.id === 'missing-meta-desc' && ctx.pageType === 'utility') {
    tuned.severity = 'low'
    tuned.severityReason = 'Meta descriptions matter less on non-indexed utility pages'
    return tuned
  }

  if (issue.id === 'few-internal-links' && ctx.pageType === 'utility') {
    tuned.severity = 'low'
    tuned.severityReason = 'Utility pages typically have minimal internal linking'
    return tuned
  }

  if (issue.id === 'eeat-no-about' && ctx.pageType === 'utility') {
    tuned.severity = 'low'
    tuned.severityReason = 'About page links are less critical on utility pages'
    return tuned
  }

  if (issue.id === 'noindex' && ctx.pageType === 'blog') {
    tuned.severity = 'high'
    tuned.severityReason = 'Blog posts should be indexed to rank'
    return tuned
  }

  if (issue.id === 'missing-h1' && ctx.pageType === 'product') {
    tuned.severity = 'high'
    tuned.severityReason = 'Product pages need a clear H1 for rankings'
    return tuned
  }

  if (UTILITY_PATH.test(ctx.pathname) && issue.id === 'noindex') {
    tuned.severity = 'low'
    tuned.severityReason = 'This URL pattern is typically non-indexable'
  }

  return tuned
}

export function tuneAllIssues(issues: Issue[], ctx: PageContext): Issue[] {
  return issues.map((issue) => tuneSeverity(issue, ctx))
}

export function severityRank(severity: Severity): number {
  return { high: 0, medium: 1, low: 2 }[severity]
}
