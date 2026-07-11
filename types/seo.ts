export type PageType = 'blog' | 'product' | 'homepage' | 'utility' | 'unknown'

export interface ResourceTimingSummary {
  resourceCount: number
  byType: Record<string, { count: number; totalSize: number; totalDuration: number }>
  slowResources: number
  domContentLoaded: number | null
  loadEventEnd: number | null
  transferSizeTotal: number
}

export interface BrokenImageResult {
  src: string
  broken: boolean
  selector: string
}

export interface BrokenLinkResult {
  href: string
  status?: number
  broken: boolean
  selector: string
}

export interface MobileAudit {
  smallFonts: number
  smallTargets: number
  sampledTextElements: number
  sampledClickables: number
}

export interface HreflangEntry {
  lang: string
  href: string
}

export interface RobotsTxtResult {
  fetched: boolean
  status?: number
  contentPreview?: string
  sitemaps: string[]
  disallowsCurrentPath: boolean
  matchingDisallows: string[]
  allowsCurrentPath: boolean
  error?: string
}

export interface SitemapPeekResult {
  fetched: boolean
  status?: number
  sourceUrl?: string
  urlCount?: number
  sampleUrls?: string[]
  includesCurrentUrl?: boolean
  truncated?: boolean
  isIndex?: boolean
  error?: string
}

export interface LabWebVitals {
  lcpMs: number | null
  lcpSelector?: string
  lcpRating: 'good' | 'needs-improvement' | 'poor' | null
  cls: number | null
  clsRating: 'good' | 'needs-improvement' | 'poor' | null
  inpMs: number | null
  inpRating: 'good' | 'needs-improvement' | 'poor' | null
  ttfbMs: number | null
  ttfbRating: 'good' | 'needs-improvement' | 'poor' | null
  /** Always lab — not CrUX field data */
  note: 'lab-only'
}

export interface PageContext {
  url: string
  origin: string
  hostname: string
  pathname: string
  protocol: string
  isHttps: boolean
  html: string
  title: string
  meta: Record<string, string>
  linkRels: { rel: string; href: string }[]
  headings: HeadingItem[]
  links: LinkItem[]
  images: ImageItem[]
  bodyText: string
  firstParagraph: string
  lastParagraph: string
  paragraphs: string[]
  scripts: string[]
  scriptSrcs: string[]
  stylesheets: string[]
  jsonLd: unknown[]
  microdataTypes: string[]
  wordCount: number
  favicon: string
  pageType: PageType
  resourceTiming: ResourceTimingSummary
  brokenImages: BrokenImageResult[]
  brokenLinks: BrokenLinkResult[]
  mobileAudit: MobileAudit
  hreflang: HreflangEntry[]
  robotsTxt?: RobotsTxtResult
  sitemap?: SitemapPeekResult
  webVitals?: LabWebVitals
  enrichSkipped?: string[]
  /** Optional user-provided primary keyword for placement checks */
  targetKeyword?: string
  /** Optional secondary keywords for placement matrix */
  secondaryKeywords?: string[]
}

export interface HeadingItem {
  level: number
  text: string
  id?: string
  selector?: string
}

export interface LinkItem {
  href: string
  text: string
  rel: string
  isInternal: boolean
  isExternal: boolean
  isNofollow: boolean
  selector?: string
}

export interface ImageItem {
  src: string
  alt: string | null
  loading: string | null
  width: number | null
  height: number | null
  hasSrcset: boolean
  selector?: string
}

export interface KeywordItem {
  word: string
  count: number
  density: number
}

export interface PhraseItem {
  phrase: string
  count: number
  density: number
  n: number
}

export interface SchemaTypeInfo {
  type: string
  format: 'json-ld' | 'microdata'
}
