/** Pages Chrome blocks from extension content scripts / scripting. */
export function isRestrictedUrl(url?: string): boolean {
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

export function restrictedPageMessage(url?: string): string {
  if (!url) {
    return 'No usable page URL. Open a normal website (https://…) in this tab, then try again.'
  }
  if (url.startsWith('chrome://') || url.startsWith('edge://') || url.startsWith('about:')) {
    return 'Cannot analyze browser internal pages (chrome://, edge://, about:). Open a normal website (https://…) and try again.'
  }
  if (url.startsWith('chrome-extension://')) {
    return 'Cannot analyze extension pages. Open a normal website (https://…) and try again.'
  }
  if (
    url.startsWith('https://chrome.google.com/webstore') ||
    url.startsWith('https://chromewebstore.google.com')
  ) {
    return 'Cannot analyze the Chrome Web Store. Open a normal website (https://…) and try again.'
  }
  return 'Cannot analyze this page. Open a normal website (https://…) and try again.'
}
