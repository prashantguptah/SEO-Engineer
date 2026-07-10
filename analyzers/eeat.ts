import type { PageContext } from '../types/seo'
import type { AnalyzerResult } from '../types/analyzer'
import { getMetaContent, scoreFromChecks } from '../utils/helpers'

export function analyzeEeat(ctx: PageContext): AnalyzerResult {
  const html = ctx.html.toLowerCase()
  const meta = ctx.meta

  const author =
    getMetaContent(meta, 'author') ||
    getMetaContent(meta, 'article:author') ||
    (html.match(/rel=["']author["']/) ? 'Author link found' : '') ||
    (html.match(/class=["'][^"']*author[^"']*["']/) ? 'Author element found' : '')

  const publishedDate =
    getMetaContent(meta, 'article:published_time') ||
    getMetaContent(meta, 'datepublished') ||
    getMetaContent(meta, 'date') ||
    (html.match(/datetime=["'][0-9]{4}/) ? 'Date element found' : '')

  const updatedDate =
    getMetaContent(meta, 'article:modified_time') ||
    getMetaContent(meta, 'datemodified') ||
    getMetaContent(meta, 'last-modified')

  const authorBio =
    html.includes('author-bio') ||
    html.includes('author_bio') ||
    html.includes('about-the-author') ||
    html.includes('author-description')

  const contactPage = ctx.links.some((l) => /\/contact/i.test(l.href))
  const privacyPolicy = ctx.links.some((l) => /\/privacy/i.test(l.href))
  const terms = ctx.links.some((l) => /\/terms/i.test(l.href))
  const aboutPage = ctx.links.some((l) => /\/about/i.test(l.href))

  const issues = []
  const strengths: string[] = []

  if (author) strengths.push('author-present')
  if (publishedDate) strengths.push('date-present')

  if (!author) {
    issues.push({
      id: 'eeat-no-author',
      severity: 'medium' as const,
      problem: 'No author information detected',
      whyItMatters: 'Author signals support E-E-A-T for content sites.',
      suggestedFix: 'Add author name, bio, and schema Person markup.',
      category: 'eeat',
    })
  }

  if (!publishedDate) {
    issues.push({
      id: 'eeat-no-date',
      severity: 'medium' as const,
      problem: 'No publish date detected',
      whyItMatters: 'Dates help users and search engines assess freshness.',
      suggestedFix: 'Add visible publish date and article:published_time meta.',
      category: 'eeat',
    })
  }

  if (!aboutPage) {
    issues.push({
      id: 'eeat-no-about',
      severity: 'low' as const,
      problem: 'No About page link detected',
      whyItMatters: 'About pages establish site credibility.',
      suggestedFix: 'Link to an About page from navigation or footer.',
      category: 'eeat',
    })
  }

  const score = scoreFromChecks([
    !!author,
    !!publishedDate,
    !!updatedDate,
    authorBio,
    contactPage,
    privacyPolicy,
    aboutPage,
  ], [2, 2, 1, 1, 1, 1, 1])

  return {
    id: 'eeat',
    name: 'E-E-A-T Signals',
    score,
    weight: 0.8,
    category: 'content',
    data: {
      author: author || 'Not detected',
      publishedDate: publishedDate || 'Not detected',
      updatedDate: updatedDate || 'Not detected',
      authorBio,
      contactPage,
      privacyPolicy,
      terms,
      aboutPage,
    },
    issues,
    strengths,
  }
}
