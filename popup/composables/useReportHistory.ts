import type { SeoReport, ScoreHistoryPoint } from '../../types/report'

const HISTORY_KEY = 'seo-re-score-history'
const CACHE_KEY = 'seo-re-report-cache'

interface CachedReport {
  report: SeoReport
  cachedAt: number
}

export async function loadCachedReport(url: string): Promise<SeoReport | null> {
  const data = await chrome.storage.local.get(CACHE_KEY)
  const cache = (data[CACHE_KEY] ?? {}) as Record<string, CachedReport>
  const entry = cache[url]
  if (!entry) return null
  // Cache valid for 1 hour
  if (Date.now() - entry.cachedAt > 60 * 60 * 1000) return null
  return entry.report
}

export async function saveReportToStorage(report: SeoReport): Promise<ScoreHistoryPoint[]> {
  const data = await chrome.storage.local.get([HISTORY_KEY, CACHE_KEY])
  const history: ScoreHistoryPoint[] = (data[HISTORY_KEY] ?? []) as ScoreHistoryPoint[]

  const urlHistory = history.filter((h) => (h as ScoreHistoryPoint & { url?: string }).url !== report.url)
  const point: ScoreHistoryPoint & { url: string } = {
    url: report.url,
    score: report.scores.overall,
    analyzedAt: report.analyzedAt,
  }
  const updatedHistory = [point, ...urlHistory].slice(0, 100) as (ScoreHistoryPoint & { url: string })[]

  const cache = (data[CACHE_KEY] ?? {}) as Record<string, CachedReport>
  cache[report.url] = { report, cachedAt: Date.now() }

  await chrome.storage.local.set({
    [HISTORY_KEY]: updatedHistory,
    [CACHE_KEY]: cache,
  })

  return getSparklineForUrl(report.url, updatedHistory)
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
