export const useGithubState = () => useState('github', () => ({
  repoUrl: '',
  apiKey: '',
  useGitignore: true,
  useStandardIgnore: true,
  includeTree: false,
  customIgnore: '',
  output: '',
  loading: false,
  error: null,
  repoInfo: '',
  rateLimitInfo: null,
  fileSizeLimit: 1000,
  branches: [],
  selectedBranch: ''
}))

export const useGithubActions = () => {
  const state = useGithubState()

  const fetchRepo = async () => {
    state.value.loading = true
    state.value.error = null
    try {
      const { data, error } = await useFetch('/api/github-repo', {
        method: 'POST',
        body: {
          repoUrl: state.value.repoUrl,
          useGitignore: state.value.useGitignore,
          useStandardIgnore: state.value.useStandardIgnore,
          customIgnore: state.value.customIgnore,
          fileSizeLimit: state.value.fileSizeLimit,
          selectedBranch: state.value.selectedBranch,
          includeTree: state.value.includeTree
        }
      })

      if (error.value) {
        throw new Error(error.value.data?.statusMessage || 'An error occurred')
      }

      state.value.output = data.value.xmlContent
      state.value.repoInfo = data.value.repoInfo
      state.value.branches = data.value.branches
      
      // Reset selected branch if it's not in the list of available branches
      if (state.value.selectedBranch && !data.value.branches.includes(state.value.selectedBranch)) {
        state.value.selectedBranch = ''
      }
    } catch (error) {
      state.value.error = error.message
    } finally {
      state.value.loading = false
    }
  }

  const resetState = () => {
    state.value.repoUrl = ''
    state.value.output = ''
    state.value.error = null
    state.value.repoInfo = ''
    state.value.rateLimitInfo = null
    state.value.branches = []
    state.value.selectedBranch = ''
    state.value.includeTree = false
  }

  const copyToClipboard = () => {
    if (!state.value.output) {
      return { success: false, message: 'No content to copy' }
    }
    return navigator.clipboard.writeText(state.value.output)
      .then(() => ({ success: true, message: 'Copied to clipboard!' }))
      .catch(() => ({ success: false, message: 'Failed to copy' }))
  }

  const downloadXml = () => {
    if (!state.value.output) {
      return { success: false, message: 'No content to download' }
    }
    const blob = new Blob([state.value.output], {type: 'text/xml'})
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const repoName = state.value.repoUrl.split('/').pop()
    a.download = `${repoName}_llm_context_${timestamp}.xml`
    a.click()
    URL.revokeObjectURL(url)
    return { success: true, message: 'XML downloaded successfully' }
  }

  return {
    fetchRepo,
    resetState,
    copyToClipboard,
    downloadXml
  }
}