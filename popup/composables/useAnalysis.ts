import { useReportStore } from '../stores/report'
import type { SeoReport } from '../../types/report'

export function useAnalysis() {
  const store = useReportStore()

  async function analyze() {
    store.setLoading(true)
    store.error = null
    try {
      const response = await chrome.runtime.sendMessage({ type: 'ANALYZE_PAGE' })
      if (response?.error) {
        store.setError(response.error)
        return
      }
      if (response?.report) {
        store.setReport(response.report as SeoReport)
      } else {
        store.setError('No report received')
      }
    } catch (err) {
      store.setError(err instanceof Error ? err.message : 'Analysis failed')
    }
  }

  function copyReport() {
    if (!store.report) return
    navigator.clipboard.writeText(JSON.stringify(store.report, null, 2))
  }

  function downloadReport() {
    if (!store.report) return
    const blob = new Blob([JSON.stringify(store.report, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `seo-report-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return { analyze, copyReport, downloadReport }
}
