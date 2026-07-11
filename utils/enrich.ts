import type {
  PageContext,
  ResourceTimingSummary,
  BrokenImageResult,
  BrokenLinkResult,
  MobileAudit,
  RobotsTxtResult,
  SitemapPeekResult,
  HreflangEntry,
  LabWebVitals,
} from '../types/seo'
import type { EnrichOptions } from '../types/settings'
import { DEFAULT_ENRICH_OPTIONS } from '../types/settings'
import { queryAllDeep, getSelector, withTimeout } from './dom'
import { detectPageType } from './page-type'
import { enrichRobotsAndSitemap } from './robots'
import { collectLabWebVitals, EMPTY_LAB_WEB_VITALS } from './web-vitals'

export function collectResourceTiming(win: Window): ResourceTimingSummary {
  const entries = win.performance.getEntriesByType('resource') as PerformanceResourceTiming[]
  const byType: ResourceTimingSummary['byType'] = {}
  let slowResources = 0

  for (const entry of entries) {
    const type = entry.initiatorType || 'other'
    if (!byType[type]) byType[type] = { count: 0, totalSize: 0, totalDuration: 0 }
    byType[type].count++
    byType[type].totalSize += entry.transferSize || 0
    byType[type].totalDuration += entry.duration
    if (entry.duration > 1000) slowResources++
  }

  const nav = win.performance.getEntriesByType('navigation')[0] as
    | PerformanceNavigationTiming
    | undefined

  return {
    resourceCount: entries.length,
    byType,
    slowResources,
    domContentLoaded: nav?.domContentLoadedEventEnd ?? null,
    loadEventEnd: nav?.loadEventEnd ?? null,
    transferSizeTotal: entries.reduce((sum, e) => sum + (e.transferSize || 0), 0),
  }
}

export async function checkBrokenImages(
  doc: Document,
  maxImages: number,
  timeoutMs: number,
): Promise<BrokenImageResult[]> {
  const imgs = queryAllDeep<HTMLImageElement>(doc, 'img').slice(0, maxImages)

  return Promise.all(
    imgs.map(
      (img) =>
        new Promise<BrokenImageResult>((resolve) => {
          const src = img.currentSrc || img.src || img.getAttribute('data-src') || ''
          const selector = getSelector(img)

          if (!src || src.startsWith('data:')) {
            resolve({ src: src || '(empty)', broken: !src, selector })
            return
          }

          const done = (broken: boolean) => {
            clearTimeout(timer)
            resolve({ src, broken, selector })
          }

          const timer = setTimeout(() => done(true), timeoutMs)

          if (img.complete) {
            done(img.naturalWidth === 0)
            return
          }

          img.addEventListener('load', () => done(img.naturalWidth === 0), { once: true })
          img.addEventListener('error', () => done(true), { once: true })
        }),
    ),
  )
}

function isSkippableHref(href: string): boolean {
  if (!href) return true
  const lower = href.toLowerCase()
  return (
    lower.startsWith('#') ||
    lower.startsWith('mailto:') ||
    lower.startsWith('tel:') ||
    lower.startsWith('javascript:')
  )
}

async function checkSingleLink(
  anchor: HTMLAnchorElement,
  origin: string,
  timeoutMs: number,
): Promise<BrokenLinkResult | null> {
  const href = anchor.href
  if (isSkippableHref(href)) return null

  try {
    const url = new URL(href)
    if (url.origin !== origin) return null
  } catch {
    return null
  }

  const selector = getSelector(anchor)
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)

  try {
    let res = await fetch(href, {
      method: 'HEAD',
      credentials: 'same-origin',
      signal: controller.signal,
    })

    if (res.status === 405 || res.status === 501) {
      res = await fetch(href, {
        method: 'GET',
        credentials: 'same-origin',
        signal: controller.signal,
      })
    }

    clearTimeout(timer)
    return { href, status: res.status, broken: res.status >= 400, selector }
  } catch {
    clearTimeout(timer)
    return { href, broken: true, selector }
  }
}

export async function checkBrokenLinks(
  doc: Document,
  origin: string,
  maxLinks: number,
  timeoutMs: number,
): Promise<BrokenLinkResult[]> {
  const anchors = queryAllDeep<HTMLAnchorElement>(doc, 'a[href]')
  const seen = new Set<string>()
  const unique: HTMLAnchorElement[] = []

  for (const a of anchors) {
    if (isSkippableHref(a.href)) continue
    try {
      if (new URL(a.href).origin !== origin) continue
    } catch {
      continue
    }
    if (seen.has(a.href)) continue
    seen.add(a.href)
    unique.push(a)
    if (unique.length >= maxLinks) break
  }

  const results = await Promise.all(
    unique.map((a) => checkSingleLink(a, origin, timeoutMs)),
  )
  return results.filter((r): r is BrokenLinkResult => r !== null)
}

