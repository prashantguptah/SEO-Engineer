<script setup lang="ts">
import { computed } from 'vue'
import type { AnalyzerResult } from '../../types/analyzer'
import type { BenchmarkResult } from '../../utils/benchmarks'
import SocialPreviewCards, {
  type OpenGraphPreview,
  type TwitterPreview,
} from './SocialPreviewCards.vue'

const props = defineProps<{
  section: AnalyzerResult
}>()

const data = computed(() => props.section.data as {
  titleLength: number
  descriptionLength: number
  titleBenchmark: BenchmarkResult
  descriptionBenchmark: BenchmarkResult
  canonical: string
  serpPreview?: { title: string; url: string; description: string }
  socialPreview?: {
    openGraph: OpenGraphPreview
    twitter: TwitterPreview
  }
})

function barColor(len: number, min: number, max: number) {
  if (len === 0) return 'bg-red-500'
  if (len >= min && len <= max) return 'bg-emerald-500'
  if (len < min) return 'bg-amber-500'
  return 'bg-amber-500'
}

function barWidth(len: number, max: number) {
  return `${Math.min(100, (len / (max * 1.2)) * 100)}%`
}

function truncateMarker(max: number, scaleMax: number) {
  return `${(max / (scaleMax * 1.2)) * 100}%`
}
</script>

<template>
  <div class="space-y-4">
    <!-- SERP Preview with truncation markers -->
    <div class="rounded-lg border border-surface-border bg-white p-3">
      <p class="text-[10px] uppercase text-slate-500 mb-2">SERP Preview</p>
      <p
        class="text-[#1a0dab] text-sm font-medium leading-snug"
        :class="{ 'opacity-70': data.titleLength > 60 }"
      >
        {{ data.serpPreview?.title || 'Missing title' }}
        <span v-if="data.titleLength > 60" class="text-red-500 text-[10px] ml-1">…truncated</span>
      </p>
      <p class="text-[#006621] text-xs truncate mt-0.5">
        {{ data.serpPreview?.url }}
      </p>
      <p
        class="text-[#4d5156] text-xs mt-1"
        :class="{ 'opacity-70': data.descriptionLength > 160 }"
      >
        {{ data.serpPreview?.description || 'No meta description.' }}
        <span v-if="data.descriptionLength > 160" class="text-red-500 text-[10px]">…truncated</span>
      </p>
    </div>

    <SocialPreviewCards
      v-if="data.socialPreview"
      :open-graph="data.socialPreview.openGraph"
      :twitter="data.socialPreview.twitter"
    />

    <!-- Character meters -->
    <div class="space-y-3">
      <div>
        <div class="flex justify-between text-[10px] mb-1">
          <span class="text-slate-400">Title length</span>
          <span class="text-slate-300">{{ data.titleLength }} / 30–60</span>
        </div>
        <div class="relative h-2 bg-surface-border rounded-full overflow-hidden">
          <div
            class="h-full rounded-full transition-all"
            :class="barColor(data.titleLength, 30, 60)"
            :style="{ width: barWidth(data.titleLength, 60) }"
          />
          <div
            class="absolute top-0 bottom-0 w-px bg-white/40"
            :style="{ left: truncateMarker(60, 60) }"
            title="60 char truncate"
          />
        </div>
        <p class="text-[10px] mt-1" :class="data.titleBenchmark?.status === 'optimal' ? 'text-emerald-400' : 'text-amber-400'">
          {{ data.titleBenchmark?.message }}
        </p>
      </div>

      <div>
        <div class="flex justify-between text-[10px] mb-1">
          <span class="text-slate-400">Meta description</span>
          <span class="text-slate-300">{{ data.descriptionLength }} / 120–160</span>
        </div>
        <div class="relative h-2 bg-surface-border rounded-full overflow-hidden">
          <div
            class="h-full rounded-full transition-all"
            :class="barColor(data.descriptionLength, 120, 160)"
            :style="{ width: barWidth(data.descriptionLength, 160) }"
          />
          <div
            class="absolute top-0 bottom-0 w-px bg-white/40"
            :style="{ left: truncateMarker(160, 160) }"
            title="160 char truncate"
          />
        </div>
        <p class="text-[10px] mt-1" :class="data.descriptionBenchmark?.status === 'optimal' ? 'text-emerald-400' : 'text-amber-400'">
          {{ data.descriptionBenchmark?.message }}
        </p>
      </div>
    </div>

    <div class="p-2 rounded bg-surface/50 border border-surface-border text-xs">
      <p class="text-slate-500">Canonical</p>
      <p class="text-slate-200 truncate">{{ data.canonical }}</p>
    </div>
  </div>
</template>
