<script setup lang="ts">
</script>

<template>
  <div class="flex flex-col items-center justify-center h-full gap-6 animate-fade-in">
    <div class="relative">
      <div class="w-16 h-16 rounded-full border-2 border-accent/30 border-t-accent animate-spin" />
      <div class="absolute inset-0 flex items-center justify-center">
        <img src="/icon.png" alt="" class="w-8 h-8 object-contain" width="32" height="32" />
      </div>
    </div>
    <div class="text-center">
      <p class="text-lg font-semibold text-white">Analyzing with keywordwalks…</p>
      <p class="text-sm text-slate-400 mt-1">Inspecting on-page SEO signals</p>
    </div>
    <div class="w-64 space-y-3">
      <div class="h-3 rounded-full skeleton" />
      <div class="h-3 rounded-full skeleton w-4/5" />
      <div class="h-3 rounded-full skeleton w-3/5" />
    </div>
  </div>
</template>
