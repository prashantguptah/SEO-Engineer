import type { PageType } from '../types/seo'

export function detectPageType(input: {
  pathname: string
  wordCount: number
  headings: { level: number }[]
  jsonLd: unknown[]
  html: string
}): PageType {
  const { pathname, wordCount, headings, jsonLd, html } = input

  const jsonStr = JSON.stringify(jsonLd).toLowerCase()
  if (jsonStr.includes('product')) return 'product'
  if (jsonStr.includes('article') || jsonStr.includes('blogposting')) return 'blog'

  if (/\/(blog|article|posts?|news|guides?)\//i.test(pathname)) return 'blog'
  if (/\/(product|shop|item|p)\//i.test(pathname)) return 'product'
  if (pathname === '/' || pathname === '') return 'homepage'
  if (/\/(thank-you|thanks|checkout|cart|login|signup|register|confirm)/i.test(pathname)) {
    return 'utility'
  }

  const h2Count = headings.filter((h) => h.level === 2).length
  if (wordCount > 600 && h2Count >= 3) return 'blog'

  if (html.includes('woocommerce') || html.includes('add-to-cart')) return 'product'

  return 'unknown'
}
