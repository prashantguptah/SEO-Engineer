import type { AnalysisResponse, HighlightResponse, OverlayActionResponse } from '../types/report'
import type { EnrichOptions } from '../types/settings'
import {
  DEFAULT_SETTINGS,
  SETTINGS_STORAGE_KEY,
  type ExtensionSettings,
} from '../types/settings'
import { isRestrictedUrl, restrictedPageMessage } from '../utils/restricted-url'
import type { OverlayMarker } from '../utils/overlay'

const CONTEXT_MENU_ID = 'seo-re-analyze'
const ANALYZE_COMMAND = 'analyze-page'
const CONTENT_SCRIPT_FILE = 'content-scripts/content.js'

export default defineBackground(() => {
  void applySidePanelBehaviorFromStorage()
  void ensureContextMenu()

  chrome.runtime.onInstalled.addListener(() => {
    void ensureContextMenu()
  })

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== 'local' || !changes[SETTINGS_STORAGE_KEY]) return
    const next = {
      ...DEFAULT_SETTINGS,
      ...(changes[SETTINGS_STORAGE_KEY].newValue as Partial<ExtensionSettings> | undefined),
    }
    void setOpenPanelOnActionClick(next.openAsSidePanel)
  })

  chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId !== CONTEXT_MENU_ID) return
    void openUiForTab(tab)
  })

  chrome.commands.onCommand.addListener((command) => {
    if (command !== ANALYZE_COMMAND) return
    void openUiForActiveTab()
  })

  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message.type === 'ANALYZE_PAGE') {
      handleAnalyze(sendResponse, message.options)
      return true
    }
    if (message.type === 'HIGHLIGHT_ELEMENT') {
      handleTabMessage(sendResponse, {
        type: 'HIGHLIGHT_ELEMENT',
        selector: message.selector,
      })
      return true
    }
    if (message.type === 'SHOW_OVERLAY') {
      handleTabMessage(sendResponse, {
        type: 'SHOW_OVERLAY',
        markers: message.markers,
      })
      return true
    }
    if (message.type === 'CLEAR_OVERLAY') {
      handleTabMessage(sendResponse, { type: 'CLEAR_OVERLAY' })
      return true
    }
    if (message.type === 'OPEN_SIDE_PANEL') {
      handleOpenSidePanel(sendResponse)
      return true
    }
    if (message.type === 'SYNC_SIDE_PANEL_BEHAVIOR') {
      const enabled = Boolean(message.enabled)
      setOpenPanelOnActionClick(enabled)
        .then(() => sendResponse({ ok: true }))
        .catch((error: unknown) =>
          sendResponse({
            ok: false,
            error: error instanceof Error ? error.message : 'Failed to sync side panel',
          }),
        )
      return true
    }
  })
})

async function ensureContextMenu() {
  try {
    await chrome.contextMenus.removeAll()
    chrome.contextMenus.create({
      id: CONTEXT_MENU_ID,
      title: 'Analyze with keywordwalks',
      contexts: ['page', 'frame'],
      documentUrlPatterns: ['http://*/*', 'https://*/*'],
    })
  } catch {
    // contextMenus may be unavailable in some environments
  }
}

async function openUiForActiveTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
  await openUiForTab(tab)
}

async function openUiForTab(tab?: chrome.tabs.Tab) {
  if (!tab?.windowId) return
  // Still open UI on restricted pages so the panel can show a clear error.
  try {
    await chrome.sidePanel.open({ windowId: tab.windowId })
  } catch {
    // Side panel may fail if not allowed; user can still use the toolbar icon
  }
}

async function applySidePanelBehaviorFromStorage() {
  try {
    const data = await chrome.storage.local.get(SETTINGS_STORAGE_KEY)
    const settings: ExtensionSettings = {
      ...DEFAULT_SETTINGS,
      ...(data[SETTINGS_STORAGE_KEY] as Partial<ExtensionSettings> | undefined),
    }
    await setOpenPanelOnActionClick(settings.openAsSidePanel)
  } catch {
    await setOpenPanelOnActionClick(DEFAULT_SETTINGS.openAsSidePanel)
  }
}

async function setOpenPanelOnActionClick(enabled: boolean) {
  if (!chrome.sidePanel?.setPanelBehavior) return
  await chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: enabled })
}

async function handleOpenSidePanel(sendResponse: (r: { ok: boolean; error?: string }) => void) {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
    if (!tab?.windowId) {
      sendResponse({ ok: false, error: 'No active window' })
      return
    }
    await chrome.sidePanel.open({ windowId: tab.windowId })
    sendResponse({ ok: true })
  } catch (error) {
    sendResponse({
      ok: false,
      error: error instanceof Error ? error.message : 'Failed to open side panel',
    })
  }
}

/** Ensure content script is listening (ping → inject if needed), then send a message. */
async function ensureContentScript(tabId: number): Promise<void> {
  try {
    const pong = await chrome.tabs.sendMessage(tabId, { type: 'PING' })
    if (pong?.ok) return
  } catch {
    // not injected yet
  }
  await chrome.scripting.executeScript({
    target: { tabId },
    files: [CONTENT_SCRIPT_FILE],
  })
}

async function sendToTab<T>(tabId: number, message: unknown): Promise<T> {
  await ensureContentScript(tabId)
  try {
    return (await chrome.tabs.sendMessage(tabId, message)) as T
  } catch {
    // Race: script registered after inject but listener not ready yet
    await chrome.scripting.executeScript({
      target: { tabId },
      files: [CONTENT_SCRIPT_FILE],
    })
    return (await chrome.tabs.sendMessage(tabId, message)) as T
  }
}

async function getActiveTab(): Promise<chrome.tabs.Tab | undefined> {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
  return tab
}

async function handleAnalyze(
  sendResponse: (response: AnalysisResponse) => void,
  options?: EnrichOptions,
) {
  try {
    const tab = await getActiveTab()
    if (!tab?.id) {
      sendResponse({ error: 'No active tab found' })
      return
    }

    if (isRestrictedUrl(tab.url)) {
      sendResponse({ error: restrictedPageMessage(tab.url) })
      return
    }

    const response = await sendToTab<AnalysisResponse>(tab.id, {
      type: 'RUN_ANALYSIS',
      options,
    })
    sendResponse(response)
  } catch (error) {
    sendResponse({
      error: error instanceof Error ? error.message : 'Failed to analyze page',
    })
  }
}

async function handleTabMessage(
  sendResponse: (response: HighlightResponse | OverlayActionResponse) => void,
  message: {
    type: 'HIGHLIGHT_ELEMENT' | 'SHOW_OVERLAY' | 'CLEAR_OVERLAY'
    selector?: string
    markers?: OverlayMarker[]
  },
) {
  try {
    const tab = await getActiveTab()
    if (!tab?.id) {
      sendResponse({ ok: false, error: 'No active tab found' })
      return
    }
    if (isRestrictedUrl(tab.url)) {
      sendResponse({ ok: false, error: restrictedPageMessage(tab.url) })
      return
    }
    const response = await sendToTab<HighlightResponse | OverlayActionResponse>(tab.id, message)
    sendResponse(response)
  } catch (error) {
    sendResponse({
      ok: false,
      error: error instanceof Error ? error.message : 'Could not reach page — try refreshing',
    })
  }
}
