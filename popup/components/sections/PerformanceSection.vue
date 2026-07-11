<script setup lang="ts">
import { useHighlight } from '../../composables/useHighlight'

defineProps<{
  data: {
    resourceCount: number
    transferSizeKB: number
    slowResources: number
    domContentLoadedMs: number | null
    loadEventEndMs: number | null
    htmlSizeKB: number
    scriptCount: number
    resourcesByType: Record<string, { count: number; totalSize: number; totalDuration: number }>
    webVitals?: {
      lcpMs: number | null
      lcpSelector?: string
      lcpRating: 'good' | 'needs-improvement' | 'poor' | null
      cls: number | null
      clsRating: 'good' | 'needs-improvement' | 'poor' | null
      inpMs: number | null
      inpRating: 'good' | 'needs-improvement' | 'poor' | null
      ttfbMs: number | null
      ttfbRating: 'good' | 'needs-improvement' | 'poor' | null
      note: 'lab-only'
    } | null
  }
}>()

const { highlightOnPage } = useHighlight()

function formatMs(ms: number | null) {
  if (ms === null) return '—'
  return ms < 1000 ? `${Math.round(ms)}ms` : `${(ms / 1000).toFixed(1)}s`
}

function formatKB(kb: number) {
  return kb >= 1024 ? `${(kb / 1024).toFixed(1)}MB` : `${kb}KB`
}

function ratingClass(rating: string | null | undefined) {
  if (rating === 'good') return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10'
  if (rating === 'needs-improvement') return 'text-amber-400 border-amber-500/30 bg-amber-500/10'
  if (rating === 'poor') return 'text-red-400 border-red-500/30 bg-red-500/10'
  return 'text-slate-400 border-surface-border bg-surface/50'
}

function ratingLabel(rating: string | null | undefined) {
  if (rating === 'good') return 'Good'
  if (rating === 'needs-improvement') return 'NI'
  if (rating === 'poor') return 'Poor'
  return '—'
}
</script>

<template>
  <div class="space-y-3">
    <!-- Lab CWV -->
    <div class="space-y-2">
      <div class="flex items-center justify-between gap-2">
        <p class="text-[10px] uppercase text-slate-500">Core Web Vitals (lab)</p>
        <span class="text-[9px] text-slate-500">This page load · not CrUX</span>
      </div>

      <div class="grid grid-cols-2 gap-2">
        <div
          class="p-2 rounded border text-center"
          :class="ratingClass(data.webVitals?.lcpRating)"
        >
          <p class="text-lg font-bold">{{ formatMs(data.webVitals?.lcpMs ?? null) }}</p>
          <p class="text-[10px] opacity-80">LCP</p>
          <p class="text-[9px] mt-0.5">{{ ratingLabel(data.webVitals?.lcpRating) }} · ≤2.5s</p>
          <button
            v-if="data.webVitals?.lcpSelector"
            class="text-[9px] mt-1 underline opacity-90 hover:opacity-100"
            @click="highlightOnPage(data.webVitals!.lcpSelector!)"
          >
            Show element
          </button>
        </div>
        <div
          class="p-2 rounded border text-center"
          :class="ratingClass(data.webVitals?.clsRating)"
        >
          <p class="text-lg font-bold">
            {{ data.webVitals?.cls == null ? '—' : data.webVitals.cls.toFixed(3) }}
          </p>
          <p class="text-[10px] opacity-80">CLS</p>
          <p class="text-[9px] mt-0.5">{{ ratingLabel(data.webVitals?.clsRating) }} · ≤0.1</p>
        </div>
        <div
          class="p-2 rounded border text-center"
          :class="ratingClass(data.webVitals?.inpRating)"
        >
          <p class="text-lg font-bold">{{ formatMs(data.webVitals?.inpMs ?? null) }}</p>
          <p class="text-[10px] opacity-80">INP</p>
          <p class="text-[9px] mt-0.5">
            {{
              data.webVitals?.inpMs == null
                ? 'Interact, then Refresh'
                : `${ratingLabel(data.webVitals?.inpRating)} · ≤200ms`
            }}
          </p>
        </div>
        <div
          class="p-2 rounded border text-center"
          :class="ratingClass(data.webVitals?.ttfbRating)"
        >
          <p class="text-lg font-bold">{{ formatMs(data.webVitals?.ttfbMs ?? null) }}</p>
          <p class="text-[10px] opacity-80">TTFB</p>
          <p class="text-[9px] mt-0.5">{{ ratingLabel(data.webVitals?.ttfbRating) }} · ≤800ms</p>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-2 gap-2">
      <div class="p-2 rounded bg-surface/50 border border-surface-border text-center">
        <p class="text-lg font-bold text-slate-200">{{ data.resourceCount }}</p>
        <p class="text-[10px] text-slate-500">Resources</p>
      </div>
      <div class="p-2 rounded bg-surface/50 border border-surface-border text-center">
        <p class="text-lg font-bold text-slate-200">{{ formatKB(data.transferSizeKB) }}</p>
        <p class="text-[10px] text-slate-500">Transfer size</p>
      </div>
      <div class="p-2 rounded bg-surface/50 border border-surface-border text-center">
        <p class="text-lg font-bold" :class="data.slowResources > 2 ? 'text-amber-400' : 'text-slate-200'">
          {{ data.slowResources }}
        </p>
        <p class="text-[10px] text-slate-500">Slow (&gt;1s)</p>
      </div>
      <div class="p-2 rounded bg-surface/50 border border-surface-border text-center">
        <p class="text-lg font-bold text-slate-200">{{ formatMs(data.domContentLoadedMs) }}</p>
        <p class="text-[10px] text-slate-500">DOM ready</p>
      </div>
    </div>

    <div class="text-xs space-y-1">
      <div class="flex justify-between text-slate-400">
        <span>HTML size</span><span>{{ data.htmlSizeKB }}KB</span>
      </div>
      <div class="flex justify-between text-slate-400">
        <span>Scripts</span><span>{{ data.scriptCount }}</span>
      </div>
      <div class="flex justify-between text-slate-400">
        <span>Load event</span><span>{{ formatMs(data.loadEventEndMs) }}</span>
      </div>
    </div>

    <div v-if="Object.keys(data.resourcesByType).length">
      <p class="text-[10px] text-slate-500 uppercase mb-2">By type</p>
      <div class="space-y-1">
        <div
          v-for="(info, type) in data.resourcesByType"
          :key="type"
          class="flex justify-between text-xs"
        >
          <span class="text-slate-400">{{ type }}</span>
          <span class="text-slate-300">{{ info.count }} · {{ formatKB(Math.round(info.totalSize / 1024)) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
