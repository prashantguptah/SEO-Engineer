export interface EnrichOptions {
  checkBrokenLinks?: boolean
  maxImages?: number
  maxLinks?: number
  imageTimeoutMs?: number
  linkTimeoutMs?: number
  analysisBudgetMs?: number
  hydrationWaitMs?: number
  targetKeyword?: string
}

export interface ExtensionSettings {
  checkBrokenLinks: boolean
  hydrationWaitMs: number
  analysisBudgetMs: number
  targetKeyword: string
  openAsSidePanel: boolean
}

export const DEFAULT_ENRICH_OPTIONS: Required<Omit<EnrichOptions, 'targetKeyword'>> & {
  targetKeyword: string
} = {
  checkBrokenLinks: true,
  maxImages: 20,
  maxLinks: 15,
  imageTimeoutMs: 2000,
  linkTimeoutMs: 3000,
  analysisBudgetMs: 5000,
  hydrationWaitMs: 2500,
  targetKeyword: '',
}

export const DEFAULT_SETTINGS: ExtensionSettings = {
  checkBrokenLinks: true,
  hydrationWaitMs: 2500,
  analysisBudgetMs: 5000,
  targetKeyword: '',
  openAsSidePanel: true,
}

export const SETTINGS_STORAGE_KEY = 'seo-re-settings'
