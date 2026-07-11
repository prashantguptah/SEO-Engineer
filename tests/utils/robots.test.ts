import { describe, it, expect } from 'vitest'
import { parseRobotsTxtForTest } from '../../utils/robots'

describe('parseRobotsTxt', () => {
  it('detects disallow for current path under User-agent *', () => {
    const content = `
User-agent: *
Disallow: /private
Disallow: /admin
Sitemap: https://example.com/sitemap.xml
`
    const result = parseRobotsTxtForTest(content, '/private/page')
    expect(result.disallowsCurrentPath).toBe(true)
    expect(result.matchingDisallows).toContain('/private')
    expect(result.sitemaps).toEqual(['https://example.com/sitemap.xml'])
  })

  it('allows path when not disallowed', () => {
    const content = `
User-agent: *
Disallow: /admin
Allow: /
`
    const result = parseRobotsTxtForTest(content, '/blog/hello')
    expect(result.disallowsCurrentPath).toBe(false)
    expect(result.allowsCurrentPath).toBe(true)
  })

  it('ignores rules for other user-agents', () => {
    const content = `
User-agent: Googlebot
Disallow: /

User-agent: *
Disallow: /tmp
`
    const result = parseRobotsTxtForTest(content, '/')
    expect(result.disallowsCurrentPath).toBe(false)
  })
})
