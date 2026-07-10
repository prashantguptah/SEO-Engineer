import type { PageContext } from '../types/seo'
import type { AnalyzerResult } from '../types/analyzer'
import { detectInHtml } from '../utils/helpers'

interface TechDetection {
  name: string
  detected: boolean
}

export function analyzeTechnology(ctx: PageContext): AnalyzerResult {
  const html = ctx.html.toLowerCase()
  const scripts = ctx.scriptSrcs.join(' ').toLowerCase()
  const combined = html + ' ' + scripts

  const technologies: TechDetection[] = [
    { name: 'WordPress', detected: detectInHtml(combined, [/wp-content/, /wp-includes/, /wordpress/]) },
    { name: 'Shopify', detected: detectInHtml(combined, [/cdn\.shopify\.com/, /shopify\.com/]) },
    { name: 'Ghost', detected: detectInHtml(combined, [/ghost\.org/, /content="ghost"/]) },
    { name: 'Next.js', detected: detectInHtml(combined, [/__next_data__/, /_next\/static/]) },
    { name: 'Nuxt', detected: detectInHtml(combined, [/__nuxt__/, /_nuxt\//]) },
    { name: 'Vue', detected: detectInHtml(combined, [/vue\.js/, /vue@/, /data-v-[a-f0-9]/]) },
    { name: 'React', detected: detectInHtml(combined, [/react\.js/, /react-dom/, /data-reactroot/, /__react/]) },
    { name: 'Angular', detected: detectInHtml(combined, [/ng-version/, /angular\.js/, /angular\.min\.js/]) },
    { name: 'Cloudflare', detected: detectInHtml(combined, [/cloudflare/, /cf-ray/]) },
    { name: 'Tailwind CSS', detected: detectInHtml(combined, [/--tw-/, /tailwindcss/]) },
    { name: 'Bootstrap', detected: detectInHtml(combined, [/bootstrap\.css/, /bootstrap\.min\.css/, /class="[^"]*\bcontainer\b/]) },
    { name: 'jQuery', detected: detectInHtml(combined, [/jquery\.js/, /jquery\.min\.js/, /jquery-/]) },
    { name: 'Google Analytics', detected: detectInHtml(combined, [/google-analytics\.com/, /gtag\(/, /ga\(/, /g-\w{10}/]) },
    { name: 'Google Tag Manager', detected: detectInHtml(combined, [/googletagmanager\.com/, /gtm-[a-z0-9]+/i]) },
    { name: 'Facebook Pixel', detected: detectInHtml(combined, [/connect\.facebook\.net/, /fbq\(/, /facebook\.com\/tr/]) },
    { name: 'Hotjar', detected: detectInHtml(combined, [/hotjar\.com/, /hj\(/]) },
  ]

  const detected = technologies.filter((t) => t.detected)

  return {
    id: 'technology',
    name: 'Technology Detection',
    score: detected.length > 0 ? 100 : 50,
    weight: 0.5,
    category: 'technical',
    data: {
      technologies,
      detected: detected.map((t) => t.name),
      count: detected.length,
    },
    issues: [],
    strengths: [],
  }
}
