import type { PageContext } from '../types/seo'
import type { AnalyzerResult } from '../types/analyzer'
import { scoreFromChecks } from '../utils/helpers'

export function analyzeAccessibility(ctx: PageContext): AnalyzerResult {
  const html = ctx.html
  const imagesWithoutAlt = ctx.images.filter((i) => i.alt === null).length
  const ariaElements = (html.match(/aria-[a-z]+=/gi) || []).length
  const labels = (html.match(/<label[\s>]/gi) || []).length
  const inputs = (html.match(/<input[\s>]/gi) || []).length
  const buttons = (html.match(/<button[\s>]/gi) || []).length
  const roleElements = (html.match(/role=["']/gi) || []).length
  const linksWithoutText = ctx.links.filter((l) => !l.text.trim()).length

  const headingOrderValid = !ctx.headings.some((h, i, arr) => {
    if (i === 0) return false
    return h.level > arr[i - 1].level + 1
  })

  const issues = []
  const strengths: string[] = []

  if (imagesWithoutAlt > 0) {
    issues.push({
      id: 'a11y-missing-alt',
      severity: 'high' as const,
      problem: `${imagesWithoutAlt} images without ALT text`,
      whyItMatters: 'Screen readers need ALT text to describe images.',
      suggestedFix: 'Add descriptive alt attributes to all images.',
      category: 'accessibility',
    })
  } else if (ctx.images.length > 0) {
    strengths.push('images-optimized')
  }

  if (linksWithoutText > 0) {
    issues.push({
      id: 'a11y-empty-links',
      severity: 'medium' as const,
      problem: `${linksWithoutText} links without visible text`,
      whyItMatters: 'Empty links are inaccessible to screen reader users.',
      suggestedFix: 'Add aria-label or visible text to links.',
      category: 'accessibility',
    })
  }

  if (!headingOrderValid) {
    issues.push({
      id: 'a11y-heading-order',
      severity: 'medium' as const,
      problem: 'Heading order skips levels',
      whyItMatters: 'Proper heading order aids screen reader navigation.',
      suggestedFix: 'Use sequential heading levels without skipping.',
      category: 'accessibility',
    })
  }

  const score = scoreFromChecks([
    imagesWithoutAlt === 0,
    ariaElements > 0 || roleElements > 0,
    labels >= inputs * 0.5 || inputs === 0,
    headingOrderValid,
    linksWithoutText === 0,
    buttons > 0 ? ariaElements > 0 : true,
  ], [3, 1, 2, 2, 2, 1])

  return {
    id: 'accessibility',
    name: 'Accessibility',
    score,
    weight: 1,
    category: 'accessibility',
    data: {
      imagesWithoutAlt,
      ariaAttributes: ariaElements,
      labels,
      inputs,
      buttons,
      roleElements,
      linksWithoutText,
      headingOrderValid,
    },
    issues,
    strengths,
  }
}
