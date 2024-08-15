<template>
  <div
    class="min-h-screen text-gray-800 transition-colors duration-300 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 dark:text-gray-200">
    <main class="container px-4 pt-12 pb-8 mx-auto max-w-7xl">
      <div class="flex flex-col gap-8 lg:flex-row lg:h-[calc(100vh-4rem)]">
        <div class="w-full space-y-8 lg:w-1/2 lg:overflow-y-auto">
          <RepositoryFetcher v-model:repoUrl="githubState.repoUrl" v-model:apiKey="githubState.apiKey"
            @fetch-repo="fetchRepo" />

          <Settings v-model:useGitignore="githubState.useGitignore"
            v-model:useStandardIgnore="githubState.useStandardIgnore" v-model:fileSizeLimit="githubState.fileSizeLimit"
            v-model:selectedBranch="githubState.selectedBranch" v-model:customIgnore="githubState.customIgnore"
            :branches="githubState.branches" />

          <ApiRateLimit v-if="githubState.rateLimitInfo" :remaining="githubState.rateLimitInfo.remaining"
            :limit="githubState.rateLimitInfo.limit" :resetTime="githubState.rateLimitInfo.resetTime" />
        </div>

        <div class="w-full lg:w-1/2">
          <Output :loading="githubState.loading" :error="githubState.error" :output="githubState.output"
            @copy="copyToClipboardWithToast" @download="downloadXmlWithToast" />
        </div>
      </div>
    </main>

    <ToastNotifications :toasts="toasts" />
  </div>
</template>

<script setup>
const githubState = useGithubState()
const { fetchRepo, resetState, copyToClipboard, downloadXml } = useGithubActions()

const isDarkMode = ref(false)
const toasts = ref([])
let toastId = 0

const toggleDarkMode = () => {
  isDarkMode.value = !isDarkMode.value
  document.documentElement.classList.toggle('dark', isDarkMode.value)
  localStorage.setItem('darkMode', isDarkMode.value)
  showToast('Theme changed', 'info')
}

const showToast = (message, type = 'info') => {
  const id = toastId++
  toasts.value.push({ id, message, type })
  setTimeout(() => {
    toasts.value = toasts.value.filter(t => t.id !== id)
  }, 3000)
}

const copyToClipboardWithToast = async () => {
  const result = await copyToClipboard()
  showToast(result.message, result.success ? 'success' : 'error')
}

const downloadXmlWithToast = () => {
  const result = downloadXml()
  showToast(result.message, result.success ? 'success' : 'error')
}

onMounted(() => {
  const savedDarkMode = localStorage.getItem('darkMode')
  if (savedDarkMode !== null) {
    isDarkMode.value = savedDarkMode === 'true'
    document.documentElement.classList.toggle('dark', isDarkMode.value)
  } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    isDarkMode.value = true
    document.documentElement.classList.add('dark')
  }

  // Set default values for switches
  if (githubState.useGitignore === undefined) {
    githubState.useGitignore = true
  }
  if (githubState.useStandardIgnore === undefined) {
    githubState.useStandardIgnore = true
  }
})

onUnmounted(() => {
  resetState()
})

// Parse rate limit info
const parseRateLimitInfo = (rateLimitInfo) => {
  const match = rateLimitInfo.match(/API Rate Limit: (\d+)\/(\d+) \| Resets at (.+)/)
  if (match) {
    return {
      remaining: parseInt(match[1]),
      limit: parseInt(match[2]),
      resetTime: match[3]
    }
  }
  return null
}

// Update githubState to include parsed rate limit info
watch(() => githubState.rateLimitInfo, (newValue) => {
  if (newValue) {
    githubState.rateLimitInfo = parseRateLimitInfo(newValue)
  }
})
</script>