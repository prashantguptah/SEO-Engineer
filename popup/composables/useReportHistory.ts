import type { SeoReport, ScoreHistoryPoint, AuditLibraryEntry, ReportDiff } from '../../types/report'
import { diffReports, toLibraryEntry } from '../../utils/report-diff'

const HISTORY_KEY = 'seo-re-score-history'
const CACHE_KEY = 'seo-re-report-cache'
const LIBRARY_KEY = 'seo-re-audit-library'

const MAX_SCORE_POINTS = 100
const MAX_LIBRARY_ENTRIES = 20
const CACHE_TTL_MS = 60 * 60 * 1000

interface CachedReport {
  report: SeoReport
  cachedAt: number
}

export async function loadCachedReport(url: string): Promise<SeoReport | null> {
  const data = await chrome.storage.local.get(CACHE_KEY)
  const cache = (data[CACHE_KEY] ?? {}) as Record<string, CachedReport>
  const entry = cache[url]
  if (!entry) return null
  if (Date.now() - entry.cachedAt > CACHE_TTL_MS) return null
  return entry.report
}

/** Latest stored report for a URL (ignores cache TTL) — used for re-audit diffs. */
export async function loadPreviousReport(url: string): Promise<SeoReport | null> {
  const data = await chrome.storage.local.get([CACHE_KEY, LIBRARY_KEY])
  const cache = (data[CACHE_KEY] ?? {}) as Record<string, CachedReport>
  if (cache[url]?.report) return cache[url].report

  const library = (data[LIBRARY_KEY] ?? []) as AuditLibraryEntry[]
  const match = library.find((e) => e.url === url)
  return match?.report ?? null
}

export interface SaveReportResult {
  sparkline: ScoreHistoryPoint[]
  reportDiff?: ReportDiff
}

export async function saveReportToStorage(report: SeoReport): Promise<SaveReportResult> {
  const previous = await loadPreviousReport(report.url)
  const reportDiff =
    previous && previous.analyzedAt !== report.analyzedAt
      ? diffReports(previous, report)
      : undefined

  const data = await chrome.storage.local.get([HISTORY_KEY, CACHE_KEY, LIBRARY_KEY])
  const history = (data[HISTORY_KEY] ?? []) as (ScoreHistoryPoint & { url?: string })[]

  const point: ScoreHistoryPoint & { url: string } = {
    url: report.url,
    score: report.scores.overall,
    analyzedAt: report.analyzedAt,
  }
  // Keep multiple runs per URL so sparklines work
  const updatedHistory = [point, ...history].slice(0, MAX_SCORE_POINTS)

  const cache = (data[CACHE_KEY] ?? {}) as Record<string, CachedReport>
  const reportForCache: SeoReport = { ...report }
  delete reportForCache.reportDiff
  delete reportForCache.scoreHistory
  cache[report.url] = { report: reportForCache, cachedAt: Date.now() }

  const library = (data[LIBRARY_KEY] ?? []) as AuditLibraryEntry[]
  const entry = toLibraryEntry(report)
  const updatedLibrary = [entry, ...library.filter((e) => e.id !== entry.id)].slice(
    0,
    MAX_LIBRARY_ENTRIES,
  )

  await chrome.storage.local.set({
    [HISTORY_KEY]: updatedHistory,
    [CACHE_KEY]: cache,
    [LIBRARY_KEY]: updatedLibrary,
  })

  return {
    sparkline: getSparklineForUrl(report.url, updatedHistory),
    reportDiff,
  }
}

export function getSparklineForUrl(
  url: string,
  history: (ScoreHistoryPoint & { url?: string })[],
): ScoreHistoryPoint[] {
  return history
    .filter((h) => h.url === url)
    .slice(0, 10)
    .reverse()
}

export async function loadSparkline(url: string): Promise<ScoreHistoryPoint[]> {
  const data = await chrome.storage.local.get(HISTORY_KEY)
  const history = (data[HISTORY_KEY] ?? []) as (ScoreHistoryPoint & { url?: string })[]
  return getSparklineForUrl(url, history)
}

export async function loadAuditLibrary(): Promise<AuditLibraryEntry[]> {
  const data = await chrome.storage.local.get(LIBRARY_KEY)
  return ((data[LIBRARY_KEY] ?? []) as AuditLibraryEntry[])
}

export async function deleteAuditEntry(id: string): Promise<AuditLibraryEntry[]> {
  const library = await loadAuditLibrary()
  const updated = library.filter((e) => e.id !== id)
  await chrome.storage.local.set({ [LIBRARY_KEY]: updated })
  return updated
}

export async function clearAuditLibrary(): Promise<void> {
  await chrome.storage.local.set({ [LIBRARY_KEY]: [] })
}
