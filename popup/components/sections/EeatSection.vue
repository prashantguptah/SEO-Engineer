<script setup lang="ts">
defineProps<{
  data: {
    author: string
    publishedDate: string
    updatedDate: string
    authorBio: boolean
    contactPage: boolean
    privacyPolicy: boolean
    terms: boolean
    aboutPage: boolean
  }
}>()

function signalClass(ok: boolean) {
  return ok
    ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
    : 'bg-surface border-surface-border text-slate-600'
}
</script>

<template>
  <div class="space-y-3">
    <div class="space-y-2 text-xs">
      <div class="p-2 rounded bg-surface/50 border border-surface-border">
        <p class="text-slate-500">Author</p>
        <p class="text-slate-200">{{ data.author }}</p>
      </div>
      <div class="grid grid-cols-2 gap-2">
        <div class="p-2 rounded bg-surface/50 border border-surface-border">
          <p class="text-slate-500">Published</p>
          <p class="text-slate-200 truncate">{{ data.publishedDate }}</p>
        </div>
        <div class="p-2 rounded bg-surface/50 border border-surface-border">
          <p class="text-slate-500">Updated</p>
          <p class="text-slate-200 truncate">{{ data.updatedDate }}</p>
        </div>
      </div>
    </div>

    <div class="flex flex-wrap gap-1.5">
      <span class="text-[10px] px-2 py-0.5 rounded-full border" :class="signalClass(data.authorBio)">Author bio</span>
      <span class="text-[10px] px-2 py-0.5 rounded-full border" :class="signalClass(data.aboutPage)">About</span>
      <span class="text-[10px] px-2 py-0.5 rounded-full border" :class="signalClass(data.contactPage)">Contact</span>
      <span class="text-[10px] px-2 py-0.5 rounded-full border" :class="signalClass(data.privacyPolicy)">Privacy</span>
      <span class="text-[10px] px-2 py-0.5 rounded-full border" :class="signalClass(data.terms)">Terms</span>
    </div>
  </div>
</template>
