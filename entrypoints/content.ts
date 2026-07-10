import { buildPageContext } from '../utils/parser'
import { runAnalysis } from '../analyzers/analyzer.service'

export default defineContentScript({
  matches: ['<all_urls>'],
  runAt: 'document_idle',
  main() {
    chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
      if (message.type === 'RUN_ANALYSIS') {
        try {
          const ctx = buildPageContext(document, window)
          const report = runAnalysis(ctx)
          sendResponse({ report })
        } catch (error) {
          sendResponse({
            error: error instanceof Error ? error.message : 'Analysis failed',
          })
        }
      }
      return true
    })
  },
})
