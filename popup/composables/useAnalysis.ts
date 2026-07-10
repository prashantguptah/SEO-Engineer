import { useClipboard } from '@vueuse/core'
import { useReportStore } from '../stores/report'
import { reportToMarkdown } from '../../utils/markdown'
import { exportReportPdf } from '../../utils/pdf'
import type { SeoReport } from '../../types/report'
import { loadCachedReport, saveReportToStorage } from './useReportHistory'
import { useToast } from './useToast'
import { useSettings } from './useSettings'

export function useAnalysis() {
  const store = useReportStore()
  const { toast } = useToast()
  const { settings, loadSettings } = useSettings()
  const { copy: copyToClipboard } = useClipboard()

  async function analyze(showCache = true) {
    store.setLoading(true)
    store.error = null

    try {
      await loadSettings()
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
      const tabUrl = tab?.url

      if (showCache && tabUrl) {
        const cached = await loadCachedReport(tabUrl)
        if (cached) {
          store.setReport(cached)
          store.setLoading(false)
        }
      }

      const response = await chrome.runtime.sendMessage({
        type: 'ANALYZE_PAGE',
        options: {
          checkBrokenLinks: settings.value.checkBrokenLinks,
          hydrationWaitMs: settings.value.hydrationWaitMs,
          analysisBudgetMs: settings.value.analysisBudgetMs,
          targetKeyword: settings.value.targetKeyword,
        },
      })
      if (response?.error) {
        if (!store.report) store.setError(response.error)
        else toast(`Refresh failed: ${response.error}`)
        return
      }
      if (response?.report) {
        const report = response.report as SeoReport
        const sparkline = await saveReportToStorage(report)
        report.scoreHistory = sparkline
        store.setReport(report)
      } else if (!store.report) {
        store.setError('No report received')
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Analysis failed'
      if (!store.report) store.setError(msg)
      else toast(`Refresh failed: ${msg}`)
    } finally {
      store.setLoading(false)
    }
  }

  async function copyReportJson() {
    if (!store.report) return
    await copyToClipboard(JSON.stringify(store.report, null, 2))
    toast('JSON report copied!')
  }

  async function copyReportMarkdown() {
    if (!store.report) return
    await copyToClipboard(reportToMarkdown(store.report))
    toast('Markdown report copied!')
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
    toast('Report downloaded')
  }

  function exportPdf() {
    if (!store.report) return
    exportReportPdf(store.report)
    toast('Opening print dialog for PDF...')
  }

  return { analyze, copyReportJson, copyReportMarkdown, downloadReport, exportPdf }
}
