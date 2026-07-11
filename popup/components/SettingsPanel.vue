<script setup lang="ts">
import { useSettings } from '../composables/useSettings'
import { useToast } from '../composables/useToast'

const emit = defineEmits<{ close: []; saved: [] }>()

const { settings, saveSettings, resetSettings } = useSettings()
const { toast } = useToast()

async function save() {
  await saveSettings({ ...settings.value })
  try {
    await chrome.runtime.sendMessage({
      type: 'SYNC_SIDE_PANEL_BEHAVIOR',
      enabled: settings.value.openAsSidePanel,
    })
  } catch {
    // background may still pick this up via storage.onChanged
  }
  toast(
    settings.value.openAsSidePanel
      ? 'Saved — toolbar icon opens side panel'
      : 'Saved — toolbar icon opens popup',
  )
  emit('saved')
  emit('close')
}

async function reset() {
  await resetSettings()
  try {
    await chrome.runtime.sendMessage({
      type: 'SYNC_SIDE_PANEL_BEHAVIOR',
      enabled: settings.value.openAsSidePanel,
    })
  } catch {
    // ignore
  }
  toast('Settings reset')
}
</script>

<template>
  <div class="space-y-4 animate-fade-in">
    <div class="flex items-center justify-between">
      <h2 class="text-sm font-semibold text-white">Settings</h2>
      <button class="text-slate-400 hover:text-white text-xs" @click="emit('close')">Close</button>
    </div>

    <label class="flex items-center justify-between gap-3 text-xs">
      <span class="text-slate-300">Check broken links</span>
      <input v-model="settings.checkBrokenLinks" type="checkbox" class="accent-accent" />
    </label>

    <label class="block text-xs space-y-1">
      <span class="text-slate-300">SPA hydration wait (ms)</span>
      <input
        v-model.number="settings.hydrationWaitMs"
        type="number"
        min="500"
        max="8000"
        step="100"
        class="w-full px-3 py-1.5 bg-surface-raised border border-surface-border rounded-lg text-slate-200"
      />
    </label>

    <label class="block text-xs space-y-1">
      <span class="text-slate-300">Analysis budget (ms)</span>
      <input
        v-model.number="settings.analysisBudgetMs"
        type="number"
        min="2000"
        max="15000"
        step="500"
        class="w-full px-3 py-1.5 bg-surface-raised border border-surface-border rounded-lg text-slate-200"
      />
    </label>

    <label class="block text-xs space-y-1">
      <span class="text-slate-300">Custom target keyword</span>
      <input
        v-model="settings.targetKeyword"
        type="text"
        placeholder="e.g. seo tools"
        class="w-full px-3 py-1.5 bg-surface-raised border border-surface-border rounded-lg text-slate-200 placeholder-slate-500"
      />
      <span class="text-[10px] text-slate-500">Overrides auto-detected primary keyword for placement checks</span>
    </label>

    <label class="block text-xs space-y-1">
      <span class="text-slate-300">Secondary keywords</span>
      <input
        v-model="settings.secondaryKeywords"
        type="text"
        placeholder="e.g. on-page seo, meta tags"
        class="w-full px-3 py-1.5 bg-surface-raised border border-surface-border rounded-lg text-slate-200 placeholder-slate-500"
      />
      <span class="text-[10px] text-slate-500">Comma-separated (up to 3 used in the placement matrix)</span>
    </label>

    <label class="flex items-center justify-between gap-3 text-xs">
      <div>
        <span class="text-slate-300 block">Open as side panel</span>
        <span class="text-[10px] text-slate-500">
          When on, clicking the extension icon opens the side panel (full height) instead of the popup
        </span>
      </div>
      <input v-model="settings.openAsSidePanel" type="checkbox" class="accent-accent" />
    </label>

    <label class="flex items-center justify-between gap-3 text-xs">
      <div>
        <span class="text-slate-300 block">Auto-analyze on open</span>
        <span class="text-[10px] text-slate-500">
          Also available in the sidebar above History. When off, use Refresh / Analyze.
        </span>
      </div>
      <input v-model="settings.autoAnalyzeOnOpen" type="checkbox" class="accent-accent" />
    </label>

    <div class="flex gap-2 pt-2">
      <button
        class="flex-1 px-3 py-2 text-xs bg-accent hover:bg-accent-glow text-white rounded-lg"
        @click="save"
      >
        Save
      </button>
      <button
        class="px-3 py-2 text-xs bg-surface-raised border border-surface-border text-slate-300 rounded-lg"
        @click="reset"
      >
        Reset
      </button>
    </div>
  </div>
</template>
