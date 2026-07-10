<script setup lang="ts">
import { useHighlight } from '../../composables/useHighlight'

defineProps<{
  data: {
    total: number
    internal: number
    external: number
    nofollow: number
    brokenLinks: number
    brokenLinksChecked: number
    brokenLinkDetails?: { href: string; status?: number; broken: boolean; selector: string }[]
    anchorTexts: { text: string; href: string; type: string }[]
  }
}>()

const { highlightOnPage } = useHighlight()
</script>

<template>
  <div class="space-y-3">
    <div class="grid grid-cols-4 gap-1.5">
      <div class="p-2 rounded bg-surface/50 border border-surface-border text-center">
        <p class="text-sm font-bold text-slate-200">{{ data.total }}</p>
        <p class="text-[9px] text-slate-500">Total</p>
      </div>
      <div class="p-2 rounded bg-surface/50 border border-surface-border text-center">
        <p class="text-sm font-bold text-emerald-400">{{ data.internal }}</p>
        <p class="text-[9px] text-slate-500">Internal</p>
      </div>
      <div class="p-2 rounded bg-surface/50 border border-surface-border text-center">
        <p class="text-sm font-bold text-blue-400">{{ data.external }}</p>
        <p class="text-[9px] text-slate-500">External</p>
      </div>
      <div class="p-2 rounded bg-surface/50 border border-surface-border text-center">
        <p class="text-sm font-bold" :class="data.brokenLinks ? 'text-red-400' : 'text-slate-200'">{{ data.brokenLinks }}</p>
        <p class="text-[9px] text-slate-500">Broken</p>
      </div>
    </div>

    <div class="text-xs flex justify-between text-slate-400">
      <span>Nofollow</span><span>{{ data.nofollow }}</span>
    </div>
    <div class="text-xs flex justify-between text-slate-400">
      <span>Same-origin checked</span><span>{{ data.brokenLinksChecked }}</span>
    </div>

    <div v-if="data.brokenLinkDetails?.length" class="space-y-1">
      <p class="text-[10px] text-slate-500 uppercase">Broken links</p>
      <div
        v-for="(link, i) in data.brokenLinkDetails.slice(0, 5)"
        :key="i"
        class="flex items-center gap-2 text-xs"
      >
        <span class="text-red-400 truncate flex-1">{{ link.href }}</span>
        <span v-if="link.status" class="text-slate-500">{{ link.status }}</span>
        <button
          v-if="link.selector"
          class="text-accent-glow shrink-0"
          @click="highlightOnPage(link.selector)"
        >
          Show
        </button>
      </div>
    </div>

    <div v-if="data.anchorTexts?.length">
      <p class="text-[10px] text-slate-500 uppercase mb-1">Sample anchors</p>
      <div class="space-y-1 max-h-28 overflow-y-auto">
        <div
          v-for="(a, i) in data.anchorTexts.slice(0, 8)"
          :key="i"
          class="flex gap-2 text-xs"
        >
          <span
            class="text-[9px] px-1 rounded shrink-0"
            :class="a.type === 'internal' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-blue-500/15 text-blue-400'"
          >{{ a.type }}</span>
          <span class="text-slate-300 truncate">{{ a.text }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
