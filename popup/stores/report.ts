import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { SeoReport } from '../../types/report'

export const useReportStore = defineStore('report', () => {
  const report = ref<SeoReport | null>(null)
  const loading = ref(true)
  const error = ref<string | null>(null)
  const expandedSections = ref<string[]>(['rank-reasons'])
  const searchQuery = ref('')

  const allSectionIds = [
    'rank-reasons', 'basic', 'title', 'headings', 'keywords', 'content',
    'images', 'links', 'schema', 'technical', 'accessibility', 'mobile',
    'technology', 'eeat', 'ux', 'recommendations',
  ]

  const filteredSections = computed(() => {
    if (!searchQuery.value.trim()) return allSectionIds
    const q = searchQuery.value.toLowerCase()
    return allSectionIds.filter((id) => id.includes(q))
  })

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

  function toggleSection(id: string) {
    const idx = expandedSections.value.indexOf(id)
    if (idx >= 0) expandedSections.value.splice(idx, 1)
    else expandedSections.value.push(id)
  }

  function isExpanded(id: string) {
    return expandedSections.value.includes(id)
  }

  function expandAll() {
    expandedSections.value = [...allSectionIds]
  }

  function collapseAll() {
    expandedSections.value = []
  }

  return {
    report,
    loading,
    error,
    expandedSections,
    searchQuery,
    allSectionIds,
    filteredSections,
    setReport,
    setError,
    setLoading,
    toggleSection,
    isExpanded,
    expandAll,
    collapseAll,
  }
})
