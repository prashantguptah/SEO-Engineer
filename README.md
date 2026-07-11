# SEO Reverse Engineer

A Chrome Extension that analyzes the currently opened webpage and explains **why the page is likely ranking well** in search engines. Everything runs client-side — no backend, no APIs, no authentication.

**Version:** 1.1.0

## Features

### Analysis (16 analyzers)

| Analyzer | What it checks |
|----------|----------------|
| Basic | HTTPS, canonical, language, viewport |
| Title & Meta | Title/description length, Open Graph, Twitter Card, SERP + social previews |
| Headings | H1 presence/duplicates, hierarchy skips |
| Content | Word count, thin content, Flesch readability |
| Keywords | Top terms, n-grams, stuffing, **primary + secondary placement matrix** |
| Images | Missing/empty alt, broken images, lazy-load |
| Links | Internal/external counts, empty/weak anchors, broken links, **internal link map table** |
| Schema | JSON-LD / microdata (Article, FAQ, Product, etc.) |
| Technical | noindex, duplicate title/meta, canonical & robots, **robots.txt + sitemap peek** |
| Hreflang | Alternate language annotations, x-default, invalid/duplicate codes |
| Performance | Script count, HTML size, slow resources, transfer size, DCL/load, **lab CWV (LCP/CLS/INP/TTFB)** |
| Accessibility | Alt text, empty links, heading order |
| Mobile | Viewport, small fonts, small touch targets |
| Technology | CMS/frameworks/analytics (WordPress, Shopify, Next.js, React, GTM, …) |
| E-E-A-T | Author, publish date, About page signals |
| UX | Breadcrumbs, table of contents, ad density |

### Scoring & insights

- Overall score **0–100** plus sub-scores: content, technical, performance, accessibility
- **Page-type detection**: blog, product, homepage, utility, unknown
- **Page-type weighted scoring** and severity tuning (e.g. thin content is less harsh on homepages)
- **"Why This Page Ranks"** rank reasons + **"What's Working Well"** positives
- Prioritized recommendations with high / medium / low severity
- Title & meta **length benchmarks**
- Optional **custom target keyword** for placement checks

### Enrichment (on-page collection)

- Single-pass DOM parse into a shared `PageContext`
- **Shadow DOM** traversal
- Configurable **SPA hydration wait** before parsing
- Resource timing via the Performance API
- **Lab Core Web Vitals** (LCP, CLS, INP, TTFB) via PerformanceObserver — this page load only, not CrUX
- Broken image checks (capped + timed)
- Optional broken link checks (capped + timed; subject to CORS)
- **robots.txt + sitemap** same-origin fetch (Disallow check, sitemap URL sample)
- Overall **analysis budget** with soft timeouts (skipped checks are reported in the UI)
- Mobile element sampling (fonts / touch targets)

### UI

- Dark SaaS-style interface
- **Popup** (640×650) or Chrome **side panel** (toggle in settings)
- Tabbed report: Overview … Fixes, **History**, **Compare**, Settings
- Issue **badge counts** per tab + tab filter search
- Score card with category breakdown and **score history sparkline**
- **Re-audit diff** on Overview (fixed / new / still-open vs previous run)
- **Compare mode** — current report vs a saved History audit (scores, sections, issues)
- Rich section views (SERP preview, social cards, **keyword placement matrix**, robots/sitemap, hreflang, …)
- **Copy-ready HTML snippets** on Fixes for common issues
- **Fix checklist** — mark done / dismiss / reopen per URL (persisted)
- **On-page overlay** — badge markers for issues/headings on the live page (footer toggle)
- **Highlight on page** for issues and headings (scroll + temporary outline)
- **Context menu**: right-click a page → “Analyze with SEO Reverse Engineer”
- **Keyboard shortcut**: `Alt+Shift+S` opens the side panel and analyzes the page (change under `chrome://extensions/shortcuts`)
- Toast notifications, loading / refresh states
- Favicon, page title/URL, and detected page type in the header

### Export & persistence

- Copy report as **Markdown** or **JSON**
- Download **JSON** file
- Export **PDF** (branded print report: executive summary, score bars, top fixes)
- Report **cache** in Chrome storage (~1 hour)
- **Audit history library** (last 20 full reports) — open, filter, delete
- Score history (up to 100 points) for per-URL sparklines
- Settings persisted in `chrome.storage.local`

### Settings

- Check broken links on/off
- SPA hydration wait (ms)
- Analysis budget (ms)
- Custom target keyword
- **Secondary keywords** (comma-separated; placement matrix)
- Open as side panel on/off
- **Auto-analyze on open** (sidebar toggle above History, also in Settings)
- Save / reset (re-analyzes after save)

## Tech Stack

- Vue 3 + TypeScript + Pinia + VueUse
- Tailwind CSS
- WXT (Chrome Extension MV3)
- Vitest + happy-dom
- Client-side DOM analysis only

## Setup

```bash
npm install
```

## Development

```bash
npm run dev
```

WXT auto-reloads the extension when you change code. Re-open the popup or side panel to see updates.

## Test

```bash
npm test
```

## Build for Production

```bash
npm run build
```

Output is in the `dist/chrome-mv3/` folder.

## Load as Unpacked Extension (Manual Testing)

