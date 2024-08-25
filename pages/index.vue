<template>
  <div class="min-h-screen text-gray-800 transition-colors duration-300 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 dark:text-gray-200">
    <main class="container px-4 pt-12 pb-8 mx-auto max-w-7xl">
      <div class="flex flex-col gap-8 lg:flex-row lg:h-[calc(100vh-4rem)]">
        <div class="w-full space-y-8 lg:w-1/2 lg:overflow-y-auto">
          <RepositoryFetcher 
            v-model:repoUrl="githubState.repoUrl"
            @fetch-repo="fetchRepo" 
          />

          <Settings 
            v-model:useGitignore="githubState.useGitignore"
            v-model:useStandardIgnore="githubState.useStandardIgnore" 
            v-model:fileSizeLimit="githubState.fileSizeLimit"
            v-model:selectedBranch="githubState.selectedBranch" 
            v-model:customIgnore="githubState.customIgnore"
            :branches="githubState.branches" 
          />
        </div>

        <div class="w-full lg:w-1/2">
          <Output 
            :loading="githubState.loading" 
            :error="githubState.error" 
            :output="githubState.output"
            @copy="copyToClipboardWithToast" 
            @download="downloadXmlWithToast" 
          />
        </div>
      </div>
    </main>

    <ToastNotifications :toasts="toasts" />
  </div>
</template>

<script setup>
const githubState = useGithubState()
const { fetchRepo, resetState, copyToClipboard, downloadXml } = useGithubActions()

const toasts = ref([])
let toastId = 0

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
  // Set default values for switches
  if (githubState.value.useGitignore === undefined) {
    githubState.value.useGitignore = true
  }
  if (githubState.value.useStandardIgnore === undefined) {
    githubState.value.useStandardIgnore = true
  }
})

onUnmounted(() => {
  resetState()
})
</script>