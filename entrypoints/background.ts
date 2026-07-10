import type { AnalysisResponse } from '../types/report'

export default defineBackground(() => {
  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message.type === 'ANALYZE_PAGE') {
      handleAnalyze(sendResponse)
      return true
    }
  })
})

async function handleAnalyze(sendResponse: (response: AnalysisResponse) => void) {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
    if (!tab?.id) {
      sendResponse({ error: 'No active tab found' })
      return
    }

    if (tab.url?.startsWith('chrome://') || tab.url?.startsWith('chrome-extension://')) {
      sendResponse({ error: 'Cannot analyze browser internal pages' })
      return
    }

    let response: AnalysisResponse
    try {
      response = await chrome.tabs.sendMessage(tab.id, { type: 'RUN_ANALYSIS' })
    } catch {
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['content-scripts/content.js'],
      })
      response = await chrome.tabs.sendMessage(tab.id, { type: 'RUN_ANALYSIS' })
    }

    sendResponse(response)
  } catch (error) {
    sendResponse({
      error: error instanceof Error ? error.message : 'Failed to analyze page',
    })
  }
}
