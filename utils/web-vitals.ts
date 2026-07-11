import type { LabWebVitals } from '../types/seo'
import { getSelector } from './dom'

/** Google "good" thresholds (lab guidance). */
export const CWV_THRESHOLDS = {
  lcpGoodMs: 2500,
  lcpPoorMs: 4000,
  clsGood: 0.1,
  clsPoor: 0.25,
  inpGoodMs: 200,
  inpPoorMs: 500,
  ttfbGoodMs: 800,
} as const

interface LargestContentfulPaintEntry extends PerformanceEntry {
  element?: Element | null
  size?: number
  renderTime?: number
  loadTime?: number
  startTime: number
}

interface LayoutShiftEntry extends PerformanceEntry {
  value: number
  hadRecentInput: boolean
}

interface PerformanceEventTiming extends PerformanceEntry {
  duration: number
  interactionId?: number
  processingStart?: number
  startTime: number
}

function rating(
  value: number | null,
  good: number,
  poor: number,
): LabWebVitals['lcpRating'] {
  if (value === null || Number.isNaN(value)) return null
  if (value <= good) return 'good'
  if (value <= poor) return 'needs-improvement'
  return 'poor'
}

function observeOnce(
  win: Window,
  type: string,
  buffered: boolean,
  onEntry: (entries: PerformanceEntry[]) => void,
  extra?: Record<string, unknown>,
): PerformanceObserver | null {
  try {
    const obs = new PerformanceObserver((list) => {
      onEntry(list.getEntries())
    })
    obs.observe({ type, buffered, ...extra } as PerformanceObserverInit)
    return obs
  } catch {
    return null
  }
}

/**
 * Collect lab Core Web Vitals using PerformanceObserver only
 * (buffered). Avoids deprecated getEntriesByType for LCP/CLS/event.
 */
export async function collectLabWebVitals(
  win: Window,
  _doc: Document,
  settleMs = 400,
): Promise<LabWebVitals> {
  let lcpMs: number | null = null
  let lcpSelector: string | undefined
  let cls = 0
  let inpMs: number | null = null
  let ttfbMs: number | null = null

  // Navigation Timing is still valid via getEntriesByType
  try {
    const nav = win.performance.getEntriesByType('navigation')[0] as
      | PerformanceNavigationTiming
      | undefined
    if (nav && nav.responseStart > 0) {
      ttfbMs = Math.round(nav.responseStart)
    }
  } catch {
    // ignore
  }

  const observers: PerformanceObserver[] = []

  const lcpObs = observeOnce(win, 'largest-contentful-paint', true, (entries) => {
    const list = entries as LargestContentfulPaintEntry[]
    const last = list[list.length - 1]
    if (!last) return
    lcpMs = Math.round(last.startTime)
    if (last.element) {
      try {
        lcpSelector = getSelector(last.element)
      } catch {
        // ignore
      }
    }
  })
  if (lcpObs) observers.push(lcpObs)

  const clsObs = observeOnce(win, 'layout-shift', true, (entries) => {
    for (const entry of entries as LayoutShiftEntry[]) {
      if (!entry.hadRecentInput) cls += entry.value
    }
  })
  if (clsObs) observers.push(clsObs)

  const inpObs = observeOnce(
    win,
    'event',
    true,
    (entries) => {
      for (const entry of entries as PerformanceEventTiming[]) {
        if (entry.interactionId && entry.duration > (inpMs ?? 0)) {
          inpMs = Math.round(entry.duration)
        }
      }
    },
    { durationThreshold: 16 },
  )
  if (inpObs) observers.push(inpObs)

  await new Promise<void>((resolve) => {
    win.setTimeout(() => resolve(), settleMs)
  })

  for (const obs of observers) {
    try {
      obs.disconnect()
    } catch {
      // ignore
    }
  }

  const clsRounded = Math.round(cls * 1000) / 1000

  return {
    lcpMs,
    lcpSelector,
    lcpRating: rating(lcpMs, CWV_THRESHOLDS.lcpGoodMs, CWV_THRESHOLDS.lcpPoorMs),
    cls: clsRounded,
    clsRating: rating(clsRounded, CWV_THRESHOLDS.clsGood, CWV_THRESHOLDS.clsPoor),
    inpMs,
    inpRating: rating(inpMs, CWV_THRESHOLDS.inpGoodMs, CWV_THRESHOLDS.inpPoorMs),
    ttfbMs,
    ttfbRating: rating(ttfbMs, CWV_THRESHOLDS.ttfbGoodMs, 1800),
    note: 'lab-only',
  }
}

export const EMPTY_LAB_WEB_VITALS: LabWebVitals = {
  lcpMs: null,
  lcpRating: null,
  cls: null,
  clsRating: null,
  inpMs: null,
  inpRating: null,
  ttfbMs: null,
  ttfbRating: null,
  note: 'lab-only',
}

/** Pure helpers for unit tests */
export function rateMetric(value: number | null, good: number, poor: number) {
  return rating(value, good, poor)
}
