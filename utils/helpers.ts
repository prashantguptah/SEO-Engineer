export function clamp(value: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, Math.round(value)))
}

export function getDomain(url: string): string {
  try {
    return new URL(url).hostname
  } catch {
    return url
  }
}

export function truncate(text: string, max = 120): string {
  if (text.length <= max) return text
  return text.slice(0, max - 3) + '...'
}

export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`
  return `${(ms / 1000).toFixed(1)}s`
}

export function sortBySeverity<T extends { severity: string }>(items: T[]): T[] {
  const order = { high: 0, medium: 1, low: 2 }
  return [...items].sort(
    (a, b) => (order[a.severity as keyof typeof order] ?? 3) - (order[b.severity as keyof typeof order] ?? 3)
  )
}

export function detectInHtml(html: string, patterns: RegExp[]): boolean {
  return patterns.some((p) => p.test(html))
}

export function getMetaContent(meta: Record<string, string>, ...keys: string[]): string {
  for (const key of keys) {
    if (meta[key]) return meta[key]
  }
  return ''
}

export function scoreFromChecks(checks: boolean[], weights?: number[]): number {
  if (checks.length === 0) return 0
  let total = 0
  let weightSum = 0
  checks.forEach((pass, i) => {
    const w = weights?.[i] ?? 1
    if (pass) total += w
    weightSum += w
  })
  return clamp((total / weightSum) * 100)
}
