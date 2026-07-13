<script setup lang="ts">
import { computed, onMounted, watch } from 'vue'
import { useReportStore } from '../stores/report'
import { useAnalysis } from '../composables/useAnalysis'
import { useToast } from '../composables/useToast'
import { useSettings } from '../composables/useSettings'
import { useOverlay } from '../composables/useOverlay'
import LoadingScreen from './LoadingScreen.vue'
import TabNav from './TabNav.vue'
import TabPanel from './TabPanel.vue'
import Toast from './Toast.vue'

const props = withDefaults(
  defineProps<{ layout?: 'popup' | 'sidepanel' }>(),
  { layout: 'popup' },
)

const store = useReportStore()
const { message, toast } = useToast()
const { settings, loadSettings } = useSettings()
const { analyze, loadCachedOnly, copyReportJson, copyReportMarkdown, downloadReport, exportPdf } =
  useAnalysis()
const { active: overlayActive, toggleOverlay } = useOverlay()

const showShell = computed(
  () =>
    !!store.report ||
    !!store.error ||
    (!store.loading && !settings.value.autoAnalyzeOnOpen) ||
    ['history', 'settings', 'compare'].includes(store.activeTab),
)

onMounted(async () => {
  await loadSettings()
  // When side-panel mode is on, Chrome opens sidepanel.html via openPanelOnActionClick.
  // This popup path is only a fallback if the popup still opens somehow.
  if (props.layout === 'popup' && settings.value.openAsSidePanel) {
    try {
      const res = await chrome.runtime.sendMessage({ type: 'OPEN_SIDE_PANEL' })
      if (res?.ok) {
        window.close()
        return
      }
    } catch {
      // fall through to popup analysis
    }
  }

  if (settings.value.autoAnalyzeOnOpen) {
    await analyze()
  } else {
    await loadCachedOnly()
  }
})

function formatPageType(type: string) {
  const labels: Record<string, string> = {
    blog: 'Blog / Article',
    product: 'Product Page',
    homepage: 'Homepage',
    utility: 'Utility Page',
    unknown: 'General Page',
  }
  return labels[type] ?? type
}

async function onSettingsSaved() {
  toast('Re-analyzing with new settings...')
  await analyze(false)
  store.setActiveTab('overview')
}

watch(
  () => store.filteredTabs,
  (tabs) => {
    if (
      store.activeTab === 'settings' ||
      store.activeTab === 'history' ||
      store.activeTab === 'compare'
    ) {
      return
    }
    if (tabs.length && !tabs.some((t) => t.id === store.activeTab)) {
      store.setActiveTab(tabs[0].id)
    }
  },
)
</script>

