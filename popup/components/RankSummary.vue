<script setup lang="ts">
defineProps<{
  reasons: string[]
}>()
</script>

<template>
  <div class="space-y-2">
    <div
      v-for="(reason, i) in reasons"
      :key="i"
      class="flex items-start gap-2 text-sm animate-slide-up"
      :style="{ animationDelay: `${i * 50}ms` }"
    >
      <svg class="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
      </svg>
      <span class="text-slate-300">{{ reason }}</span>
    </div>
    <p v-if="reasons.length === 0" class="text-sm text-slate-500">No strong ranking signals detected.</p>
  </div>
</template>
