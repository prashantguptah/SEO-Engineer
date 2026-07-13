<script setup lang="ts">
import { computed } from 'vue'
import SeoScoreCard from './SeoScoreCard.vue'
import DiffSummary from './DiffSummary.vue'
import SectionPanel from './SectionPanel.vue'
import SettingsPanel from './SettingsPanel.vue'
import HistoryPanel from './HistoryPanel.vue'
import ComparePanel from './ComparePanel.vue'
import { useReportStore } from '../stores/report'
import type { SeoReport } from '../../types/report'

const props = defineProps<{
  report?: SeoReport | null
  targetKeyword?: string
}>()

const emit = defineEmits<{
  'settings-saved': []
  'settings-close': []
  analyze: []
}>()

const store = useReportStore()

const tab = computed(() => store.activeNavTab)
const isSettings = computed(() => store.activeTab === 'settings')
const isHistory = computed(() => store.activeTab === 'history')
const isCompare = computed(() => store.activeTab === 'compare')
const isOverview = computed(() => store.activeTab === 'overview')
const isToolTab = computed(() => isSettings.value || isHistory.value || isCompare.value)
</script>

<template>
  <div class="flex-1 min-w-0 overflow-y-auto px-4 py-3 space-y-4 animate-fade-in">
    <SettingsPanel
      v-if="isSettings"
      @close="store.setActiveTab('overview'); emit('settings-close')"
      @saved="emit('settings-saved')"
    />

    <HistoryPanel v-else-if="isHistory" />

    <ComparePanel v-else-if="isCompare" />

    <template v-else-if="report">
      <div class="flex items-center justify-between gap-2">
        <h2 class="text-sm font-semibold text-white">{{ tab.label }}</h2>
        <span
          v-if="store.tabBadges[tab.id]"
          class="text-[10px] px-2 py-0.5 rounded-full bg-amber-400/15 text-amber-400 border border-amber-400/30"
        >
          {{ store.tabBadges[tab.id] }} issue{{ store.tabBadges[tab.id]! === 1 ? '' : 's' }}
        </span>
      </div>

      <template v-if="isOverview">
        <SeoScoreCard
          :scores="report.scores"
          :duration-ms="report.durationMs"
          :score-history="report.scoreHistory"
        />
        <DiffSummary v-if="report.reportDiff" :diff="report.reportDiff" />
        <div
          v-if="targetKeyword"
          class="text-[10px] px-2 py-1 rounded bg-accent/10 border border-accent/20 text-accent-glow"
        >
          Target keyword: <strong>{{ targetKeyword }}</strong>
        </div>
      </template>

      <div
        v-for="sectionId in tab.sections"
        :key="sectionId"
        class="rounded-xl border border-surface-border bg-surface-raised/40 p-3"
      >
        <SectionPanel
          :section-id="sectionId"
          :report="report"
          :show-title="!['rank-reasons', 'positives', 'recommendations'].includes(sectionId) || tab.sections.length > 1"
        />
      </div>
    </template>

    <div
      v-else-if="!isToolTab"
      class="flex flex-col items-center justify-center gap-3 text-center py-12"
    >
      <p class="text-sm text-slate-300">Auto-analyze is off</p>
      <p class="text-xs text-slate-500">Click Analyze to run a report for this page.</p>
      <button
        class="px-4 py-2 text-sm bg-accent hover:bg-accent-glow text-accent-ink font-semibold rounded-lg"
        @click="emit('analyze')"
      >
        Analyze page
      </button>
    </div>
  </div>
</template>
