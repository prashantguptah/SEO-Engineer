import type { AnalysisResponse } from '../types/report'
import type { EnrichOptions } from '../types/settings'
import {
  DEFAULT_SETTINGS,
  SETTINGS_STORAGE_KEY,
  type ExtensionSettings,
} from '../types/settings'

const CONTEXT_MENU_ID = 'seo-re-analyze'
const ANALYZE_COMMAND = 'analyze-page'

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
      title: 'Analyze with SEO Reverse Engineer',
      contexts: ['page', 'frame'],
      documentUrlPatterns: ['http://*/*', 'https://*/*'],
    })
  } catch {
    // contextMenus may be unavailable in some environments
  }
}

function isRestrictedUrl(url?: string): boolean {
  if (!url) return true
  return (
    url.startsWith('chrome://') ||
    url.startsWith('chrome-extension://') ||
    url.startsWith('edge://') ||
    url.startsWith('about:') ||
    url.startsWith('https://chrome.google.com/webstore') ||
    url.startsWith('https://chromewebstore.google.com')
  )
}

async function openUiForActiveTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
  await openUiForTab(tab)
}

async function openUiForTab(tab?: chrome.tabs.Tab) {
  if (!tab?.windowId) return
  if (isRestrictedUrl(tab.url)) return

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

async function handleAnalyze(
  sendResponse: (response: AnalysisResponse) => void,
  options?: EnrichOptions,
) {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
    if (!tab?.id) {
      sendResponse({ error: 'No active tab found' })
      return
    }

    if (isRestrictedUrl(tab.url)) {
      sendResponse({
        error:
          'Cannot analyze browser internal pages. Open a normal website (https://…) and try again.',
      })
      return
    }

    let response: AnalysisResponse
    try {
      response = await chrome.tabs.sendMessage(tab.id, { type: 'RUN_ANALYSIS', options })
    } catch {
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['content-scripts/content.js'],
      })
      response = await chrome.tabs.sendMessage(tab.id, { type: 'RUN_ANALYSIS', options })
    }

    sendResponse(response)
  } catch (error) {
    sendResponse({
      error: error instanceof Error ? error.message : 'Failed to analyze page',
    })
  }
}
