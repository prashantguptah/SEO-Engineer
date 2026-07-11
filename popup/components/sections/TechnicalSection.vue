<script setup lang="ts">
import { computed } from 'vue'
import type { AnalyzerResult } from '../../types/analyzer'

const props = defineProps<{
  section: AnalyzerResult
}>()

const data = computed(() => props.section.data as {
  https: boolean
  canonical: string
  robots: string
  noindex: boolean
  viewport: string
  indexable: boolean
  robotsTxt: {
    fetched: boolean
    status?: number
    sitemaps: string[]
    disallowsCurrentPath: boolean
    matchingDisallows: string[]
    error?: string
  } | null
  sitemap: {
    fetched: boolean
    sourceUrl?: string
    urlCount?: number
    includesCurrentUrl?: boolean
    truncated?: boolean
    sampleUrls?: string[]
    error?: string
  } | null
})

function flagClass(ok: boolean) {
  return ok ? 'text-emerald-400' : 'text-amber-400'
}
</script>

<template>
  <div class="space-y-4">
    <div class="grid grid-cols-2 gap-2 text-xs">
      <div class="p-2 rounded bg-surface/50 border border-surface-border">
        <p class="text-slate-500">HTTPS</p>
        <p :class="flagClass(data.https)">{{ data.https ? 'Yes' : 'No' }}</p>
      </div>
      <div class="p-2 rounded bg-surface/50 border border-surface-border">
        <p class="text-slate-500">Indexable</p>
        <p :class="flagClass(data.indexable && !data.robotsTxt?.disallowsCurrentPath)">
          {{ data.indexable && !data.robotsTxt?.disallowsCurrentPath ? 'Likely' : 'Blocked' }}
        </p>
      </div>
      <div class="p-2 rounded bg-surface/50 border border-surface-border col-span-2">
        <p class="text-slate-500">Canonical</p>
        <p class="text-slate-200 truncate">{{ data.canonical }}</p>
      </div>
      <div class="p-2 rounded bg-surface/50 border border-surface-border">
        <p class="text-slate-500">Meta robots</p>
        <p class="text-slate-200 truncate">{{ data.robots }}</p>
      </div>
      <div class="p-2 rounded bg-surface/50 border border-surface-border">
        <p class="text-slate-500">Viewport</p>
        <p class="text-slate-200 truncate">{{ data.viewport }}</p>
      </div>
    </div>

    <!-- robots.txt -->
    <div class="rounded-lg border border-surface-border p-3 space-y-2">
      <p class="text-[10px] uppercase text-slate-500">robots.txt</p>
      <template v-if="data.robotsTxt?.fetched">
        <p class="text-xs text-emerald-400">Fetched (HTTP {{ data.robotsTxt.status ?? 200 }})</p>
        <p class="text-xs text-slate-300">
          Path allowed:
          <span :class="flagClass(!data.robotsTxt.disallowsCurrentPath)">
            {{ data.robotsTxt.disallowsCurrentPath ? 'No' : 'Yes' }}
          </span>
        </p>
        <p
          v-if="data.robotsTxt.matchingDisallows?.length"
          class="text-[10px] text-amber-400"
        >
          Matching Disallow: {{ data.robotsTxt.matchingDisallows.join(', ') }}
        </p>
        <div v-if="data.robotsTxt.sitemaps?.length">
          <p class="text-[10px] text-slate-500 mb-1">Sitemaps listed</p>
          <p
            v-for="(sm, i) in data.robotsTxt.sitemaps.slice(0, 5)"
            :key="i"
            class="text-[10px] text-slate-300 truncate font-mono"
          >
            {{ sm }}
          </p>
        </div>
        <p v-else class="text-[10px] text-slate-500">No Sitemap: directives in robots.txt</p>
      </template>
      <p v-else class="text-xs text-amber-400">
        {{ data.robotsTxt?.error || 'Not fetched' }}
      </p>
    </div>

    <!-- sitemap -->
    <div class="rounded-lg border border-surface-border p-3 space-y-2">
      <p class="text-[10px] uppercase text-slate-500">Sitemap peek</p>
      <template v-if="data.sitemap?.fetched">
        <p class="text-xs text-emerald-400">
          Fetched {{ data.sitemap.urlCount ?? 0 }} URL{{ (data.sitemap.urlCount ?? 0) === 1 ? '' : 's'
          }}{{ data.sitemap.truncated ? ' (sampled)' : '' }}
        </p>
        <p class="text-[10px] text-slate-500 truncate font-mono">{{ data.sitemap.sourceUrl }}</p>
        <p class="text-xs text-slate-300">
          Current URL in sample:
          <span :class="flagClass(!!data.sitemap.includesCurrentUrl)">
            {{ data.sitemap.includesCurrentUrl ? 'Yes' : 'No / not in sample' }}
          </span>
        </p>
        <div v-if="data.sitemap.sampleUrls?.length" class="space-y-0.5">
          <p class="text-[10px] text-slate-500">Sample URLs</p>
          <p
            v-for="(u, i) in data.sitemap.sampleUrls"
            :key="i"
            class="text-[10px] text-slate-400 truncate font-mono"
          >
            {{ u }}
          </p>
        </div>
      </template>
      <p v-else class="text-xs text-amber-400">
        {{ data.sitemap?.error || 'Not fetched' }}
      </p>
    </div>
  </div>
</template>
