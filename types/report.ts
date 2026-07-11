import type { AnalyzerResult, Issue, PositiveNote } from './analyzer'
import type { PageType } from './seo'

export interface ScoreBreakdown {
  overall: number
  content: number
  technical: number
  performance: number
  accessibility: number
}

export interface ScoreHistoryPoint {
  url?: string
  score: number
  analyzedAt: string
}

export interface DiffIssueSummary {
  id: string
  problem: string
  severity: import('./analyzer').Severity
}

export interface ReportDiff {
  previousScore: number
  previousAnalyzedAt: string
  scoreDelta: number
  scoreBreakdownDelta: Partial<Record<keyof ScoreBreakdown, number>>
  fixed: DiffIssueSummary[]
  newIssues: DiffIssueSummary[]
  stillOpen: DiffIssueSummary[]
}

export interface AuditLibraryEntry {
  id: string
  url: string
  title: string
  favicon: string
  score: number
  analyzedAt: string
  pageType: PageType
  report: SeoReport
}

export interface SeoReport {
  url: string
  title: string
  favicon: string
  analyzedAt: string
  durationMs: number
  pageType: PageType
  enrichSkipped?: string[]
  scores: ScoreBreakdown
  rankReasons: string[]
  positives: PositiveNote[]
  sections: Record<string, AnalyzerResult>
  recommendations: Issue[]
  scoreHistory?: ScoreHistoryPoint[]
  /** Diff vs previous run for the same URL, when available */
  reportDiff?: ReportDiff
}

export type MessageType =
  | 'ANALYZE_PAGE'
  | 'RUN_ANALYSIS'
  | 'HIGHLIGHT_ELEMENT'
  | 'SHOW_OVERLAY'
  | 'CLEAR_OVERLAY'
  | 'OPEN_SIDE_PANEL'
  | 'SYNC_SIDE_PANEL_BEHAVIOR'

export interface AnalyzePageMessage {
  type: 'ANALYZE_PAGE'
  options?: import('./settings').EnrichOptions
}

export interface RunAnalysisMessage {
  type: 'RUN_ANALYSIS'
  options?: import('./settings').EnrichOptions
}

export interface HighlightElementMessage {
  type: 'HIGHLIGHT_ELEMENT'
  selector: string
}

export interface AnalysisResponse {
  report?: SeoReport
  error?: string
}

export interface HighlightResponse {
  ok: boolean
  error?: string
}
