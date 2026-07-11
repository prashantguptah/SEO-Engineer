<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import type { AuditLibraryEntry, SeoReport } from '../../types/report'
import {
  clearAuditLibrary,
  deleteAuditEntry,
  loadAuditLibrary,
} from '../composables/useReportHistory'
import { useReportStore } from '../stores/report'
import { useToast } from '../composables/useToast'

const store = useReportStore()
const { toast } = useToast()

const entries = ref<AuditLibraryEntry[]>([])
const loading = ref(true)
const query = ref('')

const filtered = computed(() => {
  const q = query.value.toLowerCase().trim()
  if (!q) return entries.value
  return entries.value.filter(
    (e) =>
      e.title.toLowerCase().includes(q) ||
      e.url.toLowerCase().includes(q) ||
      e.pageType.toLowerCase().includes(q),
  )
})

async function refresh() {
  loading.value = true
  try {
    entries.value = await loadAuditLibrary()
  } finally {
    loading.value = false
  }
}

onMounted(refresh)

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

function scoreColor(score: number) {
  if (score >= 80) return 'text-emerald-400'
  if (score >= 60) return 'text-amber-400'
  return 'text-red-400'
}

function openEntry(entry: AuditLibraryEntry) {
  const report: SeoReport = {
    ...entry.report,
    scoreHistory: entry.report.scoreHistory,
  }
  store.setReport(report)
  store.setActiveTab('overview')
  toast('Loaded saved audit')
}

async function removeEntry(id: string) {
  entries.value = await deleteAuditEntry(id)
  toast('Audit deleted')
}

async function clearAll() {
  await clearAuditLibrary()
  entries.value = []
  toast('History cleared')
}
</script>

<template>
  <div class="space-y-4 animate-fade-in">
    <div class="flex items-center justify-between gap-2">
      <div>
        <h2 class="text-sm font-semibold text-white">Audit history</h2>
        <p class="text-[10px] text-slate-500 mt-0.5">Last {{ entries.length }} saved analyses</p>
      </div>
      <button
        v-if="entries.length"
        class="text-[10px] text-slate-400 hover:text-red-400"
        @click="clearAll"
      >
        Clear all
      </button>
    </div>

    <input
      v-model="query"
      type="text"
      placeholder="Filter by title or URL…"
      class="w-full px-3 py-1.5 text-xs bg-surface-raised border border-surface-border rounded-lg text-slate-300 placeholder-slate-500 focus:outline-none focus:border-accent/50"
    />

    <p v-if="loading" class="text-xs text-slate-500">Loading history…</p>

    <p v-else-if="filtered.length === 0" class="text-xs text-slate-500 py-6 text-center">
      {{ entries.length === 0 ? 'No saved audits yet. Run an analysis to start building history.' : 'No matches.' }}
    </p>

    <div v-else class="space-y-2">
      <div
        v-for="entry in filtered"
        :key="entry.id"
        class="p-3 rounded-lg border border-surface-border bg-surface/50 hover:border-accent/30 transition-colors"
      >
        <div class="flex items-start gap-2">
          <img
            v-if="entry.favicon"
            :src="entry.favicon"
            alt=""
            class="w-5 h-5 rounded mt-0.5 bg-surface-raised"
            @error="($event.target as HTMLImageElement).style.display = 'none'"
          />
          <div class="flex-1 min-w-0">
            <p class="text-xs font-medium text-slate-200 truncate">{{ entry.title || 'Untitled' }}</p>
            <p class="text-[10px] text-slate-500 truncate">{{ entry.url }}</p>
            <div class="flex items-center gap-2 mt-1 flex-wrap">
              <span class="text-xs font-semibold" :class="scoreColor(entry.score)">{{ entry.score }}</span>
              <span class="text-[10px] text-slate-500">{{ formatDate(entry.analyzedAt) }}</span>
              <span class="text-[10px] text-accent-glow/80">{{ entry.pageType }}</span>
            </div>
          </div>
        </div>
        <div class="flex gap-2 mt-2">
          <button
            class="flex-1 px-2 py-1 text-[10px] font-medium bg-accent/20 hover:bg-accent/30 text-accent-glow rounded border border-accent/30"
            @click="openEntry(entry)"
          >
            Open
          </button>
          <button
            class="px-2 py-1 text-[10px] text-accent-glow hover:text-white rounded border border-accent/30"
            @click="store.openCompare(entry.id)"
          >
            Compare
          </button>
          <button
            class="px-2 py-1 text-[10px] text-slate-400 hover:text-red-400 rounded border border-surface-border"
            @click="removeEntry(entry.id)"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
