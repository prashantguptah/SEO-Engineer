export interface OverlayMarker {
  selector: string
  label: string
  severity: 'high' | 'medium' | 'low' | 'info'
}

const OVERLAY_STYLE_ID = 'seo-re-overlay-style'
const OVERLAY_ROOT_ID = 'seo-re-overlay-root'
const BADGE_ATTR = 'data-seo-re-badge'

const SEVERITY_COLOR: Record<OverlayMarker['severity'], string> = {
  high: '#f87171',
  medium: '#fbbf24',
  low: '#60a5fa',
  info: '#a78bfa',
}

function injectOverlayStyles() {
  if (document.getElementById(OVERLAY_STYLE_ID)) return
  const style = document.createElement('style')
  style.id = OVERLAY_STYLE_ID
  style.textContent = `
    #${OVERLAY_ROOT_ID} {
      position: absolute;
      inset: 0;
      pointer-events: none;
      z-index: 2147483646;
    }
    .seo-re-overlay-badge {
      position: absolute;
      transform: translate(-50%, -100%);
      margin-top: -4px;
      max-width: 220px;
      padding: 3px 8px;
      border-radius: 999px;
      font: 600 11px/1.3 system-ui, sans-serif;
      color: #0f172a;
      background: #fbbf24;
      box-shadow: 0 2px 8px rgba(0,0,0,.35);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      pointer-events: none;
    }
    .seo-re-overlay-outline {
      outline: 2px dashed currentColor !important;
      outline-offset: 2px !important;
    }
  `
  document.head.appendChild(style)
}

function ensureRoot(): HTMLElement {
  let root = document.getElementById(OVERLAY_ROOT_ID)
  if (!root) {
    root = document.createElement('div')
    root.id = OVERLAY_ROOT_ID
    document.documentElement.appendChild(root)
  }
  return root
}

export function clearOverlay(): { ok: boolean; count: number } {
  document.querySelectorAll(`[${BADGE_ATTR}]`).forEach((el) => {
    el.classList.remove('seo-re-overlay-outline')
    ;(el as HTMLElement).style.removeProperty('color')
    el.removeAttribute(BADGE_ATTR)
  })
  const root = document.getElementById(OVERLAY_ROOT_ID)
  if (root) root.remove()
  return { ok: true, count: 0 }
}

export function showOverlay(markers: OverlayMarker[]): { ok: boolean; count: number; error?: string } {
  try {
    injectOverlayStyles()
    clearOverlay()
    const root = ensureRoot()
    let count = 0

    for (const marker of markers.slice(0, 40)) {
      let el: Element | null = null
      try {
        el = document.querySelector(marker.selector)
      } catch {
        continue
      }
      if (!el || !(el instanceof HTMLElement)) continue

      const color = SEVERITY_COLOR[marker.severity] ?? SEVERITY_COLOR.info
      el.setAttribute(BADGE_ATTR, '1')
      el.classList.add('seo-re-overlay-outline')
      el.style.color = color

      const rect = el.getBoundingClientRect()
      if (rect.width === 0 && rect.height === 0) continue

      const badge = document.createElement('div')
      badge.className = 'seo-re-overlay-badge'
      badge.textContent = marker.label
      badge.style.background = color
      badge.style.left = `${rect.left + window.scrollX + Math.min(rect.width / 2, 40)}px`
      badge.style.top = `${rect.top + window.scrollY}px`
      root.appendChild(badge)
      count++
    }

    return { ok: true, count }
  } catch (error) {
    return {
      ok: false,
      count: 0,
      error: error instanceof Error ? error.message : 'Overlay failed',
    }
  }
}

export function isOverlayActive(): boolean {
  return !!document.getElementById(OVERLAY_ROOT_ID)?.childElementCount
}
