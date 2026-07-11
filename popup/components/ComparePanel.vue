<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import type { AuditLibraryEntry, SeoReport } from '../../types/report'
import { loadAuditLibrary } from '../composables/useReportHistory'
import { compareReports, type ReportCompareResult } from '../../utils/compare-reports'
import { useReportStore } from '../stores/report'

const store = useReportStore()

const entries = ref<AuditLibraryEntry[]>([])
const selectedId = ref('')
const loading = ref(true)

const current = computed(() => store.report)

const selectedEntry = computed(() => entries.value.find((e) => e.id === selectedId.value))

const comparison = computed<ReportCompareResult | null>(() => {
  if (!current.value || !selectedEntry.value) return null
  return compareReports(current.value, selectedEntry.value.report)
})

async function refresh() {
  loading.value = true
  try {
    entries.value = await loadAuditLibrary()
    if (store.compareTargetId && entries.value.some((e) => e.id === store.compareTargetId)) {
      selectedId.value = store.compareTargetId
      store.compareTargetId = null
    } else if (!selectedId.value && entries.value[0]) {
      const other = entries.value.find((e) => e.url !== current.value?.url)
      selectedId.value = (other ?? entries.value[0]).id
    }
  } finally {
    loading.value = false
  }
}

onMounted(refresh)

watch(
  () => store.report?.url,
  () => {
    void refresh()
  },
)

function deltaClass(delta?: number) {
  if (delta == null) return 'text-slate-500'
  if (delta > 0) return 'text-emerald-400'
  if (delta < 0) return 'text-red-400'
  return 'text-slate-400'
}

function formatDelta(delta?: number) {
  if (delta == null) return '—'
  if (delta > 0) return `+${delta}`
  return String(delta)
}

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

function shortTitle(report: SeoReport) {
  return report.title || report.url
}
</script>

<template>
  <div class="space-y-4 animate-fade-in">
    <div>
      <h2 class="text-sm font-semibold text-white">Compare</h2>
      <p class="text-[10px] text-slate-500 mt-0.5">
        Current report vs a saved History audit
      </p>
    </div>

    <p v-if="!current" class="text-xs text-slate-500">Run an analysis first.</p>

    <template v-else>
      <div class="p-2 rounded-lg border border-surface-border bg-surface/50 text-xs space-y-1">
        <p class="text-[10px] text-slate-500 uppercase">A — Current</p>
        <p class="text-slate-200 truncate">{{ shortTitle(current) }}</p>
        <p class="text-[10px] text-slate-500 truncate">{{ current.url }}</p>
        <p class="text-accent-glow font-semibold">Score {{ current.scores.overall }}</p>
      </div>

      <label class="block text-xs space-y-1">
        <span class="text-slate-300">B — Saved audit</span>
        <select
          v-model="selectedId"
          class="w-full px-3 py-1.5 bg-surface-raised border border-surface-border rounded-lg text-slate-200"
        >
          <option disabled value="">Select from History…</option>
          <option v-for="e in entries" :key="e.id" :value="e.id">
            {{ e.score }} · {{ e.title || e.url }} ({{ formatDate(e.analyzedAt) }})
          </option>
        </select>
      </label>

      <p v-if="loading" class="text-xs text-slate-500">Loading history…</p>
      <p v-else-if="entries.length === 0" class="text-xs text-slate-500">
        No saved audits yet. Analyze pages to build History, then compare.
      </p>

      <template v-else-if="comparison && selectedEntry">
        <div class="flex items-center justify-between p-3 rounded-xl border border-surface-border bg-surface-raised/40">
          <div>
            <p class="text-[10px] text-slate-500 uppercase">Score delta (A − B)</p>
            <p class="text-lg font-bold" :class="deltaClass(comparison.scoreDelta)">
              {{ formatDelta(comparison.scoreDelta) }}
            </p>
          </div>
          <div class="text-right text-[10px] text-slate-500">
            <p>A {{ current.scores.overall }}</p>
            <p>B {{ selectedEntry.score }}</p>
          </div>
        </div>

        <div class="space-y-1">
          <p class="text-[10px] uppercase text-slate-500">Metrics</p>
          <div
            v-for="m in comparison.metrics"
            :key="m.key"
            class="grid grid-cols-[1fr_40px_40px_36px] gap-1 text-[11px] py-1 border-b border-surface-border/40"
          >
            <span class="text-slate-400 truncate capitalize">{{ m.label }}</span>
            <span class="text-slate-200 text-right">{{ m.a }}</span>
            <span class="text-slate-500 text-right">{{ m.b }}</span>
            <span class="text-right font-medium" :class="deltaClass(m.delta)">{{ formatDelta(m.delta) }}</span>
          </div>
        </div>

        <div class="grid grid-cols-3 gap-2 text-center text-xs">
          <div class="rounded-lg bg-accent/10 border border-accent/20 px-2 py-2">
            <p class="text-sm font-semibold text-accent-glow">{{ comparison.onlyInA.length }}</p>
            <p class="text-[10px] text-slate-400">Only in A</p>
          </div>
          <div class="rounded-lg bg-slate-500/10 border border-surface-border px-2 py-2">
            <p class="text-sm font-semibold text-slate-300">{{ comparison.inBoth.length }}</p>
            <p class="text-[10px] text-slate-400">Shared</p>
          </div>
          <div class="rounded-lg bg-amber-500/10 border border-amber-500/20 px-2 py-2">
            <p class="text-sm font-semibold text-amber-400">{{ comparison.onlyInB.length }}</p>
            <p class="text-[10px] text-slate-400">Only in B</p>
          </div>
        </div>

        <div v-if="comparison.onlyInA.length" class="space-y-1">
          <p class="text-[10px] uppercase text-accent-glow/80">Issues only on current (A)</p>
          <p
            v-for="item in comparison.onlyInA.slice(0, 6)"
            :key="`a-${item.id}`"
            class="text-[11px] text-slate-300 truncate"
          >
            • {{ item.problem }}
          </p>
        </div>

        <div v-if="comparison.onlyInB.length" class="space-y-1">
          <p class="text-[10px] uppercase text-amber-400/80">Issues only on saved (B)</p>
          <p
            v-for="item in comparison.onlyInB.slice(0, 6)"
            :key="`b-${item.id}`"
            class="text-[11px] text-slate-300 truncate"
          >
            • {{ item.problem }}
          </p>
        </div>
      </template>
    </template>
  </div>
</template>
