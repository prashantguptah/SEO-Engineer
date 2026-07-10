import { ref, watch } from 'vue'
import {
  DEFAULT_SETTINGS,
  SETTINGS_STORAGE_KEY,
  type ExtensionSettings,
} from '../../types/settings'

const settings = ref<ExtensionSettings>({ ...DEFAULT_SETTINGS })
let loaded = false

export function useSettings() {
  async function loadSettings() {
    if (loaded) return settings.value
    try {
      const data = await chrome.storage.local.get(SETTINGS_STORAGE_KEY)
      if (data[SETTINGS_STORAGE_KEY]) {
        settings.value = { ...DEFAULT_SETTINGS, ...data[SETTINGS_STORAGE_KEY] }
      }
    } catch {
      // storage unavailable
    }
    loaded = true
    return settings.value
  }

  async function saveSettings(partial: Partial<ExtensionSettings>) {
    settings.value = { ...settings.value, ...partial }
    await chrome.storage.local.set({ [SETTINGS_STORAGE_KEY]: settings.value })
  }

  async function resetSettings() {
    settings.value = { ...DEFAULT_SETTINGS }
    await chrome.storage.local.set({ [SETTINGS_STORAGE_KEY]: settings.value })
  }

  watch(
    settings,
    async (val) => {
      if (!loaded) return
      try {
        await chrome.storage.local.set({ [SETTINGS_STORAGE_KEY]: val })
      } catch {
        // ignore
      }
    },
    { deep: true },
  )

  return { settings, loadSettings, saveSettings, resetSettings }
}
