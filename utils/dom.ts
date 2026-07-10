/**
 * Deep DOM queries including open shadow roots.
 */
export function queryAllDeep<T extends Element>(
  root: Document | Element | ShadowRoot,
  selector: string,
): T[] {
  const results: T[] = []
  const seen = new WeakSet<Element>()

  function walk(node: Document | Element | ShadowRoot): void {
    try {
      node.querySelectorAll(selector).forEach((el) => {
        if (!seen.has(el)) {
          seen.add(el)
          results.push(el as T)
        }
      })
    } catch {
      // ignore invalid selector contexts
    }

    const elements: Element[] =
      node instanceof Document
        ? node.documentElement
          ? [node.documentElement]
          : []
        : node instanceof ShadowRoot
          ? [...node.children]
          : [...node.children]

    for (const el of elements) {
      if (el.shadowRoot) walk(el.shadowRoot)
      walk(el)
    }
  }

  walk(root)
  return results
}

/**
 * Build a CSS selector for highlighting an element on the page.
 */
export function getSelector(el: Element): string {
  if (el.id) return `#${CSS.escape(el.id)}`

  const path: string[] = []
  let current: Element | null = el

  while (current && current.nodeType === Node.ELEMENT_NODE) {
    let part = current.tagName.toLowerCase()
    const parent = current.parentElement

    if (parent) {
      const siblings = [...parent.children].filter((c) => c.tagName === current!.tagName)
      if (siblings.length > 1) {
        const index = siblings.indexOf(current) + 1
        part += `:nth-of-type(${index})`
      }
    }

    path.unshift(part)
    if (current.id) break
    current = parent
    if (path.length > 6) break
  }

  return path.join(' > ')
}

/**
 * Wait for SPA hydration / DOM stability before parsing.
 */
export function waitForStableDom(
  doc: Document,
  _win: Window,
  maxMs = 2500,
): Promise<void> {
  return new Promise((resolve) => {
    const start = performance.now()
    let lastSignature = ''
    let stableCount = 0
    let resolved = false

    const finish = () => {
      if (resolved) return
      resolved = true
      observer.disconnect()
      resolve()
    }

    const getSignature = () => {
      const h1Count = queryAllDeep(doc, 'h1').length
      const bodyLen = doc.body?.innerText?.length ?? 0
      return `${doc.title}|${bodyLen}|${h1Count}`
    }

    const check = () => {
      const sig = getSignature()
      if (sig === lastSignature) stableCount++
      else {
        stableCount = 0
        lastSignature = sig
      }

      const hasSpaRoot = !!doc.querySelector(
        '#__next, #__nuxt, #app, #root, [data-reactroot], [data-nuxt]',
      )
      const hasContent = (doc.body?.innerText?.length ?? 0) > 80
      const spaReady = hasSpaRoot && hasContent

      if (stableCount >= 2 || spaReady || performance.now() - start > maxMs) {
        finish()
      }
    }

    const observer = new MutationObserver(check)
    observer.observe(doc.documentElement, {
      childList: true,
      subtree: true,
      characterData: true,
    })

    check()
    setTimeout(finish, maxMs)
  })
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Race a promise against a timeout; returns null on timeout.
 */
export async function withTimeout<T>(
  promise: Promise<T>,
  ms: number,
  label: string,
): Promise<{ result: T | null; timedOut: boolean; label: string }> {
  let timedOut = false
  const result = await Promise.race([
    promise,
    sleep(ms).then(() => {
      timedOut = true
      return null as T
    }),
  ])
  return { result: timedOut ? null : result, timedOut, label }
}
