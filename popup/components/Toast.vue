<script setup lang="ts">
defineProps<{
  message: string | null
}>()
</script>

<template>
  <Transition name="toast">
    <div
      v-if="message"
      class="fixed bottom-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-surface-raised border border-accent/40 text-sm text-slate-200 rounded-lg shadow-lg"
    >
      {{ message }}
    </div>
  </Transition>
</template>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.25s ease;
}
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translate(-50%, 8px);
}
</style>
