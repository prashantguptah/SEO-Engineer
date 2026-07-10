<script setup lang="ts">
import { useReportStore, type TabId, type NavTab } from '../stores/report'

defineProps<{
  tabs: NavTab[]
  toolTabs?: NavTab[]
}>()

const store = useReportStore()

function select(id: TabId) {
  store.setActiveTab(id)
}
</script>

<template>
  <nav class="flex flex-col h-full w-[156px] shrink-0 border-r border-surface-border bg-[#0c0e14]">
    <!-- App branding — only place it appears -->
    <div class="px-3 py-3 border-b border-surface-border">
      <div class="flex items-center gap-2">
        <div class="w-7 h-7 rounded-lg bg-accent/20 flex items-center justify-center shrink-0">
          <svg class="w-3.5 h-3.5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <div class="min-w-0 leading-tight">
          <p class="text-[11px] font-semibold text-white truncate">SEO Reverse</p>
          <p class="text-[9px] text-accent-glow truncate">Engineer</p>
        </div>
      </div>
    </div>

    <div class="flex-1 overflow-y-auto py-2">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        class="w-full flex items-center justify-between gap-2 px-3 py-2 text-left text-xs transition-colors"
        :class="
          store.activeTab === tab.id
            ? 'bg-surface-raised text-white'
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

    <div v-if="toolTabs?.length" class="border-t border-surface-border py-2">
      <button
        v-for="tab in toolTabs"
        :key="tab.id"
        class="w-full flex items-center justify-between gap-2 px-3 py-2 text-left text-xs transition-colors"
        :class="
          store.activeTab === tab.id
            ? 'bg-surface-raised text-white'
            : 'text-slate-400 hover:text-slate-200 hover:bg-surface-raised/50'
        "
        @click="select(tab.id)"
      >
        <span class="truncate">{{ tab.label }}</span>
      </button>
    </div>
  </nav>
</template>
