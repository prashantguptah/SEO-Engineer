import type { SeoReport } from '../types/report'
import { getPageTypeLabel } from '../analyzers/score'

/**
 * Opens a branded printable HTML report and triggers the browser print dialog.
 * Users can choose "Save as PDF" from the print dialog.
 */
export function exportReportPdf(report: SeoReport): void {
  const html = buildBrandedReportHtml(report)
  const blob = new Blob([html], { type: 'text/html' })
  const url = URL.createObjectURL(blob)
  const win = window.open(url, '_blank')
  if (!win) {
    const a = document.createElement('a')
    a.href = url
    a.download = `seo-report-${Date.now()}.html`
    a.click()
  }
  setTimeout(() => URL.revokeObjectURL(url), 60_000)
}

export function buildBrandedReportHtml(report: SeoReport): string {
  const analyzed = new Date(report.analyzedAt).toLocaleString()
  const pageType = getPageTypeLabel(report.pageType)
  const topFixes = [...report.recommendations]
    .sort((a, b) => severityRank(a.severity) - severityRank(b.severity))
    .slice(0, 10)
  const positives = report.positives.slice(0, 8)
  const reasons = report.rankReasons.slice(0, 8)

  const scoreBars = (
    [
      ['Content', report.scores.content],
      ['Technical', report.scores.technical],
      ['Performance', report.scores.performance],
      ['Accessibility', report.scores.accessibility],
    ] as const
  )
    .map(
      ([label, score]) => `
      <div class="bar-row">
        <span class="bar-label">${escapeHtml(label)}</span>
        <div class="bar-track"><div class="bar-fill" style="width:${score}%;background:${scoreColor(score)}"></div></div>
        <span class="bar-val">${score}</span>
      </div>`,
    )
    .join('')

  const fixesHtml =
    topFixes.length === 0
      ? '<p class="muted">No critical issues found.</p>'
      : topFixes
          .map(
            (rec, i) => `
      <div class="fix">
        <div class="fix-head">
          <span class="sev sev-${rec.severity}">${escapeHtml(rec.severity.toUpperCase())}</span>
          <span class="fix-num">${i + 1}</span>
        </div>
        <p class="fix-title">${escapeHtml(rec.problem)}</p>
        <p class="fix-why"><strong>Why:</strong> ${escapeHtml(rec.whyItMatters)}</p>
        <p class="fix-how"><strong>Fix:</strong> ${escapeHtml(rec.suggestedFix)}</p>
      </div>`,
          )
          .join('')

  const reasonsHtml = reasons.map((r) => `<li>${escapeHtml(r)}</li>`).join('')
  const positivesHtml = positives.map((p) => `<li>${escapeHtml(p.message)}</li>`).join('')

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>SEO Reverse Engineer — ${escapeHtml(report.title)}</title>
  <style>
    :root {
      --ink: #0f172a;
      --muted: #64748b;
      --line: #e2e8f0;
      --brand: #4f46e5;
      --brand-soft: #eef2ff;
      --surface: #f8fafc;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      color: var(--ink);
      font-family: "Segoe UI", system-ui, -apple-system, sans-serif;
      font-size: 13px;
      line-height: 1.45;
      background: #fff;
    }
    .page { max-width: 800px; margin: 0 auto; padding: 32px 40px 48px; }
    .brand-bar {
      display: flex; align-items: center; justify-content: space-between;
      padding: 14px 18px; border-radius: 12px;
      background: linear-gradient(135deg, #312e81 0%, #4f46e5 55%, #6366f1 100%);
      color: #fff; margin-bottom: 28px;
    }
    .brand-name { font-size: 15px; font-weight: 700; letter-spacing: 0.02em; }
    .brand-sub { font-size: 11px; opacity: 0.85; margin-top: 2px; }
    .brand-meta { text-align: right; font-size: 11px; opacity: 0.9; }
    h1 { font-size: 22px; margin: 0 0 6px; line-height: 1.25; }
    .url { color: var(--muted); font-size: 12px; word-break: break-all; margin-bottom: 20px; }
    .exec {
      display: grid; grid-template-columns: 140px 1fr; gap: 20px;
      padding: 18px; border: 1px solid var(--line); border-radius: 12px;
      background: var(--surface); margin-bottom: 28px;
    }
    .score-ring {
      width: 120px; height: 120px; border-radius: 50%;
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      border: 8px solid ${scoreColor(report.scores.overall)};
      background: #fff;
    }
    .score-ring .num { font-size: 36px; font-weight: 800; line-height: 1; color: ${scoreColor(report.scores.overall)}; }
    .score-ring .lbl { font-size: 10px; text-transform: uppercase; color: var(--muted); letter-spacing: 0.06em; margin-top: 4px; }
    .exec-copy h2 { font-size: 14px; margin: 0 0 8px; text-transform: uppercase; letter-spacing: 0.04em; color: var(--muted); }
    .exec-copy p { margin: 0 0 8px; }
    .pill {
      display: inline-block; font-size: 11px; padding: 3px 8px; border-radius: 999px;
      background: var(--brand-soft); color: var(--brand); font-weight: 600; margin-right: 6px;
    }
    h2.section {
      font-size: 15px; margin: 28px 0 12px; padding-bottom: 6px;
      border-bottom: 2px solid var(--brand); color: var(--ink);
    }
    .bar-row { display: grid; grid-template-columns: 110px 1fr 36px; gap: 10px; align-items: center; margin: 6px 0; }
    .bar-label { color: var(--muted); font-size: 12px; }
    .bar-track { height: 8px; background: #e2e8f0; border-radius: 999px; overflow: hidden; }
    .bar-fill { height: 100%; border-radius: 999px; }
    .bar-val { text-align: right; font-weight: 700; font-size: 12px; }
    ul.clean { margin: 0; padding-left: 18px; }
    ul.clean li { margin: 4px 0; }
    .fix {
      border: 1px solid var(--line); border-radius: 10px; padding: 12px 14px; margin: 10px 0;
      break-inside: avoid;
    }
    .fix-head { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; }
    .fix-num { margin-left: auto; color: var(--muted); font-size: 11px; }
    .fix-title { font-weight: 700; margin: 0 0 6px; font-size: 13px; }
    .fix-why, .fix-how { margin: 0 0 4px; color: #334155; font-size: 12px; }
    .sev { font-size: 10px; font-weight: 700; padding: 2px 7px; border-radius: 999px; letter-spacing: 0.04em; }
    .sev-high { background: #fee2e2; color: #b91c1c; }
    .sev-medium { background: #fef3c7; color: #b45309; }
    .sev-low { background: #e0f2fe; color: #0369a1; }
    .muted { color: var(--muted); }
    .footer {
      margin-top: 36px; padding-top: 14px; border-top: 1px solid var(--line);
      display: flex; justify-content: space-between; color: var(--muted); font-size: 11px;
    }
    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .page { padding: 12px 16px; max-width: none; }
      .brand-bar { break-after: avoid; }
      .exec { break-inside: avoid; }
    }
  </style>
</head>
<body>
  <div class="page">
    <header class="brand-bar">
      <div>
        <div class="brand-name">SEO Reverse Engineer</div>
        <div class="brand-sub">On-page SEO audit report</div>
      </div>
      <div class="brand-meta">
        <div>${escapeHtml(analyzed)}</div>
        <div>${escapeHtml(pageType)}</div>
      </div>
    </header>

    <h1>${escapeHtml(report.title || 'Untitled page')}</h1>
    <p class="url">${escapeHtml(report.url)}</p>

    <section class="exec">
      <div class="score-ring">
        <div class="num">${report.scores.overall}</div>
        <div class="lbl">Overall</div>
      </div>
      <div class="exec-copy">
        <h2>Executive summary</h2>
        <p>
          <span class="pill">${escapeHtml(pageType)}</span>
          <span class="pill">${report.recommendations.length} issue${report.recommendations.length === 1 ? '' : 's'}</span>
          <span class="pill">${report.durationMs}ms</span>
        </p>
        <p>
          This page scored <strong>${report.scores.overall}/100</strong>.
          ${
            report.scores.overall >= 80
              ? 'Strong on-page foundations with room for selective polish.'
              : report.scores.overall >= 60
                ? 'Solid baseline — prioritize the high-severity fixes below for the biggest gains.'
                : 'Several foundational gaps are holding the score back; start with high-severity fixes.'
          }
        </p>
        ${
          report.reportDiff
            ? `<p class="muted">Since last audit: score ${report.reportDiff.scoreDelta >= 0 ? '+' : ''}${report.reportDiff.scoreDelta}
               · ${report.reportDiff.fixed.length} fixed · ${report.reportDiff.newIssues.length} new</p>`
            : ''
        }
      </div>
    </section>

    <h2 class="section">Score breakdown</h2>
    ${scoreBars}

    ${
      reasons.length
        ? `<h2 class="section">Why this page ranks</h2><ul class="clean">${reasonsHtml}</ul>`
        : ''
    }

    ${
      positives.length
        ? `<h2 class="section">What's working well</h2><ul class="clean">${positivesHtml}</ul>`
        : ''
    }

    <h2 class="section">Top fixes${topFixes.length ? ` (${topFixes.length})` : ''}</h2>
    ${fixesHtml}

    <footer class="footer">
      <span>Generated by SEO Reverse Engineer</span>
      <span>${escapeHtml(report.url)}</span>
    </footer>
  </div>
  <script>window.onload = function() { setTimeout(function() { window.print(); }, 350); };<\/script>
</body>
</html>`
}

function severityRank(s: string): number {
  if (s === 'high') return 0
  if (s === 'medium') return 1
  return 2
}

function scoreColor(score: number): string {
  if (score >= 80) return '#059669'
  if (score >= 60) return '#d97706'
  return '#dc2626'
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
