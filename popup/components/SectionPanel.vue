<script setup lang="ts">
import { computed } from 'vue'
import AnalysisCard from './AnalysisCard.vue'
import RankSummary from './RankSummary.vue'
import StatusBadge from './StatusBadge.vue'
import TitleSection from './sections/TitleSection.vue'
import HeadingsSection from './sections/HeadingsSection.vue'
import KeywordsSection from './sections/KeywordsSection.vue'
import PerformanceSection from './sections/PerformanceSection.vue'
import PositivesSection from './sections/PositivesSection.vue'
import ImagesSection from './sections/ImagesSection.vue'
import LinksSection from './sections/LinksSection.vue'
import SchemaSection from './sections/SchemaSection.vue'
import EeatSection from './sections/EeatSection.vue'
import { useHighlight } from '../composables/useHighlight'
import { SECTION_TITLES } from '../stores/report'
import type { SeoReport } from '../../types/report'

const props = defineProps<{
  sectionId: string
  report: SeoReport
  showTitle?: boolean
}>()

const { highlightOnPage } = useHighlight()
const section = computed(() => props.report.sections[props.sectionId])
const title = computed(() => SECTION_TITLES[props.sectionId] ?? props.sectionId)
const sectionScore = computed(() => section.value?.score)

function scoreStatus(score: number): 'good' | 'warning' | 'error' {
  if (score >= 80) return 'good'
  if (score >= 60) return 'warning'
  return 'error'
}
</script>

<template>
  <div class="space-y-3">
    <div
      v-if="showTitle !== false && !['rank-reasons', 'positives', 'recommendations'].includes(sectionId)"
      class="flex items-center justify-between"
    >
      <h3 class="text-xs font-semibold text-slate-300 uppercase tracking-wide">{{ title }}</h3>
      <StatusBadge
        v-if="sectionScore !== undefined"
        :status="scoreStatus(sectionScore)"
        :label="String(sectionScore)"
      />
    </div>

    <RankSummary v-if="sectionId === 'rank-reasons'" :reasons="report.rankReasons" />

    <PositivesSection v-else-if="sectionId === 'positives'" :positives="report.positives" />

    <div v-else-if="sectionId === 'recommendations'" class="space-y-3">
      <div
        v-for="rec in report.recommendations"
        :key="rec.id"
        class="p-3 rounded-lg border border-surface-border bg-surface/50"
      >
        <div class="flex items-center justify-between gap-2 mb-2">
          <StatusBadge
            :status="rec.severity === 'high' ? 'error' : rec.severity === 'medium' ? 'warning' : 'info'"
            :label="rec.severity.toUpperCase()"
          />
          <button
            v-if="rec.elementSelector"
            class="text-[10px] text-accent-glow hover:text-white flex items-center gap-1"
            @click="highlightOnPage(rec.elementSelector!)"
          >
            Show on page
          </button>
        </div>
        <p class="text-sm font-medium text-slate-200">{{ rec.problem }}</p>
        <p v-if="rec.severityReason" class="text-[10px] text-slate-500 mt-1 italic">{{ rec.severityReason }}</p>
        <p class="text-xs text-slate-400 mt-1">{{ rec.whyItMatters }}</p>
        <p class="text-xs text-accent-glow mt-2">Fix: {{ rec.suggestedFix }}</p>
      </div>
      <p v-if="report.recommendations.length === 0" class="text-sm text-emerald-400">No issues found!</p>
    </div>

    <TitleSection v-else-if="sectionId === 'title' && section" :section="section" />

    <HeadingsSection
      v-else-if="sectionId === 'headings' && section"
      :headings="(section.data as { allHeadings: { level: number; text: string; selector?: string }[] }).allHeadings ?? []"
      :counts="(section.data as { counts: Record<string, number> }).counts"
      :missing-h1="(section.data as { missingH1: boolean }).missingH1"
      :duplicate-h1="(section.data as { duplicateH1: boolean }).duplicateH1"
    />

    <KeywordsSection
      v-else-if="sectionId === 'keywords' && section"
      :top-keywords="(section.data as { topKeywords: [] }).topKeywords"
      :top-bigrams="(section.data as { topBigrams: [] }).topBigrams"
      :top-trigrams="(section.data as { topTrigrams: [] }).topTrigrams"
      :primary-keyword="(section.data as { primaryKeyword: string }).primaryKeyword"
      :primary-type="(section.data as { primaryType: string }).primaryType"
      :custom-target="(section.data as { customTarget?: boolean }).customTarget"
      :placement="(section.data as { placement: Record<string, boolean> | null }).placement"
    />

    <PerformanceSection
      v-else-if="sectionId === 'performance' && section"
      :data="(section.data as Record<string, unknown>) as any"
    />

    <ImagesSection
      v-else-if="sectionId === 'images' && section"
      :data="(section.data as Record<string, unknown>) as any"
    />

    <LinksSection
      v-else-if="sectionId === 'links' && section"
      :data="(section.data as Record<string, unknown>) as any"
    />

    <SchemaSection
      v-else-if="sectionId === 'schema' && section"
      :data="(section.data as Record<string, unknown>) as any"
    />

    <EeatSection
      v-else-if="sectionId === 'eeat' && section"
      :data="(section.data as Record<string, unknown>) as any"
    />

    <AnalysisCard v-else-if="section" :data="section.data as Record<string, unknown>" />
  </div>
</template>
