export interface EnrichOptions {
  checkBrokenLinks?: boolean
  maxImages?: number
  maxLinks?: number
  imageTimeoutMs?: number
  linkTimeoutMs?: number
  analysisBudgetMs?: number
  hydrationWaitMs?: number
  targetKeyword?: string
  /** Comma/newline-separated secondary keywords (also accepted as array) */
  secondaryKeywords?: string | string[]
}

export interface ExtensionSettings {
  checkBrokenLinks: boolean
  hydrationWaitMs: number
  analysisBudgetMs: number
  targetKeyword: string
  /** Comma-separated secondary keywords */
  secondaryKeywords: string
  openAsSidePanel: boolean
  /** When true, opening the panel runs analysis automatically */
  autoAnalyzeOnOpen: boolean
}

export const DEFAULT_ENRICH_OPTIONS: Required<
  Omit<EnrichOptions, 'targetKeyword' | 'secondaryKeywords'>
> & {
  targetKeyword: string
  secondaryKeywords: string
} = {
  checkBrokenLinks: true,
  maxImages: 20,
  maxLinks: 15,
  imageTimeoutMs: 2000,
  linkTimeoutMs: 3000,
  analysisBudgetMs: 5000,
  hydrationWaitMs: 2500,
  targetKeyword: '',
  secondaryKeywords: '',
}

export const DEFAULT_SETTINGS: ExtensionSettings = {
  checkBrokenLinks: true,
  hydrationWaitMs: 2500,
  analysisBudgetMs: 5000,
  targetKeyword: '',
  secondaryKeywords: '',
  openAsSidePanel: true,
  autoAnalyzeOnOpen: true,
}

export const SETTINGS_STORAGE_KEY = 'seo-re-settings'

/** Parse "a, b | c" / newlines into unique trimmed keywords (max 5). */
export function parseKeywordList(input: string | string[] | undefined, max = 5): string[] {
  if (!input) return []
  const raw = Array.isArray(input) ? input.join(',') : input
  const seen = new Set<string>()
  const out: string[] = []
  for (const part of raw.split(/[,|\n]+/)) {
    const k = part.trim().replace(/\s+/g, ' ')
    if (!k) continue
    const key = k.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    out.push(k)
    if (out.length >= max) break
  }
  return out
}
