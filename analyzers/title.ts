import type { PageContext } from '../types/seo'
import type { AnalyzerResult } from '../types/analyzer'
import { getMetaContent, scoreFromChecks, truncate } from '../utils/helpers'
import { benchmarkRange } from '../utils/benchmarks'

export function analyzeTitle(ctx: PageContext): AnalyzerResult {
  const title = ctx.title
  const titleLength = title.length
  const description = getMetaContent(ctx.meta, 'description')
  const descLength = description.length
  const ogTitle = getMetaContent(ctx.meta, 'og:title')
  const ogDescription = getMetaContent(ctx.meta, 'og:description')
  const ogImage = getMetaContent(ctx.meta, 'og:image')
  const twitterCard = getMetaContent(ctx.meta, 'twitter:card')
  const twitterTitle = getMetaContent(ctx.meta, 'twitter:title')
  const canonical = ctx.linkRels.find((l) => l.rel === 'canonical')?.href || ''

  const titleBenchmark = benchmarkRange('Title', titleLength, [30, 60])
  const descBenchmark = benchmarkRange('Meta description', descLength, [120, 160])

  const issues = []
  const strengths: string[] = []
  const positives = []

  if (titleBenchmark.status === 'optimal') {
    strengths.push('title-optimized')
    positives.push({ id: 'title-length', message: titleBenchmark.message, context: 'optimal', category: 'title' })
  } else if (!title) {
    issues.push({
      id: 'missing-title',
      severity: 'high' as const,
      problem: 'Page title is missing',
      whyItMatters: 'Title is one of the most important on-page SEO elements.',
      suggestedFix: 'Add a unique, descriptive <title> tag.',
      category: 'title',
    })
  } else if (titleLength < 30) {
    issues.push({
      id: 'title-short',
      severity: 'medium' as const,
      problem: titleBenchmark.message,
      whyItMatters: 'Short titles may miss keyword opportunities in SERPs.',
      suggestedFix: 'Expand title to 30-60 characters with primary keywords.',
      category: 'title',
    })
  } else if (titleLength > 60) {
    issues.push({
      id: 'title-long',
      severity: 'low' as const,
      problem: titleBenchmark.message,
      whyItMatters: 'Long titles get cut off in search results.',
      suggestedFix: 'Keep title under 60 characters.',
      category: 'title',
    })
  }

  if (!description) {
    issues.push({
      id: 'missing-meta-desc',
      severity: 'high' as const,
      problem: 'Meta description is missing',
      whyItMatters: 'Meta descriptions influence click-through rates.',
      suggestedFix: 'Add a compelling meta description (120-160 characters).',
      category: 'title',
    })
  } else if (descLength < 120) {
    issues.push({
      id: 'meta-desc-short',
      severity: 'medium' as const,
      problem: descBenchmark.message,
      whyItMatters: 'Short descriptions waste SERP snippet space.',
      suggestedFix: 'Expand meta description to 120-160 characters.',
      category: 'title',
    })
  } else if (descBenchmark.status === 'optimal') {
    strengths.push('metadata-proper')
    positives.push({ id: 'meta-length', message: descBenchmark.message, context: 'optimal', category: 'title' })
  }

  if (ogTitle && ogDescription && ogImage) {
    positives.push({
      id: 'og-complete',
      message: 'OpenGraph tags are complete (title, description, image)',
      category: 'title',
    })
  }

  if (!ogTitle || !ogDescription) {
    issues.push({
      id: 'incomplete-og',
      severity: 'low' as const,
      problem: 'OpenGraph tags are incomplete',
      whyItMatters: 'OpenGraph improves social media sharing appearance.',
      suggestedFix: 'Add og:title, og:description, and og:image tags.',
      category: 'title',
    })
  }

  if (!twitterCard) {
    issues.push({
      id: 'no-twitter-card',
      severity: 'low' as const,
      problem: 'No Twitter Card detected',
      whyItMatters: 'Twitter Cards enhance link previews on X/Twitter.',
      suggestedFix: 'Add twitter:card meta tag.',
      category: 'title',
    })
  }

  const score = scoreFromChecks([
    !!title && titleLength >= 20,
    titleLength >= 30 && titleLength <= 60,
    !!description && descLength >= 70,
    descLength >= 120 && descLength <= 160,
    !!ogTitle,
    !!ogDescription,
    !!ogImage,
    !!twitterCard || !!twitterTitle,
    !!canonical,
  ])

  return {
    id: 'title',
    name: 'Title & Meta',
    score,
    weight: 1.2,
    category: 'technical',
    data: {
      title: truncate(title, 80),
      titleLength,
      titleBenchmark,
      description: truncate(description, 160),
      descriptionLength: descLength,
      descriptionBenchmark: descBenchmark,
      openGraph: { title: ogTitle, description: ogDescription, image: ogImage },
      twitterCard: { card: twitterCard, title: twitterTitle },
      canonical: canonical || 'Not set',
      status: score >= 70 ? 'Good' : score >= 40 ? 'Needs Improvement' : 'Poor',
      serpPreview: {
        title: truncate(title, 60) || 'Missing title',
        url: ctx.url,
        description: truncate(description, 160) || 'No meta description.',
      },
    },
    issues,
    strengths,
    positives,
  }
}
