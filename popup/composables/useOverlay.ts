import { ref } from 'vue'
import { useToast } from './useToast'
import type { OverlayMarker } from '../../utils/overlay'
import type { SeoReport } from '../../types/report'

export function buildOverlayMarkers(report: SeoReport): OverlayMarker[] {
  const markers: OverlayMarker[] = []
  const seen = new Set<string>()

  for (const rec of report.recommendations) {
    if (!rec.elementSelector || seen.has(rec.elementSelector)) continue
    seen.add(rec.elementSelector)
    markers.push({
      selector: rec.elementSelector,
      label: rec.problem.slice(0, 48),
      severity: rec.severity,
    })
  }

  const headings = report.sections.headings?.data as
    | { allHeadings?: { level: number; text: string; selector?: string }[]; missingH1?: boolean }
    | undefined
  if (headings?.missingH1) {
    markers.push({
      selector: 'body',
      label: 'Missing H1',
      severity: 'high',
    })
  }
  for (const h of headings?.allHeadings ?? []) {
    if (!h.selector || seen.has(h.selector)) continue
    if (h.level === 1) {
      seen.add(h.selector)
      markers.push({
        selector: h.selector,
        label: `H1: ${h.text.slice(0, 32) || '(empty)'}`,
        severity: 'info',
      })
    }
  }

  const images = report.sections.images?.data as
    | { brokenImageDetails?: { selector?: string; src: string }[]; missingAltSelectors?: string[] }
    | undefined
  for (const img of images?.brokenImageDetails ?? []) {
    if (!img.selector || seen.has(img.selector)) continue
    seen.add(img.selector)
    markers.push({
      selector: img.selector,
      label: 'Broken image',
      severity: 'high',
    })
  }

  return markers.slice(0, 40)
}

export function useOverlay() {
  const { toast } = useToast()
  const active = ref(false)

  async function send(type: 'SHOW_OVERLAY' | 'CLEAR_OVERLAY', markers?: OverlayMarker[]) {
    try {
      return await chrome.runtime.sendMessage({ type, markers })
    } catch {
      toast('Could not reach page — try refreshing')
      return null
    }
  }

  async function enableOverlay(report: SeoReport) {
    const markers = buildOverlayMarkers(report)
    if (markers.length === 0) {
      toast('No on-page markers available for this report')
      return
    }
    const res = await send('SHOW_OVERLAY', markers)
    if (res?.ok) {
      active.value = true
      toast(`Overlay: ${res.count} marker${res.count === 1 ? '' : 's'}`)
    } else if (res?.error) {
      toast(res.error)
    }
  }

  async function disableOverlay() {
    await send('CLEAR_OVERLAY')
    active.value = false
    toast('Overlay cleared')
  }

  async function toggleOverlay(report: SeoReport | null) {
    if (active.value) {
      await disableOverlay()
      return
    }
    if (!report) {
      toast('No report to overlay')
      return
    }
    await enableOverlay(report)
  }

  return { active, enableOverlay, disableOverlay, toggleOverlay }
}
