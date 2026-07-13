import { buildPageContext } from '../utils/parser'
import { enrichPageContext } from '../utils/enrich'
import { waitForStableDom } from '../utils/dom'
import { runAnalysis } from '../analyzers/analyzer.service'
import { showOverlay, clearOverlay, type OverlayMarker } from '../utils/overlay'
import {
  DEFAULT_ENRICH_OPTIONS,
  DEFAULT_SETTINGS,
  SETTINGS_STORAGE_KEY,
  parseKeywordList,
  type EnrichOptions,
  type ExtensionSettings,
} from '../types/settings'

const HIGHLIGHT_STYLE_ID = 'seo-re-highlight-style'

function injectHighlightStyles() {
  if (document.getElementById(HIGHLIGHT_STYLE_ID)) return
  const style = document.createElement('style')
  style.id = HIGHLIGHT_STYLE_ID
  style.textContent = `
    .seo-re-highlight {
      outline: 3px solid #00e8f0 !important;
      outline-offset: 2px !important;
      transition: outline 0.2s ease;
    }
  `
  document.head.appendChild(style)
}

function highlightElement(selector: string): { ok: boolean; error?: string } {
  try {
    const el = document.querySelector(selector)
    if (!el) return { ok: false, error: 'Element not found on page' }
    el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    el.classList.add('seo-re-highlight')
    setTimeout(() => el.classList.remove('seo-re-highlight'), 2500)
    return { ok: true }
  } catch {
    return { ok: false, error: 'Invalid selector' }
  }
}

async function loadSettings(): Promise<ExtensionSettings> {
  try {
    const data = await chrome.storage.local.get(SETTINGS_STORAGE_KEY)
    return { ...DEFAULT_SETTINGS, ...(data[SETTINGS_STORAGE_KEY] ?? {}) }
  } catch {
    return { ...DEFAULT_SETTINGS }
  }
}

async function executeAnalysis(
  options?: EnrichOptions & { targetKeyword?: string; secondaryKeywords?: string | string[] },
): Promise<{ report?: Awaited<ReturnType<typeof runAnalysis>>; error?: string }> {
  try {
    const settings = await loadSettings()
    const enrichOpts: EnrichOptions = {
      ...DEFAULT_ENRICH_OPTIONS,
      checkBrokenLinks: options?.checkBrokenLinks ?? settings.checkBrokenLinks,
      analysisBudgetMs: options?.analysisBudgetMs ?? settings.analysisBudgetMs,
      hydrationWaitMs: options?.hydrationWaitMs ?? settings.hydrationWaitMs,
      targetKeyword: options?.targetKeyword ?? settings.targetKeyword,
      secondaryKeywords: options?.secondaryKeywords ?? settings.secondaryKeywords,
    }

    const waitMs = enrichOpts.hydrationWaitMs ?? DEFAULT_ENRICH_OPTIONS.hydrationWaitMs
    await waitForStableDom(document, window, waitMs)

    let ctx = buildPageContext(document, window)
    if (enrichOpts.targetKeyword) {
      ctx.targetKeyword = enrichOpts.targetKeyword
    }
    const secondary = parseKeywordList(enrichOpts.secondaryKeywords)
    if (secondary.length) {
      ctx.secondaryKeywords = secondary
    }
    ctx = await enrichPageContext(ctx, document, window, enrichOpts)

    const report = await runAnalysis(ctx)
    return { report }
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Analysis failed',
    }
  }
}

export default defineContentScript({
  matches: ['<all_urls>'],
  runAt: 'document_idle',
  main() {
    injectHighlightStyles()

    chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
      if (message.type === 'RUN_ANALYSIS') {
        executeAnalysis(message.options).then(sendResponse)
        return true
      }
      if (message.type === 'HIGHLIGHT_ELEMENT') {
        sendResponse(highlightElement(message.selector))
        return true
      }
      if (message.type === 'SHOW_OVERLAY') {
        const markers = (message.markers ?? []) as OverlayMarker[]
        sendResponse(showOverlay(markers))
        return true
      }
      if (message.type === 'CLEAR_OVERLAY') {
        sendResponse(clearOverlay())
        return true
      }
    })
  },
})
