<script setup lang="ts">
</script>

<template>
  <div class="flex flex-col items-center justify-center h-full gap-6 animate-fade-in">
    <div class="relative">
      <div class="w-16 h-16 rounded-full border-2 border-accent/30 border-t-accent animate-spin" />
      <div class="absolute inset-0 flex items-center justify-center">
        <svg class="w-6 h-6 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
    </div>
    <div class="text-center">
      <p class="text-lg font-semibold text-white">Analyzing Website...</p>
      <p class="text-sm text-slate-400 mt-1">Inspecting on-page SEO signals</p>
    </div>
    <div class="w-64 space-y-3">
      <div class="h-3 rounded-full skeleton" />
      <div class="h-3 rounded-full skeleton w-4/5" />
      <div class="h-3 rounded-full skeleton w-3/5" />
    </div>
  </div>
</template>
