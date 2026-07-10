<script setup lang="ts">
import { useHighlight } from '../../composables/useHighlight'

const props = defineProps<{
  headings: { level: number; text: string; selector?: string }[]
  counts: Record<string, number>
  missingH1: boolean
  duplicateH1: boolean
}>()

const { highlightOnPage } = useHighlight()
</script>

<template>
  <div class="space-y-3">
    <div class="grid grid-cols-5 gap-1">
      <div
        v-for="level in 5"
        :key="level"
        class="text-center p-2 rounded bg-surface/50 border border-surface-border"
      >
        <p class="text-[10px] text-slate-500">H{{ level }}</p>
        <p class="text-sm font-semibold text-slate-200">{{ counts[`h${level}`] ?? 0 }}</p>
      </div>
    </div>

    <div class="flex gap-2 flex-wrap">
      <span
        v-if="missingH1"
        class="text-xs px-2 py-0.5 rounded-full bg-red-500/15 text-red-400 border border-red-500/30"
      >Missing H1</span>
      <span
        v-if="duplicateH1"
        class="text-xs px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30"
      >Duplicate H1</span>
      <span
        v-if="!missingH1 && !duplicateH1"
        class="text-xs px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
      >H1 OK</span>
    </div>

    <div class="space-y-1 max-h-48 overflow-y-auto">
      <div
        v-for="(h, i) in headings"
        :key="i"
        class="flex items-center gap-2 text-xs group"
      >
        <span class="text-accent font-mono w-6">H{{ h.level }}</span>
        <span class="text-slate-300 truncate flex-1">{{ h.text }}</span>
        <button
          v-if="h.selector"
          class="opacity-0 group-hover:opacity-100 text-accent-glow hover:text-white transition-opacity"
          title="Show on page"
          @click="highlightOnPage(h.selector!)"
        >
          <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>
