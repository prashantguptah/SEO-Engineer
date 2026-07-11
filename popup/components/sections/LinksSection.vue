<script setup lang="ts">
import { computed, ref } from 'vue'
import { useHighlight } from '../../composables/useHighlight'
import type { InternalLinkRow } from '../../../analyzers/links'

const props = defineProps<{
  data: {
    total: number
    internal: number
    external: number
    nofollow: number
    brokenLinks: number
    brokenLinksChecked: number
    brokenLinkDetails?: { href: string; status?: number; broken: boolean; selector: string }[]
    anchorTexts: { text: string; href: string; type: string }[]
    internalTable?: InternalLinkRow[]
    uniqueInternalDestinations?: number
    linkedOnceCount?: number
    weakAnchorDestinations?: number
  }
}>()

const { highlightOnPage } = useHighlight()
const filter = ref<'all' | 'weak' | 'once'>('all')

const rows = computed(() => {
  const table = props.data.internalTable ?? []
  if (filter.value === 'weak') {
    return table.filter((r) => r.weakAnchors > 0 || r.emptyAnchors > 0)
  }
  if (filter.value === 'once') {
    return table.filter((r) => r.count === 1)
  }
  return table
})
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

    <div class="grid grid-cols-3 gap-1.5 text-center text-[10px]">
      <div class="p-1.5 rounded border border-surface-border text-slate-400">
        <span class="text-slate-200 font-semibold">{{ data.uniqueInternalDestinations ?? 0 }}</span> destinations
      </div>
      <div class="p-1.5 rounded border border-surface-border text-slate-400">
        <span class="text-amber-400 font-semibold">{{ data.linkedOnceCount ?? 0 }}</span> linked once
      </div>
      <div class="p-1.5 rounded border border-surface-border text-slate-400">
        <span class="text-amber-400 font-semibold">{{ data.weakAnchorDestinations ?? 0 }}</span> weak anchors
      </div>
    </div>

    <div class="text-xs flex justify-between text-slate-400">
      <span>Nofollow</span><span>{{ data.nofollow }}</span>
    </div>
    <div class="text-xs flex justify-between text-slate-400">
      <span>Same-origin checked</span><span>{{ data.brokenLinksChecked }}</span>
    </div>

    <!-- Internal link table -->
    <div v-if="data.internalTable?.length" class="space-y-2">
      <div class="flex items-center justify-between gap-2">
        <p class="text-[10px] text-slate-500 uppercase">Internal link map</p>
        <div class="flex gap-1">
          <button
            v-for="f in (['all', 'once', 'weak'] as const)"
            :key="f"
            class="text-[9px] px-1.5 py-0.5 rounded border"
            :class="
              filter === f
                ? 'border-accent/40 bg-accent/15 text-accent-glow'
                : 'border-surface-border text-slate-500'
            "
            @click="filter = f"
          >
            {{ f === 'all' ? 'All' : f === 'once' ? 'Once' : 'Weak' }}
          </button>
        </div>
      </div>

      <div class="overflow-x-auto rounded-lg border border-surface-border max-h-52 overflow-y-auto">
        <table class="w-full text-[10px]">
          <thead class="sticky top-0 bg-[#12151c]">
            <tr class="text-slate-500 border-b border-surface-border">
              <th class="text-left font-medium px-2 py-1.5">Path</th>
              <th class="text-center font-medium px-1 py-1.5">Depth</th>
              <th class="text-center font-medium px-1 py-1.5">×</th>
              <th class="text-left font-medium px-2 py-1.5">Anchors</th>
              <th class="px-1 py-1.5" />
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(row, i) in rows"
              :key="i"
              class="border-b border-surface-border/40 last:border-0 align-top"
            >
              <td class="px-2 py-1.5 text-slate-300 font-mono max-w-[140px] truncate" :title="row.href">
                {{ row.path }}
                <span v-if="row.nofollow" class="text-amber-500 ml-0.5">nf</span>
              </td>
              <td class="text-center px-1 py-1.5 text-slate-500">{{ row.depth }}</td>
              <td class="text-center px-1 py-1.5 text-slate-200 font-semibold">{{ row.count }}</td>
              <td class="px-2 py-1.5 text-slate-400">
                <span v-if="row.anchors.length">{{ row.anchors.join(' · ') }}</span>
                <span v-else class="text-red-400/80">empty</span>
                <span v-if="row.weakAnchors" class="text-amber-400 ml-1">(weak)</span>
              </td>
              <td class="px-1 py-1.5">
                <button
                  v-if="row.selector"
                  class="text-accent-glow"
                  @click="highlightOnPage(row.selector!)"
                >
                  Show
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p v-if="rows.length === 0" class="text-[10px] text-slate-500">No links in this filter.</p>
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
  </div>
</template>
