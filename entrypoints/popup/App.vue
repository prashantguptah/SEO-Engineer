<script setup lang="ts">
import { onMounted } from 'vue'
import { useReportStore } from '../../popup/stores/report'
import { useAnalysis } from '../../popup/composables/useAnalysis'
import LoadingScreen from '../../popup/components/LoadingScreen.vue'
import SeoScoreCard from '../../popup/components/SeoScoreCard.vue'
import Accordion from '../../popup/components/Accordion.vue'

const store = useReportStore()
const { analyze, copyReport, downloadReport } = useAnalysis()

const sections = [
  { id: 'rank-reasons', title: 'Why This Page Ranks' },
  { id: 'basic', title: 'Basic Information' },
  { id: 'title', title: 'Title & Meta' },
  { id: 'headings', title: 'Heading Analysis' },
  { id: 'keywords', title: 'Keyword Analysis' },
  { id: 'content', title: 'Content Analysis' },
  { id: 'images', title: 'Images' },
  { id: 'links', title: 'Links' },
  { id: 'schema', title: 'Structured Data' },
  { id: 'technical', title: 'Technical SEO' },
  { id: 'accessibility', title: 'Accessibility' },
  { id: 'mobile', title: 'Mobile' },
  { id: 'technology', title: 'Technology Detection' },
  { id: 'eeat', title: 'E-E-A-T Signals' },
  { id: 'ux', title: 'UX Signals' },
  { id: 'recommendations', title: 'Recommendations' },
]

onMounted(() => analyze())
</script>

<template>
  <div class="flex flex-col h-[650px] w-[420px] bg-surface">
    <!-- Header -->
    <header class="flex-shrink-0 px-4 pt-4 pb-3 border-b border-surface-border">
      <div class="flex items-center gap-3">
        <img
          v-if="store.report?.favicon"
          :src="store.report.favicon"
          class="w-8 h-8 rounded-lg bg-surface-raised"
          alt=""
          @error="($event.target as HTMLImageElement).style.display = 'none'"
        />
        <div
          v-else
          class="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center"
        >
          <svg class="w-4 h-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <div class="flex-1 min-w-0">
          <h1 class="text-sm font-semibold text-white truncate">
            {{ store.report?.title || 'SEO Reverse Engineer' }}
          </h1>
          <p class="text-xs text-slate-500 truncate">
            {{ store.report?.url || 'Analyzing current page...' }}
          </p>
        </div>
      </div>
    </header>

    <!-- Content -->
    <main class="flex-1 overflow-y-auto px-4 py-3 space-y-3">
      <LoadingScreen v-if="store.loading" />

      <div v-else-if="store.error" class="flex flex-col items-center justify-center h-full gap-4 text-center">
        <div class="w-12 h-12 rounded-full bg-red-500/15 flex items-center justify-center">
          <svg class="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <p class="text-sm text-red-400">{{ store.error }}</p>
        <button
          class="px-4 py-2 text-sm bg-accent hover:bg-accent-glow text-white rounded-lg transition-colors"
          @click="analyze"
        >
          Retry Analysis
        </button>
      </div>

      <template v-else-if="store.report">
        <SeoScoreCard :scores="store.report.scores" :duration-ms="store.report.durationMs" />

        <!-- Toolbar -->
        <div class="flex items-center gap-2">
          <input
            v-model="store.searchQuery"
            type="text"
            placeholder="Search sections..."
            class="flex-1 px-3 py-1.5 text-xs bg-surface-raised border border-surface-border rounded-lg text-slate-300 placeholder-slate-500 focus:outline-none focus:border-accent/50"
          />
          <button
            class="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-surface-raised transition-colors"
            title="Expand all"
            @click="store.expandAll()"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <button
            class="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-surface-raised transition-colors"
            title="Collapse all"
            @click="store.collapseAll()"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
            </svg>
          </button>
        </div>

        <!-- Sections -->
        <Accordion
          v-for="section in sections.filter(s => store.searchQuery ? s.title.toLowerCase().includes(store.searchQuery.toLowerCase()) || s.id.includes(store.searchQuery.toLowerCase()) : true)"
          :key="section.id"
          :id="section.id"
          :title="section.title"
          :expanded="store.isExpanded(section.id)"
          :report="store.report"
          @toggle="store.toggleSection"
        />
      </template>
    </main>

    <!-- Footer Actions -->
    <footer
      v-if="store.report && !store.loading"
      class="flex-shrink-0 px-4 py-3 border-t border-surface-border flex gap-2"
    >
      <button
        class="flex-1 px-3 py-2 text-xs font-medium bg-surface-raised hover:bg-surface-border text-slate-300 rounded-lg border border-surface-border transition-colors"
        @click="copyReport"
      >
        Copy Report
      </button>
      <button
        class="flex-1 px-3 py-2 text-xs font-medium bg-surface-raised hover:bg-surface-border text-slate-300 rounded-lg border border-surface-border transition-colors"
        @click="downloadReport"
      >
        Download JSON
      </button>
      <button
        class="flex-1 px-3 py-2 text-xs font-medium bg-accent hover:bg-accent-glow text-white rounded-lg transition-colors"
        @click="analyze"
      >
        Refresh
      </button>
    </footer>
  </div>
</template>
