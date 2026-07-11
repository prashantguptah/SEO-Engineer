export type Severity = 'high' | 'medium' | 'low'

export interface Issue {
  id: string
  severity: Severity
  problem: string
  whyItMatters: string
  suggestedFix: string
  category?: string
  elementSelector?: string
  severityReason?: string
  /** Paste-ready HTML snippet when available */
  fixSnippet?: string
}

export interface PositiveNote {
  id: string
  message: string
  context?: string
  category?: string
}

export interface AnalyzerResult<T = Record<string, unknown>> {
  id: string
  name: string
  score: number
  weight: number
  category: 'content' | 'technical' | 'performance' | 'accessibility'
  data: T
  issues: Issue[]
  strengths: string[]
  positives?: PositiveNote[]
}

export type AnalyzerFn = (ctx: import('./seo').PageContext) => AnalyzerResult | Promise<AnalyzerResult>
