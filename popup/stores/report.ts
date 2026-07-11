import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { SeoReport } from '../../types/report'

export const SECTION_TITLES: Record<string, string> = {
  'rank-reasons': 'Why This Page Ranks',
  positives: "What's Working Well",
  basic: 'Basic Information',
  title: 'Title & Meta',
  headings: 'Heading Analysis',
  keywords: 'Keyword Analysis',
  content: 'Content Analysis',
  images: 'Images',
  links: 'Links',
  schema: 'Structured Data',
  technical: 'Technical SEO',
  hreflang: 'Hreflang',
  accessibility: 'Accessibility',
  mobile: 'Mobile',
  technology: 'Technology Detection',
  eeat: 'E-E-A-T Signals',
  ux: 'UX Signals',
  recommendations: 'Recommendations',
}

export type TabId =
  | 'overview'
  | 'content'
  | 'headings'
  | 'keywords'
  | 'indexability'
  | 'schema'
  | 'images'
  | 'links'
  | 'performance'
  | 'accessibility'
  | 'signals'
  | 'fixes'
  | 'history'
  | 'compare'
  | 'settings'

export interface NavTab {
  id: TabId
  label: string
  /** Section IDs from the report to render in this tab */
  sections: string[]
  /** Issue category keys used for badge counts */
  issueCategories?: string[]
  group: 'main' | 'tools'
}

export const NAV_TABS: NavTab[] = [
  {
    id: 'overview',
    label: 'Overview',
    sections: ['rank-reasons', 'positives'],
    group: 'main',
  },
  {
    id: 'content',
    label: 'Content',
    sections: ['content'],
    issueCategories: ['content'],
    group: 'main',
  },
  {
    id: 'headings',
    label: 'Heading Analysis',
    sections: ['headings'],
    issueCategories: ['headings'],
    group: 'main',
  },
  {
    id: 'keywords',
    label: 'Keyword Analysis',
    sections: ['keywords'],
    issueCategories: ['keywords'],
    group: 'main',
  },
  {
    id: 'indexability',
    label: 'Indexability',
    sections: ['basic', 'title', 'technical', 'hreflang'],
    issueCategories: ['basic', 'title', 'technical', 'hreflang'],
    group: 'main',
  },
  {
    id: 'schema',
    label: 'Structured data',
    sections: ['schema'],
    issueCategories: ['schema'],
    group: 'main',
  },
  {
    id: 'images',
    label: 'Images',
    sections: ['images'],
    issueCategories: ['images'],
    group: 'main',
  },
  {
    id: 'links',
    label: 'Outgoing links',
    sections: ['links'],
    issueCategories: ['links'],
    group: 'main',
  },
  {
    id: 'performance',
    label: 'Performance',
    sections: ['performance', 'mobile'],
    issueCategories: ['performance', 'mobile'],
    group: 'main',
  },
  {
    id: 'accessibility',
    label: 'Accessibility',
    sections: ['accessibility'],
    issueCategories: ['accessibility'],
    group: 'main',
  },
  {
    id: 'signals',
    label: 'Signals',
    sections: ['eeat', 'ux', 'technology'],
    issueCategories: ['eeat', 'ux'],
    group: 'main',
  },
  {
    id: 'fixes',
    label: 'Fixes',
    sections: ['recommendations'],
    group: 'main',
  },
  {
    id: 'history',
    label: 'History',
    sections: [],
    group: 'tools',
  },
  {
    id: 'compare',
    label: 'Compare',
    sections: [],
    group: 'tools',
  },
  {
    id: 'settings',
    label: 'Settings',
    sections: [],
    group: 'tools',
  },
]

export const useReportStore = defineStore('report', () => {
  const report = ref<SeoReport | null>(null)
  const loading = ref(true)
  const error = ref<string | null>(null)
  const activeTab = ref<TabId>('overview')
  const searchQuery = ref('')
  /** Pre-select this History entry when opening Compare */
  const compareTargetId = ref<string | null>(null)

  const allSectionIds = Object.keys(SECTION_TITLES)

  const mainTabs = computed(() => NAV_TABS.filter((t) => t.group === 'main'))
  const toolTabs = computed(() => NAV_TABS.filter((t) => t.group === 'tools'))

  const activeNavTab = computed(() => NAV_TABS.find((t) => t.id === activeTab.value) ?? NAV_TABS[0])

  function issueCountForTab(tab: NavTab): number {
    if (!report.value) return 0
    if (tab.id === 'fixes') return report.value.recommendations.length
    const cats = tab.issueCategories ?? []
    if (cats.length === 0) return 0
    return report.value.recommendations.filter(
      (r) => r.category && cats.includes(r.category),
    ).length
  }

  const tabBadges = computed(() => {
    const map: Partial<Record<TabId, number>> = {}
    for (const tab of NAV_TABS) {
      const count = issueCountForTab(tab)
      if (count > 0) map[tab.id] = count
    }
    return map
  })

  const filteredTabs = computed(() => {
    const q = searchQuery.value.toLowerCase().trim()
    if (!q) return mainTabs.value

    return mainTabs.value.filter((tab) => {
      if (tab.label.toLowerCase().includes(q) || tab.id.includes(q)) return true
      if (!report.value) return false

      return tab.sections.some((sectionId) => {
        if (sectionId === 'rank-reasons') {
          return report.value!.rankReasons.some((r) => r.toLowerCase().includes(q))
        }
        if (sectionId === 'positives') {
          return report.value!.positives.some((p) => p.message.toLowerCase().includes(q))
        }
        if (sectionId === 'recommendations') {
          return report.value!.recommendations.some(
            (r) =>
              r.problem.toLowerCase().includes(q) ||
              r.suggestedFix.toLowerCase().includes(q),
          )
        }
        const section = report.value!.sections[sectionId]
        if (!section) return false
        if (JSON.stringify(section.data).toLowerCase().includes(q)) return true
        return section.issues.some((i) => i.problem.toLowerCase().includes(q))
      })
    })
  })

  function setActiveTab(id: TabId) {
    activeTab.value = id
  }

  function openCompare(entryId?: string) {
    if (entryId) compareTargetId.value = entryId
    activeTab.value = 'compare'
  }

  function setReport(data: SeoReport) {
    report.value = data
    loading.value = false
    error.value = null
  }

  function setError(msg: string) {
    error.value = msg
    loading.value = false
  }

  function setLoading(val: boolean) {
    loading.value = val
  }

  return {
    report,
    loading,
    error,
    activeTab,
    searchQuery,
    compareTargetId,
    allSectionIds,
    mainTabs,
    toolTabs,
    activeNavTab,
    tabBadges,
    filteredTabs,
    setActiveTab,
    openCompare,
    setReport,
    setError,
    setLoading,
    issueCountForTab,
  }
})
