<script setup lang="ts">
import { useHighlight } from '../../composables/useHighlight'

defineProps<{
  data: {
    total: number
    missingAlt: number
    emptyAlt: number
    lazyLoaded: number
    responsive: number
    formats: Record<string, number>
    brokenImages: number
    brokenImagesChecked: number
    brokenImageDetails?: { src: string; broken: boolean; selector: string }[]
    recommendation: string
  }
}>()

const { highlightOnPage } = useHighlight()
</script>

<template>
  <div class="space-y-3">
    <div class="grid grid-cols-3 gap-2">
      <div class="p-2 rounded bg-surface/50 border border-surface-border text-center">
        <p class="text-lg font-bold text-slate-200">{{ data.total }}</p>
        <p class="text-[10px] text-slate-500">Total</p>
      </div>
      <div class="p-2 rounded bg-surface/50 border border-surface-border text-center">
        <p class="text-lg font-bold" :class="data.missingAlt ? 'text-red-400' : 'text-emerald-400'">{{ data.missingAlt }}</p>
        <p class="text-[10px] text-slate-500">Missing ALT</p>
      </div>
      <div class="p-2 rounded bg-surface/50 border border-surface-border text-center">
        <p class="text-lg font-bold" :class="data.brokenImages ? 'text-red-400' : 'text-slate-200'">{{ data.brokenImages }}</p>
        <p class="text-[10px] text-slate-500">Broken</p>
      </div>
    </div>

    <div class="text-xs space-y-1 text-slate-400">
      <div class="flex justify-between"><span>Empty ALT</span><span>{{ data.emptyAlt }}</span></div>
      <div class="flex justify-between"><span>Lazy loaded</span><span>{{ data.lazyLoaded }}</span></div>
      <div class="flex justify-between"><span>Responsive (srcset)</span><span>{{ data.responsive }}</span></div>
      <div class="flex justify-between"><span>Checked for broken</span><span>{{ data.brokenImagesChecked }}</span></div>
    </div>

    <div v-if="Object.keys(data.formats).length">
      <p class="text-[10px] text-slate-500 uppercase mb-1">Formats</p>
      <div class="flex flex-wrap gap-1">
        <span
          v-for="(count, fmt) in data.formats"
          :key="fmt"
          class="text-[10px] px-2 py-0.5 rounded-full bg-surface border border-surface-border text-slate-300"
        >
          {{ fmt }} ×{{ count }}
        </span>
      </div>
    </div>

    <div v-if="data.brokenImageDetails?.length" class="space-y-1">
      <p class="text-[10px] text-slate-500 uppercase">Broken images</p>
      <div
        v-for="(img, i) in data.brokenImageDetails.slice(0, 5)"
        :key="i"
        class="flex items-center gap-2 text-xs"
      >
        <span class="text-red-400 truncate flex-1">{{ img.src.slice(0, 50) }}</span>
        <button
          v-if="img.selector"
          class="text-accent-glow shrink-0"
          @click="highlightOnPage(img.selector)"
        >
          Show
        </button>
      </div>
    </div>

    <p class="text-xs text-accent-glow">{{ data.recommendation }}</p>
  </div>
</template>
