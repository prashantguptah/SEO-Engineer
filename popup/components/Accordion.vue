<script setup lang="ts">
import { computed } from 'vue'
import AnalysisCard from './AnalysisCard.vue'
import RankSummary from './RankSummary.vue'
import StatusBadge from './StatusBadge.vue'
import type { SeoReport } from '../../types/report'

const props = defineProps<{
  id: string
  title: string
  expanded: boolean
  report: SeoReport
}>()

const emit = defineEmits<{
  toggle: [id: string]
}>()

const section = computed(() => props.report.sections[props.id])

const sectionScore = computed(() => section.value?.score)

function scoreStatus(score: number): 'good' | 'warning' | 'error' {
  if (score >= 80) return 'good'
  if (score >= 60) return 'warning'
  return 'error'
}
</script>

<template>
  <div class="border border-surface-border rounded-xl overflow-hidden bg-surface-raised/50">
    <button
      class="w-full flex items-center justify-between px-4 py-3 hover:bg-surface-raised transition-colors"
      @click="emit('toggle', id)"
    >
      <div class="flex items-center gap-2">
        <svg
          class="w-4 h-4 text-slate-400 transition-transform"
          :class="{ 'rotate-90': expanded }"
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
        <span class="text-sm font-medium text-slate-200">{{ title }}</span>
      </div>
      <StatusBadge
        v-if="sectionScore !== undefined && id !== 'rank-reasons' && id !== 'recommendations'"
        :status="scoreStatus(sectionScore)"
        :label="String(sectionScore)"
      />
    </button>
    <div v-show="expanded" class="px-4 pb-4 animate-fade-in">
      <!-- Rank Reasons -->
      <RankSummary v-if="id === 'rank-reasons'" :reasons="report.rankReasons" />

      <!-- Recommendations -->
      <div v-else-if="id === 'recommendations'" class="space-y-3">
        <div
          v-for="rec in report.recommendations"
          :key="rec.id"
          class="p-3 rounded-lg border border-surface-border bg-surface/50"
        >
          <div class="flex items-center gap-2 mb-2">
            <StatusBadge
              :status="rec.severity === 'high' ? 'error' : rec.severity === 'medium' ? 'warning' : 'info'"
              :label="rec.severity.toUpperCase()"
            />
          </div>
          <p class="text-sm font-medium text-slate-200">{{ rec.problem }}</p>
          <p class="text-xs text-slate-400 mt-1">{{ rec.whyItMatters }}</p>
          <p class="text-xs text-accent-glow mt-2">Fix: {{ rec.suggestedFix }}</p>
        </div>
        <p v-if="report.recommendations.length === 0" class="text-sm text-emerald-400">No issues found!</p>
      </div>

      <!-- Headings special display -->
      <div v-else-if="id === 'headings' && section" class="space-y-3">
        <AnalysisCard :data="{ ...section.data, allHeadings: undefined }" />
        <div v-if="(section.data as Record<string, unknown>).allHeadings" class="space-y-1">
          <p class="text-xs text-slate-500 mb-2">All Headings</p>
          <div
            v-for="(h, i) in (section.data as { allHeadings: { level: number; text: string }[] }).allHeadings"
            :key="i"
            class="flex gap-2 text-xs"
          >
            <span class="text-accent font-mono">H{{ h.level }}</span>
            <span class="text-slate-300 truncate">{{ h.text }}</span>
          </div>
        </div>
      </div>

      <!-- Default section -->
      <AnalysisCard v-else-if="section" :data="section.data as Record<string, unknown>" />
    </div>
  </div>
</template>
