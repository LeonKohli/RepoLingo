import { ref } from 'vue';

export const useGithubState = () => useState('github', () => ({
  repoUrl: '',
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
  selectedBranch: '',
  showApiKeyModal: false,
  toasts: [],
  outputFormat: 'xml',
  fileTree: [],
  selectedFiles: [],
}))

export const useGithubActions = () => {
  const state = useGithubState()
  const { apiKey, updateApiKey } = useApiKeyState()
  const { showToast } = useToast()

  const fetchRepo = async () => {
    if (!state.value.repoUrl) {
      showToast('Please provide a repository URL', 'error')
      return false
    }

    state.value.loading = true
    state.value.error = null

    try {
      const data = await $fetch('/api/github-repo', {
        method: 'POST',
        body: {
          repoUrl: state.value.repoUrl,
          apiKey: apiKey.value,
          useGitignore: state.value.useGitignore,
          useStandardIgnore: state.value.useStandardIgnore,
          customIgnore: state.value.customIgnore,
          fileSizeLimit: state.value.fileSizeLimit,
          selectedBranch: state.value.selectedBranch,
          includeTree: state.value.includeTree,
          format: state.value.outputFormat,
          selectedFiles: state.value.selectedFiles,
        }
      })

      state.value.output = data.output
      state.value.repoInfo = data.repoInfo
      state.value.branches = data.branches
      state.value.rateLimitInfo = data.rateLimitInfo

      if (state.value.selectedBranch && !data.branches.includes(state.value.selectedBranch)) {
        state.value.selectedBranch = ''
      }
      return true
    } catch (error) {
      handleError(error)
      return false
    } finally {
      state.value.loading = false
    }
  }

  const fetchBranches = async () => {
    if (!state.value.repoUrl || !isValidGithubUrl(state.value.repoUrl)) {
      showToast('Please provide a valid repository URL', 'error')
      return
    }

    state.value.loading = true
    state.value.error = null

    try {
      const data = await $fetch('/api/github-branches', {
        method: 'POST',
        body: {
          repoUrl: state.value.repoUrl,
          apiKey: apiKey.value,
        }
      })

      state.value.branches = data.branches
    } catch (error) {
      handleError(error)
    } finally {
      state.value.loading = false
    }
  }

  const fetchFileTree = async () => {
    if (!state.value.repoUrl) {
      showToast('Please provide a repository URL', 'error');
      return;
    }

    state.value.loading = true;

    try {
      const data = await $fetch('/api/github-files', {
        method: 'POST',
        body: {
          repoUrl: state.value.repoUrl,
          apiKey: apiKey.value,
          selectedBranch: state.value.selectedBranch || 'main',
        },
      });

      state.value.fileTree = data.tree;
    } catch (error) {
      showToast(error.message || 'An error occurred while fetching the file tree', 'error');
    } finally {
      state.value.loading = false;
    }
  };

  const handleError = (error) => {
    if (error.statusCode === 403 && error.statusMessage.includes('API rate limit exceeded')) {
      state.value.showApiKeyModal = true
      showToast('API rate limit exceeded. Please add or update your GitHub API key.', 'error')
    } else if (error.statusCode === 500 && error.statusMessage.includes('Repository not found')) {
      showToast('Repository not found. Please check the URL and ensure you have access to this repository.', 'error')
    } else if (error.statusCode === 500 && error.statusMessage.includes('Not Found')) {
      showToast('Failed to fetch branches. Please check the repository URL and your access permissions.', 'error')
    } else if (error.statusCode === 500 && error.statusMessage.includes('API rate limit exceeded')) {
      state.value.showApiKeyModal = true
      showToast('API rate limit exceeded. Please add or update your GitHub API key to increase your rate limit.', 'error')
    } else {
      showToast(error.message || 'An error occurred', 'error')
    }
    console.error("Error:", error)
    state.value.error = error.message || 'An error occurred'
  }

  const isValidGithubUrl = (url) => {
    const githubUrlPattern = /^https?:\/\/(www\.)?github\.com\/[\w-]+\/[\w.-]+$/;
    return githubUrlPattern.test(url);
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
    state.value.fileTree = []
    state.value.selectedFiles = []
  }

  const copyToClipboard = () => {
    if (!state.value.output) {
      return { success: false, message: 'No content to copy' }
    }

    return navigator.clipboard.writeText(state.value.output)
      .then(() => ({ success: true, message: 'Copied to clipboard!' }))
      .catch(() => ({ success: false, message: 'Failed to copy' }))
  }

  const downloadOutput = () => {
    if (!state.value.output) {
      return { success: false, message: 'No content to download' }
    }
    const blob = new Blob([state.value.output], { type: getContentType(state.value.outputFormat) })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const repoName = state.value.repoUrl.split('/').pop()
    const fileExtension = getFileExtension(state.value.outputFormat)
    a.download = `${repoName}_llm_context_${timestamp}.${fileExtension}`
    a.click()
    URL.revokeObjectURL(url)
    return { success: true, message: `${state.value.outputFormat.toUpperCase()} downloaded successfully` }
  }

  const getContentType = (format) => {
    switch (format) {
      case 'xml': return 'text/xml'
      case 'markdown': return 'text/markdown'
      case 'plaintext': return 'text/plain'
      default: return 'text/plain'
    }
  }

  const getFileExtension = (format) => {
    switch (format) {
      case 'xml': return 'xml'
      case 'markdown': return 'md'
      case 'plaintext': return 'txt'
      default: return 'txt'
    }
  }

  return {
    fetchRepo,
    fetchBranches,
    fetchFileTree,
    resetState,
    copyToClipboard,
    downloadOutput,
    apiKey,
    updateApiKey
  }
}