<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useClipboard } from '@vueuse/core'
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
import TechnicalSection from './sections/TechnicalSection.vue'
import HreflangSection from './sections/HreflangSection.vue'
import { useHighlight } from '../composables/useHighlight'
import { useToast } from '../composables/useToast'
import {
  useFixChecklist,
  type FixStatus,
  type UrlChecklist,
} from '../composables/useFixChecklist'
import { SECTION_TITLES } from '../stores/report'
import type { SeoReport } from '../../types/report'
import type { Issue } from '../../types/analyzer'

const props = defineProps<{
  sectionId: string
  report: SeoReport
  showTitle?: boolean
}>()

const { highlightOnPage } = useHighlight()
const { toast } = useToast()
const { copy: copyToClipboard } = useClipboard()
const { getChecklist, statusFor, setStatus, clearForUrl } = useFixChecklist()

const section = computed(() => props.report.sections[props.sectionId])
const title = computed(() => SECTION_TITLES[props.sectionId] ?? props.sectionId)
const sectionScore = computed(() => section.value?.score)

const checklist = ref<UrlChecklist>({ done: [], dismissed: [] })
const filter = ref<'open' | 'done' | 'dismissed' | 'all'>('open')

onMounted(async () => {
  if (props.sectionId === 'recommendations') {
    checklist.value = await getChecklist(props.report.url)
  }
})

watch(
  () => props.report.url,
  async (url) => {
    if (props.sectionId === 'recommendations') {
      checklist.value = await getChecklist(url)
    }
  },
)

const filteredRecs = computed(() => {
  const recs = props.report.recommendations
  if (filter.value === 'all') return recs
  return recs.filter((r) => statusFor(checklist.value, r.id) === filter.value)
})

const counts = computed(() => {
  const recs = props.report.recommendations
  return {
    open: recs.filter((r) => statusFor(checklist.value, r.id) === 'open').length,
    done: recs.filter((r) => statusFor(checklist.value, r.id) === 'done').length,
    dismissed: recs.filter((r) => statusFor(checklist.value, r.id) === 'dismissed').length,
  }
})

function scoreStatus(score: number): 'good' | 'warning' | 'error' {
  if (score >= 80) return 'good'
  if (score >= 60) return 'warning'
  return 'error'
}

async function copySnippet(snippet: string) {
  await copyToClipboard(snippet)
  toast('Fix snippet copied')
}

async function updateStatus(issue: Issue, status: FixStatus) {
  checklist.value = await setStatus(props.report.url, issue.id, status)
  toast(status === 'done' ? 'Marked done' : status === 'dismissed' ? 'Dismissed' : 'Reopened')
}

async function resetChecklist() {
  await clearForUrl(props.report.url)
  checklist.value = { done: [], dismissed: [] }
  filter.value = 'open'
  toast('Checklist reset for this URL')
}

function issueStatus(id: string): FixStatus {
  return statusFor(checklist.value, id)
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
      <div class="flex items-center gap-1 flex-wrap">
        <button
          v-for="f in (['open', 'done', 'dismissed', 'all'] as const)"
          :key="f"
          class="text-[10px] px-2 py-1 rounded border transition-colors"
          :class="
            filter === f
              ? 'bg-accent/20 border-accent/40 text-accent-glow'
              : 'border-surface-border text-slate-400 hover:text-slate-200'
          "
          @click="filter = f"
        >
          {{ f === 'open' ? `Open (${counts.open})` : f === 'done' ? `Done (${counts.done})` : f === 'dismissed' ? `Dismissed (${counts.dismissed})` : 'All' }}
        </button>
        <button
          v-if="counts.done + counts.dismissed > 0"
          class="text-[10px] text-slate-500 hover:text-slate-300 ml-auto"
          @click="resetChecklist"
        >
          Reset
        </button>
      </div>

      <div
        v-for="rec in filteredRecs"
        :key="rec.id"
        class="p-3 rounded-lg border border-surface-border bg-surface/50"
        :class="{ 'opacity-60': issueStatus(rec.id) !== 'open' }"
      >
        <div class="flex items-center justify-between gap-2 mb-2">
          <div class="flex items-center gap-2">
            <StatusBadge
              :status="rec.severity === 'high' ? 'error' : rec.severity === 'medium' ? 'warning' : 'info'"
              :label="rec.severity.toUpperCase()"
            />
            <span
              v-if="issueStatus(rec.id) !== 'open'"
              class="text-[9px] uppercase px-1.5 py-0.5 rounded"
              :class="
                issueStatus(rec.id) === 'done'
                  ? 'bg-emerald-500/15 text-emerald-400'
                  : 'bg-slate-500/20 text-slate-400'
              "
            >
              {{ issueStatus(rec.id) }}
            </span>
          </div>
          <div class="flex items-center gap-2">
            <button
              v-if="rec.fixSnippet"
              class="text-[10px] text-accent-glow hover:text-white"
              @click="copySnippet(rec.fixSnippet!)"
            >
              Copy snippet
            </button>
            <button
              v-if="rec.elementSelector"
              class="text-[10px] text-accent-glow hover:text-white"
              @click="highlightOnPage(rec.elementSelector!)"
            >
              Show on page
            </button>
          </div>
        </div>
        <p class="text-sm font-medium text-slate-200">{{ rec.problem }}</p>
        <p v-if="rec.severityReason" class="text-[10px] text-slate-500 mt-1 italic">{{ rec.severityReason }}</p>
        <p class="text-xs text-slate-400 mt-1">{{ rec.whyItMatters }}</p>
        <p class="text-xs text-accent-glow mt-2">Fix: {{ rec.suggestedFix }}</p>
        <pre
          v-if="rec.fixSnippet"
          class="mt-2 p-2 rounded bg-[#0c0e14] border border-surface-border text-[10px] text-slate-300 overflow-x-auto whitespace-pre-wrap font-mono"
        >{{ rec.fixSnippet }}</pre>

        <div class="flex gap-2 mt-2">
          <button
            v-if="issueStatus(rec.id) !== 'done'"
            class="text-[10px] px-2 py-1 rounded border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
            @click="updateStatus(rec, 'done')"
          >
            Mark done
          </button>
          <button
            v-if="issueStatus(rec.id) !== 'dismissed'"
            class="text-[10px] px-2 py-1 rounded border border-surface-border text-slate-400 hover:text-slate-200"
            @click="updateStatus(rec, 'dismissed')"
          >
            Dismiss
          </button>
          <button
            v-if="issueStatus(rec.id) !== 'open'"
            class="text-[10px] px-2 py-1 rounded border border-surface-border text-slate-400 hover:text-slate-200"
            @click="updateStatus(rec, 'open')"
          >
            Reopen
          </button>
        </div>
      </div>

      <p v-if="filteredRecs.length === 0 && report.recommendations.length > 0" class="text-sm text-slate-500">
        No issues in this filter.
      </p>
      <p v-else-if="report.recommendations.length === 0" class="text-sm text-emerald-400">No issues found!</p>
    </div>

    <TitleSection v-else-if="sectionId === 'title' && section" :section="section" />

    <TechnicalSection v-else-if="sectionId === 'technical' && section" :section="section" />

    <HreflangSection v-else-if="sectionId === 'hreflang' && section" :section="section" />

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
      :secondary-keywords="(section.data as { secondaryKeywords?: string[] }).secondaryKeywords"
      :placement="(section.data as { placement: Record<string, boolean> | null }).placement"
      :matrix="(section.data as { matrix?: import('../../analyzers/keywords').KeywordMatrixRow[] }).matrix"
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
