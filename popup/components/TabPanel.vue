<script setup lang="ts">
import { computed } from 'vue'
import SeoScoreCard from './SeoScoreCard.vue'
import SectionPanel from './SectionPanel.vue'
import SettingsPanel from './SettingsPanel.vue'
import { useReportStore } from '../stores/report'
import type { SeoReport } from '../../types/report'

const props = defineProps<{
  report: SeoReport
  targetKeyword?: string
}>()

const emit = defineEmits<{
  'settings-saved': []
  'settings-close': []
}>()

const store = useReportStore()

const tab = computed(() => store.activeNavTab)
const isSettings = computed(() => store.activeTab === 'settings')
const isOverview = computed(() => store.activeTab === 'overview')
</script>

<template>
  <div class="flex-1 min-w-0 overflow-y-auto px-4 py-3 space-y-4 animate-fade-in">
    <SettingsPanel
      v-if="isSettings"
      @close="store.setActiveTab('overview'); emit('settings-close')"
      @saved="emit('settings-saved')"
    />

    <template v-else>
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
  </div>
</template>
