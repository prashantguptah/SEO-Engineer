<script setup lang="ts">
import { computed } from 'vue'
import type { ReportDiff } from '../../types/report'

const props = defineProps<{
  diff: ReportDiff
}>()

const deltaLabel = computed(() => {
  const d = props.diff.scoreDelta
  if (d > 0) return `+${d}`
  if (d < 0) return `${d}`
  return '0'
})

const deltaClass = computed(() => {
  if (props.diff.scoreDelta > 0) return 'text-emerald-400'
  if (props.diff.scoreDelta < 0) return 'text-red-400'
  return 'text-slate-400'
})

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return iso
  }
}
</script>

<template>
  <div class="rounded-xl border border-surface-border bg-surface-raised/40 p-3 space-y-3">
    <div class="flex items-center justify-between gap-2">
      <div>
        <h3 class="text-xs font-semibold text-slate-300 uppercase tracking-wide">Since last audit</h3>
        <p class="text-[10px] text-slate-500 mt-0.5">
          vs {{ formatDate(diff.previousAnalyzedAt) }} (score {{ diff.previousScore }})
        </p>
      </div>
      <div class="text-right">
        <p class="text-lg font-bold" :class="deltaClass">{{ deltaLabel }}</p>
        <p class="text-[10px] text-slate-500">score delta</p>
      </div>
    </div>

    <div class="grid grid-cols-3 gap-2 text-center">
      <div class="rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-2 py-2">
        <p class="text-sm font-semibold text-emerald-400">{{ diff.fixed.length }}</p>
        <p class="text-[10px] text-slate-400">Fixed</p>
      </div>
      <div class="rounded-lg bg-red-500/10 border border-red-500/20 px-2 py-2">
        <p class="text-sm font-semibold text-red-400">{{ diff.newIssues.length }}</p>
        <p class="text-[10px] text-slate-400">New</p>
      </div>
      <div class="rounded-lg bg-amber-500/10 border border-amber-500/20 px-2 py-2">
        <p class="text-sm font-semibold text-amber-400">{{ diff.stillOpen.length }}</p>
        <p class="text-[10px] text-slate-400">Still open</p>
      </div>
    </div>

    <div v-if="diff.fixed.length" class="space-y-1">
      <p class="text-[10px] uppercase text-emerald-400/80">Fixed</p>
      <p
        v-for="item in diff.fixed.slice(0, 5)"
        :key="`fixed-${item.id}`"
        class="text-[11px] text-slate-300 truncate"
      >
        ✓ {{ item.problem }}
      </p>
      <p v-if="diff.fixed.length > 5" class="text-[10px] text-slate-500">
        +{{ diff.fixed.length - 5 }} more
      </p>
    </div>

    <div v-if="diff.newIssues.length" class="space-y-1">
      <p class="text-[10px] uppercase text-red-400/80">New issues</p>
      <p
        v-for="item in diff.newIssues.slice(0, 5)"
        :key="`new-${item.id}`"
        class="text-[11px] text-slate-300 truncate"
      >
        + {{ item.problem }}
      </p>
      <p v-if="diff.newIssues.length > 5" class="text-[10px] text-slate-500">
        +{{ diff.newIssues.length - 5 }} more
      </p>
    </div>
  </div>
</template>
