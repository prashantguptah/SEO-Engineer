<script setup lang="ts">
import { computed } from 'vue'
import type { AnalyzerResult } from '../../types/analyzer'
import type { HreflangEntry } from '../../types/seo'

const props = defineProps<{
  section: AnalyzerResult
}>()

const data = computed(() => props.section.data as {
  count: number
  entries: HreflangEntry[]
  hasXDefault: boolean
  uniqueLangs: string[]
  invalidCodes: string[]
  duplicateLangs: string[]
  selfReference: boolean
})
</script>

<template>
  <div class="space-y-3">
    <div v-if="data.count === 0" class="text-xs text-slate-400 py-2">
      No <code class="text-slate-300">hreflang</code> annotations on this page. That’s fine for
      single-locale sites; add them if you publish language/region variants.
    </div>

    <template v-else>
      <div class="flex flex-wrap gap-2 text-[10px]">
        <span
          class="px-2 py-0.5 rounded border"
          :class="data.hasXDefault ? 'border-emerald-500/40 text-emerald-400' : 'border-amber-500/40 text-amber-400'"
        >
          x-default: {{ data.hasXDefault ? 'yes' : 'missing' }}
        </span>
        <span
          class="px-2 py-0.5 rounded border"
          :class="data.selfReference ? 'border-emerald-500/40 text-emerald-400' : 'border-amber-500/40 text-amber-400'"
        >
          self-ref: {{ data.selfReference ? 'yes' : 'no' }}
        </span>
        <span class="px-2 py-0.5 rounded border border-surface-border text-slate-400">
          {{ data.count }} link{{ data.count === 1 ? '' : 's' }}
        </span>
      </div>

      <div class="space-y-1">
        <div
          v-for="(entry, i) in data.entries"
          :key="i"
          class="flex gap-2 text-[11px] p-2 rounded bg-surface/50 border border-surface-border"
        >
          <span class="shrink-0 font-mono text-accent-glow">{{ entry.lang }}</span>
          <span class="truncate text-slate-300 font-mono">{{ entry.href }}</span>
        </div>
      </div>

      <p v-if="data.invalidCodes.length" class="text-[10px] text-amber-400">
        Invalid codes: {{ data.invalidCodes.join(', ') }}
      </p>
      <p v-if="data.duplicateLangs.length" class="text-[10px] text-amber-400">
        Duplicates: {{ data.duplicateLangs.join(', ') }}
      </p>
    </template>
  </div>
</template>
