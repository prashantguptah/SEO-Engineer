import { describe, expect, it } from 'vitest'
import { isRestrictedUrl, restrictedPageMessage } from '../../utils/restricted-url'

describe('restricted-url', () => {
  it('flags browser and store URLs', () => {
    expect(isRestrictedUrl(undefined)).toBe(true)
    expect(isRestrictedUrl('chrome://extensions')).toBe(true)
    expect(isRestrictedUrl('chrome-extension://abc/popup.html')).toBe(true)
    expect(isRestrictedUrl('edge://settings')).toBe(true)
    expect(isRestrictedUrl('about:blank')).toBe(true)
    expect(isRestrictedUrl('https://chromewebstore.google.com/detail/x')).toBe(true)
    expect(isRestrictedUrl('https://example.com')).toBe(false)
  })

  it('returns specific messages', () => {
    expect(restrictedPageMessage('chrome://newtab')).toMatch(/browser internal/i)
    expect(restrictedPageMessage('https://chromewebstore.google.com/')).toMatch(/Web Store/i)
    expect(restrictedPageMessage('https://example.com')).toMatch(/Cannot analyze this page/i)
  })
})
