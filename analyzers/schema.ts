import type { PageContext } from '../types/seo'
import type { AnalyzerResult } from '../types/analyzer'
import { scoreFromChecks } from '../utils/helpers'

const SCHEMA_TYPES = [
  'Article', 'FAQPage', 'Organization', 'BreadcrumbList', 'Product',
  'Review', 'Recipe', 'Person', 'VideoObject', 'HowTo', 'LocalBusiness',
  'WebSite', 'WebPage', 'NewsArticle', 'BlogPosting',
]

export function analyzeSchema(ctx: PageContext): AnalyzerResult {
  const jsonLdTypes = extractJsonLdTypes(ctx.jsonLd)
  const microdataTypes = ctx.microdataTypes.map((t) => t.split('/').pop() || t)
  const allTypes = [...new Set([...jsonLdTypes, ...microdataTypes])]

  const detected = {
    jsonLd: ctx.jsonLd.length > 0,
    microdata: ctx.microdataTypes.length > 0,
    types: allTypes,
    article: allTypes.some((t) => /article|blogposting|newsarticle/i.test(t)),
    faq: allTypes.some((t) => /faq/i.test(t)),
    organization: allTypes.some((t) => /organization/i.test(t)),
    breadcrumb: allTypes.some((t) => /breadcrumb/i.test(t)),
    product: allTypes.some((t) => /product/i.test(t)),
    review: allTypes.some((t) => /review/i.test(t)),
    recipe: allTypes.some((t) => /recipe/i.test(t)),
    person: allTypes.some((t) => /person/i.test(t)),
    video: allTypes.some((t) => /video/i.test(t)),
    howTo: allTypes.some((t) => /howto/i.test(t)),
    localBusiness: allTypes.some((t) => /localbusiness/i.test(t)),
  }

  const issues = []
  const strengths: string[] = []

  if (detected.jsonLd || detected.microdata) {
    strengths.push('metadata-proper')
  }
  if (detected.faq) strengths.push('faq-schema')
  if (detected.article) strengths.push('content-comprehensive')

  if (!detected.jsonLd && !detected.microdata) {
    issues.push({
      id: 'no-schema',
      severity: 'medium' as const,
      problem: 'No structured data detected',
      whyItMatters: 'Schema markup enables rich results in search.',
      suggestedFix: 'Add JSON-LD structured data relevant to your content type.',
      category: 'schema',
    })
  }

  const score = scoreFromChecks([
    detected.jsonLd,
    detected.microdata || detected.jsonLd,
    allTypes.length >= 1,
    allTypes.length >= 2,
    detected.breadcrumb || detected.article || detected.faq,
  ], [2, 1, 2, 1, 2])

  return {
    id: 'schema',
    name: 'Structured Data',
    score,
    weight: 1,
    category: 'technical',
    data: {
      jsonLdCount: ctx.jsonLd.length,
      microdataCount: ctx.microdataTypes.length,
      detected,
      schemaTypes: SCHEMA_TYPES.filter((t) =>
        allTypes.some((at) => at.toLowerCase().includes(t.toLowerCase()))
      ),
      allTypes,
    },
    issues,
    strengths,
  }
}

function extractJsonLdTypes(data: unknown[]): string[] {
  const types: string[] = []
  function walk(obj: unknown) {
    if (!obj || typeof obj !== 'object') return
    if (Array.isArray(obj)) {
      obj.forEach(walk)
      return
    }
    const record = obj as Record<string, unknown>
    if (record['@type']) {
      const t = record['@type']
      if (typeof t === 'string') types.push(t)
      else if (Array.isArray(t)) types.push(...t.filter((x): x is string => typeof x === 'string'))
    }
    if (record['@graph']) walk(record['@graph'])
    Object.values(record).forEach(walk)
  }
  data.forEach(walk)
  return types
}
