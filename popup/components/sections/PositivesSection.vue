<script setup lang="ts">
import type { PositiveNote } from '../../types/analyzer'

defineProps<{
  positives: PositiveNote[]
}>()
</script>

<template>
  <div class="space-y-2">
    <div
      v-for="p in positives"
      :key="p.id"
      class="flex items-start gap-2 text-sm p-2 rounded-lg bg-emerald-500/5 border border-emerald-500/20"
    >
      <svg class="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
      </svg>
      <div>
        <p class="text-slate-200">{{ p.message }}</p>
        <p v-if="p.context" class="text-[10px] text-emerald-400/70 mt-0.5 capitalize">{{ p.context }}</p>
      </div>
    </div>
    <p v-if="positives.length === 0" class="text-sm text-slate-500">No positive signals detected yet.</p>
  </div>
</template>
