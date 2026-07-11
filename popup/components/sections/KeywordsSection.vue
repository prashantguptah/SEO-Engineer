<script setup lang="ts">
import type { KeywordMatrixRow } from '../../../analyzers/keywords'

defineProps<{
  topKeywords: { word: string; count: number; density: number }[]
  topBigrams: { phrase: string; count: number; density: number }[]
  topTrigrams: { phrase: string; count: number; density: number }[]
  primaryKeyword: string
  primaryType: string
  customTarget?: boolean
  secondaryKeywords?: string[]
  placement: Record<string, boolean> | null
  matrix?: KeywordMatrixRow[]
}>()

const placementLabels: Record<string, string> = {
  inTitle: 'Title',
  inMeta: 'Meta',
  inUrl: 'URL',
  inH1: 'H1',
  inH2: 'H2',
  inFirstParagraph: 'First ¶',
  inLastParagraph: 'Last ¶',
  inImageAlts: 'Img alts',
}

const matrixCols: { key: keyof KeywordMatrixRow['placement']; label: string }[] = [
  { key: 'inTitle', label: 'Title' },
  { key: 'inMeta', label: 'Meta' },
  { key: 'inUrl', label: 'URL' },
  { key: 'inH1', label: 'H1' },
  { key: 'inH2', label: 'H2' },
  { key: 'inFirst100', label: '1st 100' },
  { key: 'inImageAlts', label: 'Alts' },
]
</script>

<template>
  <div class="space-y-4">
    <div class="p-2 rounded-lg bg-accent/10 border border-accent/20">
      <p class="text-[10px] text-slate-500 uppercase">
        Primary {{ primaryType }}
        <span v-if="customTarget" class="text-accent-glow">(custom target)</span>
      </p>
      <p class="text-sm font-medium text-accent-glow">{{ primaryKeyword || '—' }}</p>
      <p v-if="secondaryKeywords?.length" class="text-[10px] text-slate-400 mt-1">
        Secondary: {{ secondaryKeywords.join(', ') }}
      </p>
    </div>

    <!-- Multi-keyword matrix -->
    <div v-if="matrix?.length" class="overflow-x-auto rounded-lg border border-surface-border">
      <p class="text-[10px] uppercase text-slate-500 px-2 pt-2">Placement matrix</p>
      <table class="w-full text-[10px] mt-1">
        <thead>
          <tr class="text-slate-500 border-b border-surface-border">
            <th class="text-left font-medium px-2 py-1.5">Keyword</th>
            <th
              v-for="col in matrixCols"
              :key="col.key"
              class="font-medium px-1 py-1.5 text-center"
            >
              {{ col.label }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="row in matrix"
            :key="row.keyword + row.role"
            class="border-b border-surface-border/50 last:border-0"
          >
            <td class="px-2 py-1.5 text-slate-200 max-w-[90px] truncate" :title="row.keyword">
              <span
                class="text-[8px] uppercase mr-1"
                :class="row.role === 'primary' ? 'text-accent-glow' : 'text-slate-500'"
              >{{ row.role === 'primary' ? 'P' : 'S' }}</span>
              {{ row.keyword }}
            </td>
            <td
              v-for="col in matrixCols"
              :key="col.key"
              class="text-center px-1 py-1.5"
              :class="row.placement[col.key] ? 'text-emerald-400' : 'text-slate-600'"
            >
              {{ row.placement[col.key] ? '✓' : '·' }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-else-if="placement" class="flex flex-wrap gap-1.5">
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
