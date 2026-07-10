<script setup lang="ts">
defineProps<{
  data: {
    jsonLdCount: number
    microdataCount: number
    schemaTypes: string[]
    allTypes: string[]
    detected: Record<string, boolean | string[]>
  }
}>()

const flags = [
  { key: 'article', label: 'Article' },
  { key: 'faq', label: 'FAQ' },
  { key: 'organization', label: 'Organization' },
  { key: 'breadcrumb', label: 'Breadcrumb' },
  { key: 'product', label: 'Product' },
  { key: 'review', label: 'Review' },
  { key: 'recipe', label: 'Recipe' },
  { key: 'person', label: 'Person' },
  { key: 'video', label: 'Video' },
  { key: 'howTo', label: 'HowTo' },
  { key: 'localBusiness', label: 'LocalBusiness' },
]
</script>

<template>
  <div class="space-y-3">
    <div class="grid grid-cols-2 gap-2">
      <div class="p-2 rounded bg-surface/50 border border-surface-border text-center">
        <p class="text-lg font-bold" :class="data.jsonLdCount ? 'text-emerald-400' : 'text-slate-500'">{{ data.jsonLdCount }}</p>
        <p class="text-[10px] text-slate-500">JSON-LD</p>
      </div>
      <div class="p-2 rounded bg-surface/50 border border-surface-border text-center">
        <p class="text-lg font-bold" :class="data.microdataCount ? 'text-emerald-400' : 'text-slate-500'">{{ data.microdataCount }}</p>
        <p class="text-[10px] text-slate-500">Microdata</p>
      </div>
    </div>

    <div class="flex flex-wrap gap-1.5">
      <span
        v-for="flag in flags"
        :key="flag.key"
        class="text-[10px] px-2 py-0.5 rounded-full border"
        :class="data.detected[flag.key]
          ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
          : 'bg-surface border-surface-border text-slate-600'"
      >
        {{ flag.label }}
      </span>
    </div>

    <div v-if="data.schemaTypes?.length || data.allTypes?.length">
      <p class="text-[10px] text-slate-500 uppercase mb-1">Detected types</p>
      <div class="flex flex-wrap gap-1">
        <span
          v-for="t in (data.schemaTypes?.length ? data.schemaTypes : data.allTypes)"
          :key="t"
          class="text-[10px] px-2 py-0.5 rounded bg-accent/10 text-accent-glow border border-accent/20"
        >
          {{ t }}
        </span>
      </div>
    </div>
    <p v-else class="text-xs text-slate-500">No structured data types detected.</p>
  </div>
</template>
