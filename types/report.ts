import type { AnalyzerResult, Issue } from './analyzer'

export interface ScoreBreakdown {
  overall: number
  content: number
  technical: number
  performance: number
  accessibility: number
}

export interface SeoReport {
  url: string
  title: string
  favicon: string
  analyzedAt: string
  durationMs: number
  scores: ScoreBreakdown
  rankReasons: string[]
  sections: Record<string, AnalyzerResult>
  recommendations: Issue[]
}

export type MessageType = 'ANALYZE_PAGE' | 'RUN_ANALYSIS'

export interface AnalyzePageMessage {
  type: 'ANALYZE_PAGE'
}

export interface RunAnalysisMessage {
  type: 'RUN_ANALYSIS'
}

export interface AnalysisResponse {
  report?: SeoReport
  error?: string
}
