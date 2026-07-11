import type { PageContext, HeadingItem, LinkItem, ImageItem, HreflangEntry } from '../types/seo'
import { queryAllDeep, getSelector } from './dom'
import { createEmptyEnrichment } from './enrich'

export function buildPageContext(doc: Document, win: Window): PageContext {
  const url = win.location.href
  const origin = win.location.origin
  const meta: Record<string, string> = {}

  doc.querySelectorAll('meta[name], meta[property], meta[http-equiv]').forEach((el) => {
    const key =
      el.getAttribute('name') ||
      el.getAttribute('property') ||
      el.getAttribute('http-equiv') ||
      ''
    const content = el.getAttribute('content') || ''
    if (key) meta[key.toLowerCase()] = content
  })

  const linkRels: { rel: string; href: string }[] = []
  doc.querySelectorAll('link[rel]').forEach((el) => {
    linkRels.push({
      rel: (el.getAttribute('rel') || '').toLowerCase(),
      href: el.getAttribute('href') || '',
    })
  })

  const hreflang: HreflangEntry[] = []
  doc.querySelectorAll('link[hreflang]').forEach((el) => {
    const lang = el.getAttribute('hreflang') || ''
    const href = el.getAttribute('href') || ''
    if (!lang || !href) return
    try {
      hreflang.push({ lang, href: new URL(href, url).href })
    } catch {
      hreflang.push({ lang, href })
    }
  })

  const headings: HeadingItem[] = []
  queryAllDeep<HTMLHeadingElement>(doc, 'h1, h2, h3, h4, h5, h6').forEach((el) => {
    headings.push({
      level: Number.parseInt(el.tagName[1], 10),
      text: el.textContent?.trim() ?? '',
      id: el.id || undefined,
      selector: getSelector(el),
    })
  })

  const links: LinkItem[] = []
  queryAllDeep<HTMLAnchorElement>(doc, 'a[href]').forEach((el) => {
    const href = el.getAttribute('href') || ''
    const rel = (el.getAttribute('rel') || '').toLowerCase()
    let isInternal = false
    let isExternal = false
    try {
      const linkUrl = new URL(href, url)
      isInternal = linkUrl.origin === origin
      isExternal = linkUrl.origin !== origin && href.startsWith('http')
    } catch {
      isInternal = href.startsWith('/') || href.startsWith('#')
    }
    links.push({
      href: el.href || href,
      text: el.textContent?.trim() ?? '',
      rel,
      isInternal,
      isExternal,
      isNofollow: rel.includes('nofollow'),
      selector: getSelector(el),
    })
  })

  const images: ImageItem[] = []
  queryAllDeep<HTMLImageElement>(doc, 'img').forEach((el) => {
    images.push({
      src: el.currentSrc || el.getAttribute('src') || el.getAttribute('data-src') || '',
      alt: el.getAttribute('alt'),
      loading: el.getAttribute('loading'),
      width: el.naturalWidth || Number.parseInt(el.getAttribute('width') || '0') || null,
      height: el.naturalHeight || Number.parseInt(el.getAttribute('height') || '0') || null,
      hasSrcset: el.hasAttribute('srcset'),
      selector: getSelector(el),
    })
  })

  const paragraphs = queryAllDeep<HTMLParagraphElement>(doc, 'p')
    .map((p) => p.textContent?.trim() ?? '')
    .filter(Boolean)

  const bodyText = doc.body?.innerText ?? ''

  const jsonLd: unknown[] = []
  queryAllDeep<HTMLScriptElement>(doc, 'script[type="application/ld+json"]').forEach((el) => {
    try {
      jsonLd.push(JSON.parse(el.textContent || ''))
    } catch {
      // invalid JSON-LD
    }
  })

  const microdataTypes: string[] = []
  queryAllDeep(doc, '[itemtype]').forEach((el) => {
    const type = el.getAttribute('itemtype') || ''
    if (type) microdataTypes.push(type)
  })

  const scriptSrcs = queryAllDeep<HTMLScriptElement>(doc, 'script[src]').map(
    (s) => s.getAttribute('src') || '',
  )
  const scripts = queryAllDeep<HTMLScriptElement>(doc, 'script').map(
    (s) => s.src || (s.textContent?.slice(0, 300) ?? ''),
  )
  const stylesheets = queryAllDeep<HTMLLinkElement>(doc, 'link[rel="stylesheet"]').map(
    (l) => l.getAttribute('href') || '',
  )

  const favicon =
    linkRels.find((l) => l.rel.includes('icon'))?.href || '/favicon.ico'

  let faviconUrl = favicon
  try {
    faviconUrl = new URL(favicon, url).href
  } catch {
    faviconUrl = ''
  }

  const enrichment = createEmptyEnrichment()

  return {
    url,
    origin,
    hostname: win.location.hostname,
    pathname: win.location.pathname,
    protocol: win.location.protocol,
    isHttps: win.location.protocol === 'https:',
    html: doc.documentElement.outerHTML,
    title: doc.title || '',
    meta,
    linkRels,
    headings,
    links,
    images,
    bodyText,
    firstParagraph: paragraphs[0] ?? '',
    lastParagraph: paragraphs[paragraphs.length - 1] ?? '',
    paragraphs,
    scripts,
    scriptSrcs,
    stylesheets,
    jsonLd,
    microdataTypes,
    wordCount: bodyText.trim().split(/\s+/).filter(Boolean).length,
    favicon: faviconUrl,
    ...enrichment,
    hreflang,
  }
}
