<script setup lang="ts">
import { useReportStore, type TabId, type NavTab } from '../stores/report'
import { useSettings } from '../composables/useSettings'
import { useToast } from '../composables/useToast'

defineProps<{
  tabs: NavTab[]
  toolTabs?: NavTab[]
}>()

const store = useReportStore()
const { settings, saveSettings } = useSettings()
const { toast } = useToast()

function select(id: TabId) {
  store.setActiveTab(id)
}

async function toggleAutoAnalyze() {
  const next = !settings.value.autoAnalyzeOnOpen
  await saveSettings({ autoAnalyzeOnOpen: next })
  toast(next ? 'Auto-analyze on' : 'Auto-analyze off — use Refresh')
}
</script>

<template>
  <nav class="flex flex-col h-full w-[172px] shrink-0 border-r border-surface-border bg-black">
    <!-- App branding — only place it appears -->
    <div class="px-2.5 py-3 border-b border-surface-border">
      <img
        src="/keywordwalks.png"
        alt="keywordwalks"
        class="w-full h-auto max-h-11 object-contain object-left"
        width="156"
        height="44"
      />
    </div>

    <div class="flex-1 overflow-y-auto py-2">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        class="w-full flex items-center justify-between gap-2 px-3 py-2 text-left text-xs transition-colors"
        :class="
          store.activeTab === tab.id
            ? 'bg-accent/10 text-accent-glow border-r-2 border-accent'
            : 'text-slate-400 hover:text-slate-200 hover:bg-surface-raised/50'
        "
        @click="select(tab.id)"
      >
        <span class="truncate">{{ tab.label }}</span>
        <span
          v-if="store.tabBadges[tab.id]"
          class="shrink-0 min-w-[18px] h-[18px] px-1 rounded-full bg-amber-400 text-[#1a1a1a] text-[10px] font-bold flex items-center justify-center"
        >
          {{ store.tabBadges[tab.id] }}
        </span>
      </button>
    </div>

    <div class="border-t border-surface-border py-2">
      <!-- Always visible above History -->
      <button
        type="button"
        class="w-full flex items-center justify-between gap-2 px-3 py-2 text-left text-xs transition-colors"
        :class="
          settings.autoAnalyzeOnOpen
            ? 'text-accent-glow hover:bg-surface-raised/50'
            : 'text-slate-400 hover:text-slate-200 hover:bg-surface-raised/50'
        "
        :title="
          settings.autoAnalyzeOnOpen
            ? 'Auto-analyze is on — click to turn off'
            : 'Auto-analyze is off — click to turn on'
        "
        @click="toggleAutoAnalyze"
      >
        <span class="truncate">Auto-analyze</span>
        <span
          class="shrink-0 text-[9px] font-semibold uppercase px-1.5 py-0.5 rounded border"
          :class="
            settings.autoAnalyzeOnOpen
              ? 'border-accent/40 bg-accent/15 text-accent-glow'
              : 'border-surface-border text-slate-500'
          "
        >
          {{ settings.autoAnalyzeOnOpen ? 'On' : 'Off' }}
        </span>
      </button>

      <button
        v-for="tab in toolTabs"
        :key="tab.id"
        class="w-full flex items-center justify-between gap-2 px-3 py-2 text-left text-xs transition-colors"
        :class="
          store.activeTab === tab.id
            ? 'bg-accent/10 text-accent-glow border-r-2 border-accent'
            : 'text-slate-400 hover:text-slate-200 hover:bg-surface-raised/50'
        "
        @click="select(tab.id)"
      >
        <span class="truncate">{{ tab.label }}</span>
      </button>
    </div>
  </nav>
</template>
