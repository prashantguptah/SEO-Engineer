import type { PageContext } from '../types/seo'
import type { AnalyzerResult } from '../types/analyzer'
import { scoreFromChecks } from '../utils/helpers'

export function analyzeImages(ctx: PageContext): AnalyzerResult {
  const total = ctx.images.length
  const missingAlt = ctx.images.filter((img) => img.alt === null).length
  const emptyAlt = ctx.images.filter((img) => img.alt === '').length
  const lazyLoaded = ctx.images.filter((img) => img.loading === 'lazy').length
  const responsive = ctx.images.filter((img) => img.hasSrcset).length

  const formats: Record<string, number> = {}
  for (const img of ctx.images) {
    const ext = img.src.split('?')[0].split('.').pop()?.toLowerCase() || 'unknown'
    formats[ext] = (formats[ext] || 0) + 1
  }

  const largest = ctx.images.reduce(
    (max, img) => {
      const size = (img.width || 0) * (img.height || 0)
      return size > max.size ? { src: img.src, size, width: img.width, height: img.height } : max
    },
    { src: '', size: 0, width: 0, height: 0 }
  )

  const issues = []
  const strengths: string[] = []

  if (total > 0 && missingAlt === 0 && emptyAlt === 0) {
    strengths.push('images-optimized')
  }

  if (missingAlt > 0) {
    issues.push({
      id: 'missing-alt',
      severity: 'high' as const,
      problem: `${missingAlt} image(s) missing ALT text`,
      whyItMatters: 'ALT text improves accessibility and image SEO.',
      suggestedFix: 'Add descriptive alt attributes to all images.',
      category: 'images',
    })
  }

  if (emptyAlt > 0) {
    issues.push({
      id: 'empty-alt',
      severity: 'medium' as const,
      problem: `${emptyAlt} image(s) have empty ALT attributes`,
      whyItMatters: 'Empty alt may indicate decorative images not properly marked.',
      suggestedFix: 'Use descriptive alt text or alt="" with role="presentation" for decorative images.',
      category: 'images',
    })
  }

  if (total > 5 && lazyLoaded === 0) {
    issues.push({
      id: 'no-lazy-load',
      severity: 'low' as const,
      problem: 'No lazy-loaded images detected',
      whyItMatters: 'Lazy loading improves page load performance.',
      suggestedFix: 'Add loading="lazy" to below-the-fold images.',
      category: 'images',
    })
  }

  const modernFormats = (formats.webp || 0) + (formats.avif || 0)
  if (total > 0 && modernFormats / total > 0.3) {
    strengths.push('images-optimized')
  }

  const score = scoreFromChecks([
    total === 0 || missingAlt === 0,
    total === 0 || emptyAlt <= total * 0.1,
    total === 0 || lazyLoaded > 0,
    total === 0 || responsive > 0,
    total === 0 || modernFormats > 0,
  ], [3, 2, 1, 1, 1])

  return {
    id: 'images',
    name: 'Images',
    score,
    weight: 0.8,
    category: 'content',
    data: {
      total,
      missingAlt,
      emptyAlt,
      lazyLoaded,
      responsive,
      formats,
      largestImage: largest.src ? largest : null,
      brokenImages: 'Not checked (client-side limitation)',
      recommendation:
        missingAlt > 0
          ? 'Add ALT text to all images'
          : lazyLoaded === 0 && total > 3
            ? 'Enable lazy loading for images'
            : 'Image optimization looks good',
    },
    issues,
    strengths,
  }
}
