import type { Issue } from '../types/analyzer'
import type { PageContext } from '../types/seo'

function escapeAttr(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')
}

function escapeHtml(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function suggestTitle(ctx: PageContext): string {
  const keyword = ctx.targetKeyword?.trim()
  if (keyword && ctx.title) {
    if (ctx.title.toLowerCase().includes(keyword.toLowerCase())) return ctx.title
    return `${keyword} | ${ctx.title}`.slice(0, 60)
  }
  if (keyword) return `${keyword} — Complete Guide`.slice(0, 60)
  if (ctx.title) return ctx.title.slice(0, 60)
  const h1 = ctx.headings.find((h) => h.level === 1)?.text
  return (h1 || 'Page Title').slice(0, 60)
}

function suggestDescription(ctx: PageContext): string {
  const existing = ctx.meta.description || ctx.firstParagraph || ''
  if (existing.length >= 120) return existing.slice(0, 160)
  const keyword = ctx.targetKeyword?.trim()
  const base = existing || ctx.title || 'Learn more about this topic.'
  const withKeyword = keyword && !base.toLowerCase().includes(keyword.toLowerCase())
    ? `${base} Discover tips on ${keyword}.`
    : base
  return withKeyword.slice(0, 160)
}

/**
 * Build a paste-ready HTML snippet for a known issue, when possible.
 */
export function buildFixSnippet(issue: Issue, ctx: PageContext): string | undefined {
  const title = suggestTitle(ctx)
  const description = suggestDescription(ctx)
  const canonical = ctx.linkRels.find((l) => l.rel === 'canonical')?.href || ctx.url
  const keyword = ctx.targetKeyword?.trim() || 'primary keyword'

  switch (issue.id) {
    case 'missing-title':
    case 'title-short':
    case 'title-long':
      return `<title>${escapeHtml(title)}</title>`

    case 'missing-meta-desc':
    case 'meta-desc-short':
      return `<meta name="description" content="${escapeAttr(description)}">`

    case 'incomplete-og':
      return [
        `<meta property="og:title" content="${escapeAttr(title)}">`,
        `<meta property="og:description" content="${escapeAttr(description)}">`,
        `<meta property="og:image" content="${escapeAttr(ctx.origin + '/og-image.jpg')}">`,
        `<meta property="og:url" content="${escapeAttr(ctx.url)}">`,
      ].join('\n')

    case 'no-twitter-card':
      return [
        `<meta name="twitter:card" content="summary_large_image">`,
        `<meta name="twitter:title" content="${escapeAttr(title)}">`,
        `<meta name="twitter:description" content="${escapeAttr(description)}">`,
        `<meta name="twitter:image" content="${escapeAttr(ctx.origin + '/og-image.jpg')}">`,
      ].join('\n')

    case 'no-canonical':
      return `<link rel="canonical" href="${escapeAttr(canonical)}">`

    case 'no-viewport':
    case 'mobile-no-viewport':
      return `<meta name="viewport" content="width=device-width, initial-scale=1">`

    case 'no-language':
      return `<html lang="en">`

    case 'missing-h1':
      return `<h1>${escapeHtml(keyword === 'primary keyword' ? title : keyword)}</h1>`

    case 'duplicate-h1':
      return `<!-- Keep a single H1; demote extras -->\n<h1>${escapeHtml(ctx.headings.find((h) => h.level === 1)?.text || title)}</h1>\n<h2>Section heading</h2>`

    case 'keyword-not-in-title':
      return `<title>${escapeHtml(suggestTitle({ ...ctx, targetKeyword: keyword }))}</title>`

    case 'keyword-not-in-h1':
      return `<h1>${escapeHtml(keyword)}</h1>`

    case 'missing-alt':
    case 'a11y-missing-alt':
    case 'empty-alt':
      return `<img src="/path/to/image.jpg" alt="${escapeAttr(keyword)} illustration">`

    case 'no-lazy-load':
      return `<img src="/path/to/image.jpg" alt="Description" loading="lazy" width="800" height="450">`

    case 'no-schema':
      return [
        `<script type="application/ld+json">`,
        JSON.stringify(
          {
            '@context': 'https://schema.org',
            '@type': ctx.pageType === 'product' ? 'Product' : 'Article',
            headline: title,
            description,
            url: ctx.url,
            datePublished: new Date().toISOString().slice(0, 10),
          },
          null,
          2,
        ),
        `</script>`,
      ].join('\n')

    case 'eeat-no-author':
      return [
        `<meta name="author" content="Author Name">`,
        `<script type="application/ld+json">`,
        JSON.stringify(
          {
            '@context': 'https://schema.org',
            '@type': 'Person',
            name: 'Author Name',
            url: `${ctx.origin}/about`,
          },
          null,
          2,
        ),
        `</script>`,
      ].join('\n')

    case 'eeat-no-date':
      return `<meta property="article:published_time" content="${new Date().toISOString()}">`

    case 'eeat-no-about':
      return `<a href="${escapeAttr(ctx.origin + '/about')}">About us</a>`

    case 'noindex':
      return `<!-- Remove noindex so the page can be indexed -->\n<meta name="robots" content="index, follow">`

    case 'robots-disallow':
      return `# robots.txt — allow this path (example)\nUser-agent: *\nAllow: ${ctx.pathname}\n`

    case 'no-sitemap':
      return `# Add to robots.txt\nSitemap: ${ctx.origin}/sitemap.xml`

    case 'hreflang-no-x-default':
      return `<link rel="alternate" hreflang="x-default" href="${escapeAttr(ctx.url)}">`

    case 'hreflang-no-self':
      return `<link rel="alternate" hreflang="en" href="${escapeAttr(ctx.url)}">`

    default:
      return undefined
  }
}

export function attachFixSnippets(issues: Issue[], ctx: PageContext): Issue[] {
  return issues.map((issue) => {
    const fixSnippet = buildFixSnippet(issue, ctx)
    return fixSnippet ? { ...issue, fixSnippet } : issue
  })
}
