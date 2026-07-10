<script setup lang="ts">
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
  }
}>()

function formatMs(ms: number | null) {
  if (ms === null) return '—'
  return ms < 1000 ? `${Math.round(ms)}ms` : `${(ms / 1000).toFixed(1)}s`
}

function formatKB(kb: number) {
  return kb >= 1024 ? `${(kb / 1024).toFixed(1)}MB` : `${kb}KB`
}
</script>

<template>
  <div class="space-y-3">
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
