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
}

export interface HeadingItem {
  level: number
  text: string
  id?: string
}

export interface LinkItem {
  href: string
  text: string
  rel: string
  isInternal: boolean
  isExternal: boolean
  isNofollow: boolean
}

export interface ImageItem {
  src: string
  alt: string | null
  loading: string | null
  width: number | null
  height: number | null
  hasSrcset: boolean
}

export interface KeywordItem {
  word: string
  count: number
  density: number
}

export interface SchemaTypeInfo {
  type: string
  format: 'json-ld' | 'microdata'
}
