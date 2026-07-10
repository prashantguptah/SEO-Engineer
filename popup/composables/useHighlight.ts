import { useToast } from './useToast'

export function useHighlight() {
  const { toast } = useToast()

  async function highlightOnPage(selector: string) {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
      if (!tab?.id) {
        toast('No active tab')
        return
      }
      const res = await chrome.tabs.sendMessage(tab.id, {
        type: 'HIGHLIGHT_ELEMENT',
        selector,
      })
      if (res?.ok) toast('Highlighted on page')
      else toast(res?.error ?? 'Could not highlight element')
    } catch {
      toast('Could not reach page — try refreshing')
    }
  }

  return { highlightOnPage }
}
