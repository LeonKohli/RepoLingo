<template>
  <div class="min-h-screen text-white transition-colors duration-300 bg-gradient-to-br from-[#0f172a] to-[#1e293b]">
    <SeoManager />
    <main class="container px-4 py-6 mx-auto max-w-7xl">
      <div class="flex flex-col gap-8 lg:flex-row" style="min-height: calc(100vh - 6rem);">
        <div class="w-full space-y-8 lg:w-1/2">
          <RepositoryFetcher
            v-model:repoUrl="githubState.repoUrl"
            v-model:selectedBranch="githubState.selectedBranch"
            v-model:branches="githubState.branches"
            @fetch-repo="fetchRepoWithToast" 
          />

          <Settings 
            v-model:useGitignore="githubState.useGitignore"
            v-model:useStandardIgnore="githubState.useStandardIgnore" 
            v-model:includeTree="githubState.includeTree"
            v-model:fileSizeLimit="githubState.fileSizeLimit"
            v-model:customIgnore="githubState.customIgnore"
            v-model:apiKey="githubState.apiKey"
          />
        </div>

        <div class="w-full lg:w-1/2 lg:flex lg:flex-col">
          <Output 
            :loading="githubState.loading" 
            :output="githubState.output"
            @copy="copyToClipboardWithToast" 
            @download="downloadXmlWithToast" 
            class="flex-grow h-full"
          />
        </div>
      </div>
    </main>

    <ToastNotifications :toasts="toasts" />
    <ApiKeyModal 
      v-model:show="githubState.showApiKeyModal"
      @save="saveApiKey"
    />
  </div>
</template>

<script setup>
const githubState = useGithubState()
const { fetchRepo, fetchBranches, resetState, copyToClipboard, downloadXml, setApiKey } = useGithubActions()

const toasts = ref([])
let toastId = 0

const showToast = (message, type = 'info') => {
  const id = toastId++
  toasts.value.push({ id, message, type })
  setTimeout(() => {
    toasts.value = toasts.value.filter(t => t.id !== id)
  }, 3000)
}

const fetchRepoWithToast = async () => {
  try {
    await fetchRepo()
    if (githubState.value.error) {
      const customErrorMessage = getCustomErrorMessage(githubState.value.error)
      showToast(customErrorMessage, 'error')
    } else {
      showToast('Repository fetched successfully', 'success')
    }
  } catch (error) {
    const customErrorMessage = getCustomErrorMessage(error.message)
    showToast(customErrorMessage, 'error')
  }
}

const getCustomErrorMessage = (errorMessage) => {
  if (errorMessage.includes('Repository not found') || errorMessage.includes('not found')) {
    return "Oops! We couldn't find that repository. Double-check the URL and try again."
  }
  if (errorMessage.includes('API rate limit exceeded')) {
    return "Oops! We've hit GitHub's API rate limit. Try adding your GitHub API key in the settings or wait a bit before trying again."
  }
  if (errorMessage.includes('Network Error')) {
    return "Looks like the internet gremlins are at it again. Check your connection and give it another shot."
  }
  // Add more custom error messages as needed
  return "Something went wrong. Let's give it another try!"
}

const copyToClipboardWithToast = async () => {
  const result = await copyToClipboard()
  showToast(result.message, result.success ? 'success' : 'error')
}

const downloadXmlWithToast = () => {
  const result = downloadXml()
  showToast(result.message, result.success ? 'success' : 'error')
}

const saveApiKey = (newApiKey) => {
  setApiKey(newApiKey)
  showToast('API key saved successfully', 'success')
  if (githubState.value.repoUrl) {
    fetchBranches()
  }
}

onUnmounted(() => {
  resetState()
})
</script>