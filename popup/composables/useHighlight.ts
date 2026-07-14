import { useToast } from './useToast'

export function useHighlight() {
  const { toast } = useToast()

  async function highlightOnPage(selector: string) {
    try {
      const res = await chrome.runtime.sendMessage({
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