<template>
  <div
    class="flex flex-col bg-surface relative"
    :class="layout === 'sidepanel' ? 'h-screen w-full min-w-[480px]' : 'h-[650px] w-[640px]'"
  >
    <!-- Header — page context only (app branding lives in sidebar) -->
    <header class="flex-shrink-0 px-4 pt-3 pb-2 border-b border-surface-border">
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
          class="w-8 h-8 rounded-lg bg-surface-raised border border-surface-border flex items-center justify-center"
        >
          <span class="text-[10px] text-slate-500">web</span>
        </div>
        <div class="flex-1 min-w-0">
          <h1 class="text-sm font-semibold text-white truncate">
            {{
              store.report?.title ||
              (store.loading ? 'Analyzing page…' : 'keywordwalks')
            }}
          </h1>
          <p class="text-xs text-slate-500 truncate">
            {{
              store.report?.url ||
              (settings.autoAnalyzeOnOpen
                ? 'Waiting for analysis…'
                : 'Auto-analyze off — click Refresh to analyze')
            }}
          </p>
          <p v-if="store.report?.pageType" class="text-[10px] text-accent-glow mt-0.5">
            {{ formatPageType(store.report.pageType) }}
            <span v-if="store.report.enrichSkipped?.length" class="text-amber-400">
              · {{ store.report.enrichSkipped.length }} check(s) timed out
            </span>
          </p>
        </div>
      </div>
    </header>

    <!-- Body -->
    <div class="flex-1 flex min-h-0">
      <LoadingScreen v-if="store.loading && !store.report && !showShell" class="flex-1" />

      <template v-else>
        <TabNav :tabs="store.filteredTabs" :tool-tabs="store.toolTabs" />

        <div class="flex-1 flex flex-col min-w-0 min-h-0">
          <div
            v-if="store.error && !store.report"
            class="flex-1 flex flex-col items-center justify-center gap-4 text-center px-4"
          >
            <p class="text-sm text-red-400">{{ store.error }}</p>
            <button
              class="px-4 py-2 text-sm bg-accent hover:bg-accent-glow text-accent-ink font-semibold rounded-lg"
              @click="analyze(false)"
            >
              Retry Analysis
            </button>
          </div>

          <template v-else>
            <div v-if="store.report && store.loading" class="px-4 pt-2">
              <p class="text-[10px] text-accent-glow animate-pulse">Refreshing analysis...</p>
            </div>

            <div v-if="store.report" class="px-3 pt-2">
              <input
                v-model="store.searchQuery"
                type="text"
                placeholder="Filter tabs..."
                class="w-full px-3 py-1.5 text-xs bg-surface-raised border border-surface-border rounded-lg text-slate-300 placeholder-slate-500 focus:outline-none focus:border-accent/50"
              />
            </div>

            <TabPanel
              :report="store.report"
              :target-keyword="settings.targetKeyword"
              @settings-saved="onSettingsSaved"
              @analyze="analyze(false)"
            />
          </template>
        </div>
      </template>
    </div>

    <!-- Footer -->
    <footer
      v-if="store.report && store.activeTab !== 'settings' && store.activeTab !== 'history' && store.activeTab !== 'compare'"
      class="flex-shrink-0 px-3 py-2 border-t border-surface-border"
    >
      <div class="flex gap-2 flex-wrap">
        <button
          class="flex-1 min-w-[64px] px-2 py-1.5 text-[10px] font-medium bg-surface-raised hover:bg-surface-border text-slate-300 rounded-lg border border-surface-border"
          @click="copyReportMarkdown"
        >
          Copy MD
        </button>
        <button
          class="flex-1 min-w-[64px] px-2 py-1.5 text-[10px] font-medium bg-surface-raised hover:bg-surface-border text-slate-300 rounded-lg border border-surface-border"
          @click="copyReportJson"
        >
          Copy JSON
        </button>
        <button
          class="flex-1 min-w-[64px] px-2 py-1.5 text-[10px] font-medium bg-surface-raised hover:bg-surface-border text-slate-300 rounded-lg border border-surface-border"
          @click="exportPdf"
        >
          PDF
        </button>
        <button
          class="flex-1 min-w-[64px] px-2 py-1.5 text-[10px] font-medium bg-surface-raised hover:bg-surface-border text-slate-300 rounded-lg border border-surface-border"
          @click="downloadReport"
        >
          JSON
        </button>
        <button
          class="flex-1 min-w-[64px] px-2 py-1.5 text-[10px] font-medium rounded-lg border"
          :class="
            overlayActive
              ? 'bg-amber-400/20 border-amber-400/40 text-amber-300'
              : 'bg-surface-raised border-surface-border text-slate-300 hover:bg-surface-border'
          "
          @click="toggleOverlay(store.report)"
        >
          {{ overlayActive ? 'Clear overlay' : 'Overlay' }}
        </button>
        <button
          class="flex-1 min-w-[64px] px-2 py-1.5 text-[10px] font-semibold bg-accent hover:bg-accent-glow text-accent-ink rounded-lg"
          @click="analyze(false)"
        >
          Refresh
        </button>
      </div>
    </footer>

    <Toast :message="message" />
  </div>
</template>
