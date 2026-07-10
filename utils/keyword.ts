const STOP_WORDS = new Set([
  'a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with',
  'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been', 'be', 'have', 'has', 'had',
  'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must',
  'shall', 'can', 'need', 'it', 'its', 'this', 'that', 'these', 'those', 'i', 'you',
  'he', 'she', 'we', 'they', 'what', 'which', 'who', 'whom', 'when', 'where', 'why',
  'how', 'all', 'each', 'every', 'both', 'few', 'more', 'most', 'other', 'some', 'such',
  'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 'just',
  'about', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'up',
  'down', 'out', 'off', 'over', 'under', 'again', 'further', 'then', 'once', 'here',
  'there', 'any', 'our', 'your', 'their', 'my', 'his', 'her', 'also', 'if', 'while',
  'because', 'until', 'although', 'though', 'since', 'unless', 'whether', 'like',
  'get', 'got', 'make', 'made', 'use', 'used', 'using', 'one', 'two', 'new', 'first',
  'last', 'long', 'great', 'little', 'own', 'old', 'right', 'big', 'high', 'different',
  'small', 'large', 'next', 'early', 'young', 'important', 'public', 'able', 'via',
  'com', 'www', 'http', 'https', 'html', 'page', 'click', 'read', 'see', 'know',
])

export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP_WORDS.has(w))
}

export function extractTopKeywords(text: string, limit = 10): { word: string; count: number; density: number }[] {
  const words = tokenize(text)
  const total = words.length || 1
  const freq = new Map<string, number>()

  for (const word of words) {
    freq.set(word, (freq.get(word) ?? 0) + 1)
  }

  return [...freq.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([word, count]) => ({
      word,
      count,
      density: Math.round((count / total) * 10000) / 100,
    }))
}

export function containsKeyword(text: string, keyword: string): boolean {
  if (!text || !keyword) return false
  return text.toLowerCase().includes(keyword.toLowerCase())
}

export function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length
}

export function countSentences(text: string): number {
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0)
  return sentences.length || 1
}

export function averageSentenceLength(text: string): number {
  const words = countWords(text)
  const sentences = countSentences(text)
  return Math.round((words / sentences) * 10) / 10
}