export function analyzeMobileElements(doc: Document): MobileAudit {
  const audit: MobileAudit = {
    smallFonts: 0,
    smallTargets: 0,
    sampledTextElements: 0,
    sampledClickables: 0,
  }

  const textEls = queryAllDeep(doc, 'p, span, a, button, li, label, h1, h2, h3, h4, h5, h6').slice(
    0,
    100,
  )
  for (const el of textEls) {
    audit.sampledTextElements++
    const fontSize = Number.parseFloat(getComputedStyle(el).fontSize)
    if (fontSize > 0 && fontSize < 12) audit.smallFonts++
  }

  const clickables = queryAllDeep(doc, 'a, button, [role="button"], input[type="submit"]').slice(
    0,
    50,
  )
  for (const el of clickables) {
    audit.sampledClickables++
    const rect = el.getBoundingClientRect()
    if (rect.width > 0 && rect.height > 0 && (rect.width < 44 || rect.height < 44)) {
      audit.smallTargets++
    }
  }

  return audit
}

const EMPTY_RESOURCE_TIMING: ResourceTimingSummary = {
  resourceCount: 0,
  byType: {},
  slowResources: 0,
  domContentLoaded: null,
  loadEventEnd: null,
  transferSizeTotal: 0,
}

const EMPTY_MOBILE_AUDIT: MobileAudit = {
  smallFonts: 0,
  smallTargets: 0,
  sampledTextElements: 0,
  sampledClickables: 0,
}

export async function enrichPageContext(
  ctx: PageContext,
  doc: Document,
  win: Window,
  options: EnrichOptions = {},
): Promise<PageContext> {
  const opts = { ...DEFAULT_ENRICH_OPTIONS, ...options }
  const enrichSkipped: string[] = []

  ctx.pageType = detectPageType({
    pathname: ctx.pathname,
    wordCount: ctx.wordCount,
    headings: ctx.headings,
    jsonLd: ctx.jsonLd,
    html: ctx.html,
  })

  ctx.resourceTiming = collectResourceTiming(win)

  const imagesPromise = checkBrokenImages(doc, opts.maxImages, opts.imageTimeoutMs)
  const linksPromise = opts.checkBrokenLinks
    ? checkBrokenLinks(doc, ctx.origin, opts.maxLinks, opts.linkTimeoutMs)
    : Promise.resolve([] as BrokenLinkResult[])
  const robotsPromise = enrichRobotsAndSitemap(ctx.origin, ctx.pathname, ctx.url)
  const vitalsPromise = collectLabWebVitals(win, doc, 400)

  const [imagesResult, linksResult, robotsResult, vitalsResult] = await Promise.all([
    withTimeout(imagesPromise, opts.analysisBudgetMs, 'broken-images'),
    withTimeout(linksPromise, opts.analysisBudgetMs, 'broken-links'),
    withTimeout(robotsPromise, opts.analysisBudgetMs, 'robots-sitemap'),
    withTimeout(vitalsPromise, Math.min(opts.analysisBudgetMs, 2000), 'web-vitals'),
  ])

  if (imagesResult.timedOut) {
    enrichSkipped.push('broken-images')
    ctx.brokenImages = []
  } else {
    ctx.brokenImages = imagesResult.result ?? []
  }

  if (!opts.checkBrokenLinks) {
    ctx.brokenLinks = []
  } else if (linksResult.timedOut) {
    enrichSkipped.push('broken-links')
    ctx.brokenLinks = []
  } else {
    ctx.brokenLinks = linksResult.result ?? []
  }

  if (robotsResult.timedOut || !robotsResult.result) {
    enrichSkipped.push('robots-sitemap')
    ctx.robotsTxt = EMPTY_ROBOTS
    ctx.sitemap = EMPTY_SITEMAP
  } else {
    ctx.robotsTxt = robotsResult.result.robotsTxt
    ctx.sitemap = robotsResult.result.sitemap
  }

  if (vitalsResult.timedOut || !vitalsResult.result) {
    enrichSkipped.push('web-vitals')
    ctx.webVitals = EMPTY_LAB_WEB_VITALS
  } else {
    ctx.webVitals = vitalsResult.result
  }

  ctx.mobileAudit = analyzeMobileElements(doc)

  if (enrichSkipped.length > 0) {
    ctx.enrichSkipped = enrichSkipped
  }

  return ctx
}

const EMPTY_ROBOTS: RobotsTxtResult = {
  fetched: false,
  sitemaps: [],
  disallowsCurrentPath: false,
  matchingDisallows: [],
  allowsCurrentPath: true,
  error: 'Skipped',
}

const EMPTY_SITEMAP: SitemapPeekResult = {
  fetched: false,
  sampleUrls: [],
  urlCount: 0,
  error: 'Skipped',
}

export function createEmptyEnrichment(): Pick<
  PageContext,
  | 'pageType'
  | 'resourceTiming'
  | 'brokenImages'
  | 'brokenLinks'
  | 'mobileAudit'
  | 'hreflang'
  | 'robotsTxt'
  | 'sitemap'
  | 'webVitals'
> {
  return {
    pageType: 'unknown',
    resourceTiming: EMPTY_RESOURCE_TIMING,
    brokenImages: [],
    brokenLinks: [],
    mobileAudit: EMPTY_MOBILE_AUDIT,
    hreflang: [] as HreflangEntry[],
    robotsTxt: EMPTY_ROBOTS,
    sitemap: EMPTY_SITEMAP,
    webVitals: EMPTY_LAB_WEB_VITALS as LabWebVitals,
  }
}
