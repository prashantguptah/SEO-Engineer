<script setup lang="ts">
import type { ScoreBreakdown } from '../../types/report'

defineProps<{
  scores: ScoreBreakdown
  durationMs: number
}>()

function scoreColor(score: number) {
  if (score >= 80) return 'text-emerald-400'
  if (score >= 60) return 'text-amber-400'
  return 'text-red-400'
}

function barColor(score: number) {
  if (score >= 80) return 'bg-emerald-500'
  if (score >= 60) return 'bg-amber-500'
  return 'bg-red-500'
}

const categories = [
  { key: 'content' as const, label: 'Content' },
  { key: 'technical' as const, label: 'Technical' },
  { key: 'performance' as const, label: 'Performance' },
  { key: 'accessibility' as const, label: 'Accessibility' },
]
</script>

<template>
  <div class="bg-surface-raised rounded-xl border border-surface-border p-4 animate-slide-up">
    <div class="flex items-center gap-4">
      <div class="relative flex-shrink-0">
        <svg class="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
          <circle cx="40" cy="40" r="34" fill="none" stroke="#1e2533" stroke-width="6" />
          <circle
            cx="40" cy="40" r="34" fill="none"
            :stroke="scores.overall >= 80 ? '#34d399' : scores.overall >= 60 ? '#fbbf24' : '#f87171'"
            stroke-width="6"
            stroke-linecap="round"
            :stroke-dasharray="`${scores.overall * 2.14} 214`"
          />
        </svg>
        <div class="absolute inset-0 flex flex-col items-center justify-center">
          <span class="text-2xl font-bold" :class="scoreColor(scores.overall)">{{ scores.overall }}</span>
          <span class="text-[10px] text-slate-500 uppercase">Score</span>
        </div>
      </div>
      <div class="flex-1 space-y-2">
        <div v-for="cat in categories" :key="cat.key" class="space-y-1">
          <div class="flex justify-between text-xs">
            <span class="text-slate-400">{{ cat.label }}</span>
            <span class="font-medium" :class="scoreColor(scores[cat.key])">{{ scores[cat.key] }}</span>
          </div>
          <div class="h-1.5 bg-surface-border rounded-full overflow-hidden">
            <div
              class="h-full rounded-full transition-all duration-700"
              :class="barColor(scores[cat.key])"
              :style="{ width: `${scores[cat.key]}%` }"
            />
          </div>
        </div>
      </div>
    </div>
    <p class="text-xs text-slate-500 mt-3 text-center">
      Analysis completed in {{ durationMs < 1000 ? `${durationMs}ms` : `${(durationMs / 1000).toFixed(1)}s` }}
    </p>
  </div>
</template>
