<script setup lang="ts">
defineProps<{
  data: Record<string, unknown>
}>()

function formatValue(value: unknown): string {
  if (value === null || value === undefined) return '—'
  if (typeof value === 'boolean') return value ? 'Yes' : 'No'
  if (typeof value === 'object') return JSON.stringify(value, null, 2)
  return String(value)
}

function isComplex(value: unknown): boolean {
  return typeof value === 'object' && value !== null
}
</script>

<template>
  <div class="space-y-2">
    <div
      v-for="(value, key) in data"
      :key="String(key)"
      class="flex flex-col gap-0.5 py-1.5 border-b border-surface-border/50 last:border-0"
    >
      <span class="text-xs text-slate-500 capitalize">{{ String(key).replace(/([A-Z])/g, ' $1') }}</span>
      <pre
        v-if="isComplex(value)"
        class="text-xs text-slate-300 whitespace-pre-wrap break-words font-mono bg-surface/50 rounded p-2 max-h-32 overflow-y-auto"
      >{{ formatValue(value) }}</pre>
      <span v-else class="text-sm text-slate-200 break-words">{{ formatValue(value) }}</span>
    </div>
  </div>
</template>
