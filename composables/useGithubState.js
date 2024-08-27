const usePersistedState = (key, defaultValue) => {
  const state = ref(defaultValue)

  if (import.meta.client) {
    const storedValue = localStorage.getItem(key)
    if (storedValue) {
      state.value = JSON.parse(storedValue)
    }

    watch(state, (newValue) => {
      localStorage.setItem(key, JSON.stringify(newValue))
    }, { deep: true })
  }

  return state
}

const encryptApiKey = async (apiKey) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(apiKey);
  const key = await crypto.subtle.generateKey(
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encryptedData = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: iv },
    key,
    data
  );
  const exportedKey = await crypto.subtle.exportKey('raw', key);
  return {
    encryptedData: Array.from(new Uint8Array(encryptedData)),
    iv: Array.from(iv),
    key: Array.from(new Uint8Array(exportedKey))
  };
};

const decryptApiKey = async (encryptedObj) => {
  const key = await crypto.subtle.importKey(
    'raw',
    new Uint8Array(encryptedObj.key),
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );
  const decryptedData = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: new Uint8Array(encryptedObj.iv) },
    key,
    new Uint8Array(encryptedObj.encryptedData)
  );
  const decoder = new TextDecoder();
  return decoder.decode(decryptedData);
};

const useSecurePersistedState = (key, defaultValue) => {
  const state = ref(defaultValue);

  if (import.meta.client) {
    const storedValue = localStorage.getItem(key);
    if (storedValue) {
      const decryptedValue = JSON.parse(storedValue);
      decryptApiKey(decryptedValue).then(decrypted => {
        state.value = decrypted;
      });
    }

    watch(state, async (newValue) => {
      if (newValue) {
        const encryptedValue = await encryptApiKey(newValue);
        localStorage.setItem(key, JSON.stringify(encryptedValue));
      } else {
        localStorage.removeItem(key);
      }
    }, { deep: true });
  }

  return state;
};

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
  selectedBranch: '',
  showApiKeyModal: false,
  toasts: [],
}))

export const useGithubActions = () => {
  const state = useGithubState()
  const apiKey = useSecurePersistedState('github-api-key', '')

  const fetchRepo = async () => {
    if (!state.value.repoUrl) {
      state.value.error = 'Please provide a repository URL'
      return
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
          includeTree: state.value.includeTree
        }
      })

      state.value.output = data.xmlContent
      state.value.repoInfo = data.repoInfo
      state.value.branches = data.branches
      state.value.rateLimitInfo = data.rateLimitInfo

      if (state.value.selectedBranch && !data.branches.includes(state.value.selectedBranch)) {
        state.value.selectedBranch = ''
      }
    } catch (error) {
      if (error.statusCode === 403 && error.statusMessage.includes('API rate limit exceeded')) {
        state.value.showApiKeyModal = true
        state.value.error = 'API rate limit exceeded'
      } else {
        state.value.error = error.message || 'An error occurred'
      }
    } finally {
      state.value.loading = false
    }
  }

  const fetchBranches = async () => {
    if (!state.value.repoUrl || !isValidGithubUrl(state.value.repoUrl)) {
      state.value.error = 'Please provide a valid repository URL'
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
      if (error.statusCode === 403 && error.statusMessage.includes('API rate limit exceeded')) {
        state.value.showApiKeyModal = true
        state.value.error = 'API rate limit exceeded'
      } else {
        state.value.error = error.message || 'An error occurred'
      }
    } finally {
      state.value.loading = false
    }
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

  const setApiKey = (newApiKey) => {
    apiKey.value = newApiKey
  }

  return {
    fetchRepo,
    fetchBranches,
    resetState,
    copyToClipboard,
    downloadXml,
    setApiKey,
    apiKey,
  }
}