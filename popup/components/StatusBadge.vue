<script setup lang="ts">
defineProps<{
  status: 'good' | 'warning' | 'error' | 'info'
  label?: string
}>()

const colors = {
  good: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  warning: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  error: 'bg-red-500/15 text-red-400 border-red-500/30',
  info: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
}
</script>

<template>
  <span
    class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border"
    :class="colors[status]"
  >
    {{ label || status }}
  </span>
</template>
