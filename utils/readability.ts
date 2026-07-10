import { countWords, countSentences, averageSentenceLength } from './keyword'

export interface ReadabilityResult {
  score: number
  grade: string
  fleschReadingEase: number
  avgSentenceLength: number
}

export function calculateReadability(text: string): ReadabilityResult {
  const words = countWords(text)
  const sentences = countSentences(text)
  const syllables = estimateSyllables(text)

  if (words === 0 || sentences === 0) {
    return { score: 0, grade: 'N/A', fleschReadingEase: 0, avgSentenceLength: 0 }
  }

  const avgWordsPerSentence = words / sentences
  const avgSyllablesPerWord = syllables / words

  // Flesch Reading Ease
  const fre = 206.835 - 1.015 * avgWordsPerSentence - 84.6 * avgSyllablesPerWord
  const clampedFre = Math.max(0, Math.min(100, Math.round(fre)))

  let grade: string
  if (clampedFre >= 90) grade = 'Very Easy'
  else if (clampedFre >= 80) grade = 'Easy'
  else if (clampedFre >= 70) grade = 'Fairly Easy'
  else if (clampedFre >= 60) grade = 'Standard'
  else if (clampedFre >= 50) grade = 'Fairly Difficult'
  else if (clampedFre >= 30) grade = 'Difficult'
  else grade = 'Very Difficult'

  return {
    score: clampedFre,
    grade,
    fleschReadingEase: clampedFre,
    avgSentenceLength: averageSentenceLength(text),
  }
}

function estimateSyllables(text: string): number {
  const words = text.toLowerCase().split(/\s+/).filter(Boolean)
  let count = 0
  for (const word of words) {
    const cleaned = word.replace(/[^a-z]/g, '')
    if (!cleaned) continue
    const matches = cleaned.match(/[aeiouy]+/g)
    let syllables = matches ? matches.length : 1
    if (cleaned.endsWith('e') && syllables > 1) syllables--
    count += Math.max(1, syllables)
  }
  return count
}
