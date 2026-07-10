import type { SeoReport } from '../types/report'
import { getPageTypeLabel } from '../analyzers/score'
import { reportToMarkdown } from './markdown'

/**
 * Opens a printable HTML report in a new window and triggers the browser print dialog.
 * Users can choose "Save as PDF" from the print dialog.
 */
export function exportReportPdf(report: SeoReport): void {
  const md = reportToMarkdown(report)
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>SEO Report — ${escapeHtml(report.title)}</title>
  <style>
    body { font-family: Georgia, 'Times New Roman', serif; max-width: 720px; margin: 40px auto; padding: 0 24px; color: #111; line-height: 1.5; }
    h1 { font-size: 22px; margin-bottom: 8px; }
    h2 { font-size: 16px; margin-top: 28px; border-bottom: 1px solid #ddd; padding-bottom: 4px; }
    h3 { font-size: 14px; margin-top: 16px; }
    .meta { color: #555; font-size: 13px; margin-bottom: 24px; }
    .score { font-size: 28px; font-weight: bold; }
    ul { padding-left: 20px; }
    li { margin: 4px 0; }
    pre { white-space: pre-wrap; font-family: inherit; font-size: 13px; }
    @media print { body { margin: 0; } }
  </style>
</head>
<body>
  <h1>SEO Report: ${escapeHtml(report.title)}</h1>
  <div class="meta">
    <div><strong>URL:</strong> ${escapeHtml(report.url)}</div>
    <div><strong>Page type:</strong> ${escapeHtml(getPageTypeLabel(report.pageType))}</div>
    <div><strong>Overall score:</strong> <span class="score">${report.scores.overall}</span>/100</div>
    <div><strong>Analyzed:</strong> ${escapeHtml(new Date(report.analyzedAt).toLocaleString())}</div>
  </div>
  <pre>${escapeHtml(md)}</pre>
  <script>window.onload = function() { setTimeout(function() { window.print(); }, 300); };<\/script>
</body>
</html>`

  const blob = new Blob([html], { type: 'text/html' })
  const url = URL.createObjectURL(blob)
  const win = window.open(url, '_blank')
  if (!win) {
    // Popup blocked — fallback download
    const a = document.createElement('a')
    a.href = url
    a.download = `seo-report-${Date.now()}.html`
    a.click()
  }
  setTimeout(() => URL.revokeObjectURL(url), 60_000)
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
