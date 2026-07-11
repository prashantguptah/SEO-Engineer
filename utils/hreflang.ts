import type { HreflangEntry } from '../types/seo'

const LANG_RE = /^[a-z]{2}(-[a-z0-9]{2,8})?$/i

export function isValidHreflangCode(lang: string): boolean {
  if (!lang) return false
  if (lang.toLowerCase() === 'x-default') return true
  return LANG_RE.test(lang.trim())
}

export function analyzeHreflangEntries(entries: HreflangEntry[], pageUrl: string): {
  hasXDefault: boolean
  invalidCodes: string[]
  duplicateLangs: string[]
  selfReference: boolean
  uniqueLangs: string[]
} {
  const langs = entries.map((e) => e.lang.toLowerCase())
  const uniqueLangs = [...new Set(langs)]
  const hasXDefault = langs.includes('x-default')

  const invalidCodes = [
    ...new Set(entries.filter((e) => !isValidHreflangCode(e.lang)).map((e) => e.lang)),
  ]

  const counts = new Map<string, number>()
  for (const lang of langs) {
    counts.set(lang, (counts.get(lang) ?? 0) + 1)
  }
  const duplicateLangs = [...counts.entries()].filter(([, n]) => n > 1).map(([l]) => l)

  let selfReference = false
  try {
    const page = new URL(pageUrl)
    selfReference = entries.some((e) => {
      try {
        return new URL(e.href, pageUrl).href === page.href
      } catch {
        return false
      }
    })
  } catch {
    selfReference = false
  }

  return { hasXDefault, invalidCodes, duplicateLangs, selfReference, uniqueLangs }
}
