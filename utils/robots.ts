import type { RobotsTxtResult, SitemapPeekResult } from '../types/seo'

const FETCH_TIMEOUT_MS = 4000
const MAX_SITEMAP_URLS = 200

async function fetchText(url: string): Promise<{ ok: boolean; status: number; text: string }> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)
  try {
    const res = await fetch(url, {
      method: 'GET',
      signal: controller.signal,
      credentials: 'omit',
      cache: 'no-store',
    })
    const text = await res.text()
    return { ok: res.ok, status: res.status, text }
  } finally {
    clearTimeout(timer)
  }
}

function parseRobotsTxt(content: string, pathname: string): Pick<
  RobotsTxtResult,
  'sitemaps' | 'disallowsCurrentPath' | 'matchingDisallows' | 'allowsCurrentPath'
> {
  const lines = content.split(/\r?\n/)
  const sitemaps: string[] = []
  let inStarAgent = false
  let seenAgent = false
  const disallows: string[] = []
  const allows: string[] = []

  for (const raw of lines) {
    const line = raw.replace(/#.*$/, '').trim()
    if (!line) continue
    const colon = line.indexOf(':')
    if (colon === -1) continue
    const key = line.slice(0, colon).trim().toLowerCase()
    const value = line.slice(colon + 1).trim()

    if (key === 'user-agent') {
      const agent = value.toLowerCase()
      inStarAgent = agent === '*'
      seenAgent = true
      continue
    }
    if (key === 'sitemap' && value) {
      sitemaps.push(value)
      continue
    }
    if (!seenAgent || !inStarAgent) continue
    if (key === 'disallow') disallows.push(value)
    if (key === 'allow') allows.push(value)
  }

  const matchingDisallows = disallows.filter((d) => d && pathMatchesRule(pathname, d))
  const matchingAllows = allows.filter((a) => a && pathMatchesRule(pathname, a))

  // Longest matching Allow vs Disallow (simplified robots semantics)
  const longestDisallow = matchingDisallows.reduce((a, b) => (b.length > a.length ? b : a), '')
  const longestAllow = matchingAllows.reduce((a, b) => (b.length > a.length ? b : a), '')
  const disallowsCurrentPath =
    matchingDisallows.length > 0 && longestDisallow.length >= longestAllow.length

  return {
    sitemaps: [...new Set(sitemaps)],
    disallowsCurrentPath,
    matchingDisallows,
    allowsCurrentPath: !disallowsCurrentPath,
  }
}

function pathMatchesRule(pathname: string, rule: string): boolean {
  if (rule === '') return false
  if (rule === '/') return true
  const normalized = rule.endsWith('*') ? rule.slice(0, -1) : rule
  return pathname.startsWith(normalized)
}

function extractLocs(xml: string, limit: number): string[] {
  const locs: string[] = []
  const re = /<loc>\s*([^<]+?)\s*<\/loc>/gi
  let match: RegExpExecArray | null
  while ((match = re.exec(xml)) !== null && locs.length < limit) {
    locs.push(match[1].trim())
  }
  return locs
}

function isSitemapIndex(xml: string): boolean {
  return /<sitemapindex[\s>]/i.test(xml)
}

function normalizeUrl(url: string): string {
  try {
    const u = new URL(url)
    u.hash = ''
    let path = u.pathname
    if (path.length > 1 && path.endsWith('/')) path = path.slice(0, -1)
    u.pathname = path
    return u.href
  } catch {
    return url
  }
}

export async function fetchRobotsTxt(origin: string, pathname: string): Promise<RobotsTxtResult> {
  const url = `${origin}/robots.txt`
  try {
    const { ok, status, text } = await fetchText(url)
    if (!ok) {
      return {
        fetched: false,
        status,
        sitemaps: [],
        disallowsCurrentPath: false,
        matchingDisallows: [],
        allowsCurrentPath: true,
        error: `HTTP ${status}`,
      }
    }
    const parsed = parseRobotsTxt(text, pathname)
    return {
      fetched: true,
      status,
      contentPreview: text.slice(0, 500),
      ...parsed,
    }
  } catch (error) {
    return {
      fetched: false,
      sitemaps: [],
      disallowsCurrentPath: false,
      matchingDisallows: [],
      allowsCurrentPath: true,
      error: error instanceof Error ? error.message : 'Failed to fetch robots.txt',
    }
  }
}

export async function peekSitemap(
  origin: string,
  pageUrl: string,
  sitemapUrls: string[],
): Promise<SitemapPeekResult> {
  const candidates = [...sitemapUrls]
  if (!candidates.some((u) => u.includes('sitemap'))) {
    candidates.push(`${origin}/sitemap.xml`)
  }

  const sourceUrl = candidates[0]
  if (!sourceUrl) {
    return { fetched: false, error: 'No sitemap URL to fetch', sampleUrls: [], urlCount: 0 }
  }

  try {
    let { ok, status, text } = await fetchText(sourceUrl)
    if (!ok) {
      return {
        fetched: false,
        status,
        sourceUrl,
        sampleUrls: [],
        urlCount: 0,
        error: `HTTP ${status}`,
      }
    }

    let resolvedSource = sourceUrl
    if (isSitemapIndex(text)) {
      const nested = extractLocs(text, 5)
      if (nested[0]) {
        resolvedSource = nested[0]
        const nestedRes = await fetchText(nested[0])
        ok = nestedRes.ok
        status = nestedRes.status
        text = nestedRes.text
        if (!ok) {
          return {
            fetched: false,
            status,
            sourceUrl: resolvedSource,
            sampleUrls: [],
            urlCount: 0,
            error: `Nested sitemap HTTP ${status}`,
            isIndex: true,
          }
        }
      }
    }

    const locs = extractLocs(text, MAX_SITEMAP_URLS)
    const normalizedPage = normalizeUrl(pageUrl)
    const includesCurrentUrl = locs.some((loc) => normalizeUrl(loc) === normalizedPage)

    return {
      fetched: true,
      status,
      sourceUrl: resolvedSource,
      urlCount: locs.length,
      sampleUrls: locs.slice(0, 8),
      includesCurrentUrl,
      truncated: locs.length >= MAX_SITEMAP_URLS,
      isIndex: isSitemapIndex(text),
    }
  } catch (error) {
    return {
      fetched: false,
      sourceUrl,
      sampleUrls: [],
      urlCount: 0,
      error: error instanceof Error ? error.message : 'Failed to fetch sitemap',
    }
  }
}

export async function enrichRobotsAndSitemap(
  origin: string,
  pathname: string,
  pageUrl: string,
): Promise<{ robotsTxt: RobotsTxtResult; sitemap: SitemapPeekResult }> {
  const robotsTxt = await fetchRobotsTxt(origin, pathname)
  const sitemap = await peekSitemap(origin, pageUrl, robotsTxt.sitemaps)
  return { robotsTxt, sitemap }
}

/** Pure helper exported for unit tests */
export function parseRobotsTxtForTest(content: string, pathname: string) {
  return parseRobotsTxt(content, pathname)
}