1. Run `npm run build`
2. Open Chrome and go to `chrome://extensions`
3. Enable **Developer mode** (top right)
4. Click **Load unpacked**
5. Select the `dist/chrome-mv3` folder inside this project
6. Navigate to any website (e.g. `https://example.com`)
7. Click the **SEO Reverse Engineer** extension icon in the toolbar
8. The popup or side panel analyzes the page and shows the report (typically 1–3 seconds)

## How to Test

### Basic smoke test

1. Load the extension (steps above)
2. Open `https://developer.mozilla.org` or any article page
3. Click the extension icon
4. Verify:
   - Loading screen appears briefly
   - SEO score and sub-scores display
   - "Why This Page Ranks" and positives appear
   - Tabs render with section content
   - Fixes tab lists issues with severity badges
   - Footer actions work (Copy MD / JSON, PDF, Download, Refresh)

### Test on different page types

| Page type | URL example | What to check |
|-----------|-------------|---------------|
| Blog/article | MDN, Wikipedia | Content score, headings, keywords, E-E-A-T |
| E-commerce | Shopify store | Product schema, images |
| Corporate | Company homepage | Technical score, meta tags, page-type = homepage |
| SPA | React/Next site | Technology detection, hydration wait |

### Test edge cases

- **chrome:// pages** — Should show an error that the page cannot be analyzed
- **Refresh** — Re-runs analysis on the current tab
- **Copy MD / Copy JSON** — Copies the report to the clipboard
- **Download JSON** — Saves a report file
- **PDF** — Opens the print dialog
- **Filter tabs** — Narrows the tab list by name
- **Highlight** — Scrolls to and outlines the element on the live page
- **Settings** — Changing options and saving triggers a re-analysis
- **Side panel** — Toggle “Open as side panel” and confirm the toolbar icon opens the panel
- **Context menu** — Right-click a normal https page → “Analyze with SEO Reverse Engineer”
- **Keyboard shortcut** — Press `Alt+Shift+S` (or your custom shortcut) to open the side panel
- **Social previews** — On Indexability → Title & Meta, verify Open Graph and X/Twitter cards (missing-field badges when tags are absent)
- **History** — Run 2+ analyses, open History tab, Open/Delete entries, filter by URL
- **Re-audit diff** — Analyze the same URL twice (Refresh); Overview shows Fixed / New / Still open
- **Fix snippets** — Fixes tab shows HTML snippets with Copy snippet for supported issues
- **robots.txt / sitemap** — Indexability → Technical SEO shows fetch status, Disallow match, sitemap sample
- **Hreflang** — Indexability → Hreflang lists annotations (or explains none found)
- **Fix checklist** — On Fixes: Mark done / Dismiss / filter Open·Done·Dismissed; reload extension and confirm state persists for that URL
- **Compare** — Analyze two pages (or same page twice), open Compare, pick a History audit as B; check score delta and only-in-A / only-in-B issues
- **Overlay** — After analysis, click **Overlay** in the footer; badges appear on the page; **Clear overlay** removes them
- **Keyword matrix** — Settings: set primary + secondary keywords, Save, open Keywords tab and verify the placement matrix
- **Internal link map** — Outgoing links tab: table of destinations with depth, count, anchors; filter All / Once / Weak
- **Branded PDF** — Click PDF; print preview shows brand bar, overall score ring, breakdown bars, and top fixes (not raw markdown)
- **Lab CWV** — Performance tab shows LCP/CLS/INP/TTFB with Good/NI/Poor; label says “This page load · not CrUX”. For INP, click around the page then Refresh.

## Project Structure

```
├── entrypoints/
│   ├── popup/          # Popup UI entry
│   ├── sidepanel/      # Side panel UI entry
│   ├── content.ts      # DOM collection + analysis + highlight
│   └── background.ts   # Message routing + side panel behavior
├── analyzers/          # Independent SEO analyzers + scoring
├── utils/              # Parser, enrich, keywords, readability, export
├── types/              # TypeScript interfaces (seo, report, settings)
├── tests/              # Vitest unit tests
└── popup/
    ├── components/     # UI components + section views
    ├── composables/    # useAnalysis, useSettings, useHighlight, …
    └── stores/         # Pinia report store
```

## Architecture

1. Popup / side panel sends `ANALYZE_PAGE` to the background service worker
2. Background forwards `RUN_ANALYSIS` to the content script on the active tab
3. Content script waits for SPA hydration (if configured), builds `PageContext` from the DOM, and runs enrichment (timing, broken assets, mobile audit)
4. `AnalyzerService` runs all analyzers in parallel and merges results into an `SeoReport`
5. Report returns to the UI; score history and cache are updated in Chrome storage
6. `HIGHLIGHT_ELEMENT` messages scroll to and outline selectors on the live page

## Limitations (by design)

- Broken link checks are optional and may be incomplete due to CORS, timeouts, and per-run caps
- No AI-generated suggestions (rule-based only)
- Cannot analyze `chrome://`, `chrome-extension://`, or Web Store pages
- Analysis is limited to the rendered DOM (no raw server response headers such as `X-Robots-Tag`)
- Performance signals are **lab/on-page** (including LCP/CLS/INP from this page load) — not field CrUX from Search Console
- INP may be unavailable until the user interacts with the page, then Refresh

## License

MIT
