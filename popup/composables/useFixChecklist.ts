import { ref } from 'vue'

const CHECKLIST_KEY = 'seo-re-fix-checklist'

export type FixStatus = 'open' | 'done' | 'dismissed'

export interface UrlChecklist {
  done: string[]
  dismissed: string[]
}

type ChecklistStore = Record<string, UrlChecklist>

const cache = ref<ChecklistStore | null>(null)

async function loadStore(): Promise<ChecklistStore> {
  if (cache.value) return cache.value
  const data = await chrome.storage.local.get(CHECKLIST_KEY)
  cache.value = (data[CHECKLIST_KEY] ?? {}) as ChecklistStore
  return cache.value
}

async function persist(store: ChecklistStore) {
  cache.value = store
  await chrome.storage.local.set({ [CHECKLIST_KEY]: store })
}

function emptyChecklist(): UrlChecklist {
  return { done: [], dismissed: [] }
}

export function useFixChecklist() {
  async function getChecklist(url: string): Promise<UrlChecklist> {
    const store = await loadStore()
    return store[url] ?? emptyChecklist()
  }

  function statusFor(checklist: UrlChecklist, issueId: string): FixStatus {
    if (checklist.done.includes(issueId)) return 'done'
    if (checklist.dismissed.includes(issueId)) return 'dismissed'
    return 'open'
  }

  async function setStatus(url: string, issueId: string, status: FixStatus): Promise<UrlChecklist> {
    const store = await loadStore()
    const current = store[url] ?? emptyChecklist()
    const done = current.done.filter((id) => id !== issueId)
    const dismissed = current.dismissed.filter((id) => id !== issueId)
    if (status === 'done') done.push(issueId)
    if (status === 'dismissed') dismissed.push(issueId)
    const next = { done, dismissed }
    store[url] = next
    await persist({ ...store })
    return next
  }

  async function clearForUrl(url: string): Promise<void> {
    const store = await loadStore()
    delete store[url]
    await persist({ ...store })
  }

  return { getChecklist, statusFor, setStatus, clearForUrl }
}
