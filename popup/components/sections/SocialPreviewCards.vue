<script setup lang="ts">
import { ref } from 'vue'

export interface SocialMissing {
  title?: boolean
  description?: boolean
  image?: boolean
  card?: boolean
}

export interface OpenGraphPreview {
  title: string
  description: string
  image: string
  url: string
  siteName: string
  missing: SocialMissing
}

export interface TwitterPreview {
  card: string
  title: string
  description: string
  image: string
  domain: string
  missing: SocialMissing
}

defineProps<{
  openGraph: OpenGraphPreview
  twitter: TwitterPreview
}>()

const ogImageFailed = ref(false)
const twitterImageFailed = ref(false)

function missingLabels(missing: SocialMissing): string[] {
  const labels: string[] = []
  if (missing.card) labels.push('card')
  if (missing.title) labels.push('title')
  if (missing.description) labels.push('description')
  if (missing.image) labels.push('image')
  return labels
}
</script>

<template>
  <div class="space-y-3">
    <p class="text-[10px] uppercase tracking-wide text-slate-500">Social Previews</p>

    <!-- Open Graph / Facebook-style -->
    <div class="rounded-lg overflow-hidden border border-surface-border bg-white">
      <div class="px-2.5 py-1.5 border-b border-slate-200 flex items-center justify-between gap-2">
        <span class="text-[10px] font-medium text-slate-600">Open Graph</span>
        <div v-if="missingLabels(openGraph.missing).length" class="flex flex-wrap gap-1 justify-end">
          <span
            v-for="label in missingLabels(openGraph.missing)"
            :key="`og-${label}`"
            class="text-[9px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-800"
          >
            missing {{ label }}
          </span>
        </div>
      </div>

      <div
        class="bg-slate-100 aspect-[1.91/1] flex items-center justify-center overflow-hidden"
      >
        <img
          v-if="openGraph.image && !ogImageFailed"
          :src="openGraph.image"
          alt=""
          class="w-full h-full object-cover"
          @error="ogImageFailed = true"
        />
        <p v-else class="text-[11px] text-slate-400 px-3 text-center">
          {{ openGraph.missing.image ? 'No og:image' : 'Image failed to load' }}
        </p>
      </div>

      <div class="p-2.5 space-y-0.5">
        <p class="text-[10px] uppercase text-slate-500 truncate">
          {{ openGraph.siteName }}
        </p>
        <p
          class="text-[13px] font-semibold text-slate-900 leading-snug line-clamp-2"
          :class="{ 'opacity-60': openGraph.missing.title }"
        >
          {{ openGraph.title }}
        </p>
        <p
          class="text-[11px] text-slate-500 leading-snug line-clamp-2"
          :class="{ 'opacity-60': openGraph.missing.description }"
        >
          {{ openGraph.description }}
        </p>
      </div>
    </div>

    <!-- X / Twitter-style -->
    <div class="rounded-xl overflow-hidden border border-slate-700 bg-[#15202b]">
      <div class="px-2.5 py-1.5 border-b border-slate-700 flex items-center justify-between gap-2">
        <span class="text-[10px] font-medium text-slate-300">X / Twitter</span>
        <div v-if="missingLabels(twitter.missing).length" class="flex flex-wrap gap-1 justify-end">
          <span
            v-for="label in missingLabels(twitter.missing)"
            :key="`tw-${label}`"
            class="text-[9px] px-1.5 py-0.5 rounded bg-amber-900/60 text-amber-200"
          >
            missing {{ label }}
          </span>
        </div>
      </div>

      <!-- Large image card -->
      <template v-if="twitter.card !== 'summary'">
        <div class="bg-slate-800 aspect-[1.91/1] flex items-center justify-center overflow-hidden">
          <img
            v-if="twitter.image && !twitterImageFailed"
            :src="twitter.image"
            alt=""
            class="w-full h-full object-cover"
            @error="twitterImageFailed = true"
          />
          <p v-else class="text-[11px] text-slate-500 px-3 text-center">
            {{ twitter.missing.image ? 'No twitter:image / og:image' : 'Image failed to load' }}
          </p>
        </div>
        <div class="p-2.5 space-y-0.5">
          <p
            class="text-[13px] font-semibold text-white leading-snug line-clamp-2"
            :class="{ 'opacity-60': twitter.missing.title }"
          >
            {{ twitter.title }}
          </p>
          <p
            class="text-[11px] text-slate-400 leading-snug line-clamp-2"
            :class="{ 'opacity-60': twitter.missing.description }"
          >
            {{ twitter.description }}
          </p>
          <p class="text-[10px] text-slate-500 truncate pt-0.5">{{ twitter.domain }}</p>
        </div>
      </template>

      <!-- Compact summary card -->
      <div v-else class="flex gap-0 min-h-[88px]">
        <div
          class="w-[88px] flex-shrink-0 bg-slate-800 flex items-center justify-center overflow-hidden"
        >
          <img
            v-if="twitter.image && !twitterImageFailed"
            :src="twitter.image"
            alt=""
            class="w-full h-full object-cover"
            @error="twitterImageFailed = true"
          />
          <span v-else class="text-[9px] text-slate-500 px-1 text-center">No image</span>
        </div>
        <div class="flex-1 p-2.5 space-y-0.5 min-w-0">
          <p
            class="text-[12px] font-semibold text-white leading-snug line-clamp-2"
            :class="{ 'opacity-60': twitter.missing.title }"
          >
            {{ twitter.title }}
          </p>
          <p
            class="text-[10px] text-slate-400 leading-snug line-clamp-2"
            :class="{ 'opacity-60': twitter.missing.description }"
          >
            {{ twitter.description }}
          </p>
          <p class="text-[10px] text-slate-500 truncate">{{ twitter.domain }}</p>
        </div>
      </div>
    </div>
  </div>
</template>
