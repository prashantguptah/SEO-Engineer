<script setup lang="ts">
defineProps<{
  topKeywords: { word: string; count: number; density: number }[]
  topBigrams: { phrase: string; count: number; density: number }[]
  topTrigrams: { phrase: string; count: number; density: number }[]
  primaryKeyword: string
  primaryType: string
  customTarget?: boolean
  placement: Record<string, boolean> | null
}>()

const placementLabels: Record<string, string> = {
  inTitle: 'Title',
  inMeta: 'Meta',
  inUrl: 'URL',
  inH1: 'H1',
  inH2: 'H2',
  inFirstParagraph: 'First ¶',
  inLastParagraph: 'Last ¶',
}
</script>

<template>
  <div class="space-y-4">
    <div class="p-2 rounded-lg bg-accent/10 border border-accent/20">
      <p class="text-[10px] text-slate-500 uppercase">
        Primary {{ primaryType }}
        <span v-if="customTarget" class="text-accent-glow">(custom target)</span>
      </p>
      <p class="text-sm font-medium text-accent-glow">{{ primaryKeyword || '—' }}</p>
    </div>

    <div v-if="placement" class="flex flex-wrap gap-1.5">
      <span
        v-for="(val, key) in placement"
        :key="key"
        class="text-[10px] px-2 py-0.5 rounded-full border"
        :class="val
          ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
          : 'bg-surface border-surface-border text-slate-500'"
      >
        {{ placementLabels[key] ?? key }}
      </span>
    </div>

    <div>
      <p class="text-xs text-slate-500 mb-2">Top Keywords</p>
      <div class="space-y-1">
        <div
          v-for="kw in topKeywords.slice(0, 5)"
          :key="kw.word"
          class="flex justify-between text-xs"
        >
          <span class="text-slate-300">{{ kw.word }}</span>
          <span class="text-slate-500">{{ kw.count }}× · {{ kw.density }}%</span>
        </div>
      </div>
    </div>

    <div>
      <p class="text-xs text-slate-500 mb-2">Top 2-Word Phrases</p>
      <div class="space-y-1">
        <div
          v-for="p in topBigrams.slice(0, 5)"
          :key="p.phrase"
          class="flex justify-between text-xs"
        >
          <span class="text-slate-300">{{ p.phrase }}</span>
          <span class="text-slate-500">{{ p.count }}×</span>
        </div>
      </div>
    </div>

    <div v-if="topTrigrams.length">
      <p class="text-xs text-slate-500 mb-2">Top 3-Word Phrases</p>
      <div class="space-y-1">
        <div
          v-for="p in topTrigrams.slice(0, 3)"
          :key="p.phrase"
          class="flex justify-between text-xs"
        >
          <span class="text-slate-300 truncate">{{ p.phrase }}</span>
          <span class="text-slate-500 ml-2">{{ p.count }}×</span>
        </div>
      </div>
    </div>
  </div>
</template>
