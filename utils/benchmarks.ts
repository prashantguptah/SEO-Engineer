export type BenchmarkStatus = 'optimal' | 'below-range' | 'above-range' | 'missing'

export interface BenchmarkResult {
  field: string
  value: number | string
  range?: [number, number]
  status: BenchmarkStatus
  message: string
}

export function benchmarkRange(
  field: string,
  value: number,
  good: [number, number],
): BenchmarkResult {
  const [min, max] = good
  if (value >= min && value <= max) {
    return {
      field,
      value,
      range: good,
      status: 'optimal',
      message: `${field} is ${value} characters (good range: ${min}–${max})`,
    }
  }
  if (value > 0 && value < min) {
    return {
      field,
      value,
      range: good,
      status: 'below-range',
      message: `${field} is ${value} characters (recommended: ${min}–${max})`,
    }
  }
  if (value > max) {
    return {
      field,
      value,
      range: good,
      status: 'above-range',
      message: `${field} is ${value} characters (may truncate; ideal: ${min}–${max})`,
    }
  }
  return {
    field,
    value,
    range: good,
    status: 'missing',
    message: `${field} is missing`,
  }
}

export function benchmarkWordCount(wordCount: number, pageType: string): BenchmarkResult {
  const ranges: Record<string, [number, number]> = {
    blog: [800, 5000],
    product: [150, 800],
    homepage: [100, 500],
    utility: [20, 200],
    unknown: [300, 2000],
  }
  const [min, ideal] = ranges[pageType] ?? ranges.unknown
  if (wordCount >= min) {
    return {
      field: 'Word count',
      value: wordCount,
      range: [min, ideal],
      status: wordCount >= ideal * 0.5 ? 'optimal' : 'below-range',
      message:
        wordCount >= ideal * 0.5
          ? `Word count is ${wordCount} (good for ${pageType} pages: ${min}+)`
          : `Word count is ${wordCount} (aim for ${min}+ on ${pageType} pages)`,
    }
  }
  return {
    field: 'Word count',
    value: wordCount,
    range: [min, ideal],
    status: 'below-range',
    message: `Word count is ${wordCount} (thin content; aim for ${min}+ words)`,
  }
}
