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
  enrichSkipped?: string[]
  /** Optional user-provided keyword for placement checks */
  targetKeyword?: string
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
