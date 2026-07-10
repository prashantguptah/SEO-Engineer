# SEO Reverse Engineer

A Chrome Extension that analyzes the currently opened webpage and explains **why the page is likely ranking well** in search engines. Everything runs client-side — no backend, no APIs, no authentication.

## Features

- 16 analysis sections (title, headings, keywords, content, images, links, schema, technical SEO, accessibility, mobile, technology, E-E-A-T, UX, and more)
- Rule-based SEO scoring (0–100) with weighted categories
- "Why This Page Ranks" summary generated from analyzer strengths
- Prioritized recommendations (HIGH / MEDIUM / LOW)
- Dark mode SaaS-style popup UI (420×650px)
- Copy report, download JSON, refresh analysis
- Search and expand/collapse accordion sections

## Tech Stack

- Vue 3 + TypeScript + Pinia + VueUse
- Tailwind CSS
- WXT (Chrome Extension MV3)
- Client-side DOM analysis only

## Setup

```bash
npm install
```

## Development

```bash
npm run dev
```

This starts WXT in watch mode and opens a browser with the extension loaded.

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
8. The popup will analyze the page and show the report (typically 1–3 seconds)

## How to Test

### Basic smoke test

1. Load the extension (steps above)
2. Open `https://developer.mozilla.org` or any article page
3. Click the extension icon
4. Verify:
   - Loading screen appears briefly
   - SEO score and sub-scores display
   - "Why This Page Ranks" shows checkmarks
   - All 16 accordion sections are present
   - Recommendations list issues with priority badges

### Test on different page types

| Page type | URL example | What to check |
|-----------|-------------|---------------|
| Blog/article | MDN, Wikipedia | Content score, headings, keywords |
| E-commerce | Shopify store | Product schema, images |
| Corporate | Company homepage | Organization schema, meta tags |
| SPA | React/Next site | Technology detection |

### Test edge cases

- **chrome:// pages** — Should show error: "Cannot analyze browser internal pages"
- **Refresh button** — Re-runs analysis on current tab
- **Copy Report** — Copies full JSON to clipboard
- **Download JSON** — Saves report file
- **Search** — Filters accordion sections by name

### Dev mode (hot reload)

```bash
npm run dev
```

WXT auto-reloads the extension when you change code. Re-open the popup to see updates.

## Project Structure

```
├── entrypoints/
│   ├── popup/          # Vue popup UI
│   ├── content.ts      # DOM collection + analysis
│   └── background.ts   # Message routing
├── analyzers/          # Independent SEO analyzers
├── utils/              # Parser, keywords, readability
├── types/              # TypeScript interfaces
└── popup/
    ├── components/     # UI components
    ├── composables/    # useAnalysis
    └── stores/         # Pinia store
```

## Architecture

1. Popup sends `ANALYZE_PAGE` to background service worker
2. Background forwards `RUN_ANALYSIS` to content script on active tab
3. Content script builds `PageContext` from DOM (single pass)
4. `AnalyzerService` runs all analyzers and merges into `SeoReport`
5. Report returns to popup for rendering

## Limitations (by design)

- No broken link checking (requires network requests, CORS limits)
- No AI-generated suggestions (rule-based only)
- Cannot analyze `chrome://`, `chrome-extension://`, or Web Store pages
- Analysis is limited to rendered DOM (no server response headers)

## License

MIT
