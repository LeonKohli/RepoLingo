<template>
  <section class="p-6 transition-all duration-300 bg-white shadow-lg dark:bg-gray-800 rounded-2xl hover:shadow-xl">
    <h2 class="mb-6 text-2xl font-semibold text-gray-800 dark:text-gray-200">Repository Fetcher</h2>
    <form @submit.prevent="$emit('fetch-repo')" class="space-y-6">
      <div>
        <label for="repo-url" class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Repository URL</label>
        <IconInput 
          :modelValue="repoUrl"
          @update:modelValue="updateRepoUrl"
          icon-name="uil:github" 
          type="url" 
          id="repo-url"
          placeholder="Enter GitHub repository URL" 
          required 
          @input="handleRepoUrlInput"
        />
      </div>
      <!-- New branch selector -->
      <div>
        <label for="selected-branch" class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Branch</label>
        <select 
          :value="selectedBranch"
          @input="updateSelectedBranch"
          id="selected-branch" 
          class="w-full px-3 py-2 text-gray-700 bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600"
        >
          <option value="">Default branch</option>
          <option v-for="branch in localBranches" :key="branch" :value="branch">{{ branch }}</option>
        </select>
      </div>
      <button type="submit"
        class="w-full px-4 py-2 font-medium text-white transition-all duration-300 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2">
        <Icon name="uil:search" class="mr-2" /> Fetch Repository
      </button>
    </form>
  </section>
</template>

<script setup>
import { useGithubState, useGithubActions } from '~/composables/useGithubState'

const props = defineProps({
  repoUrl: String,
  selectedBranch: String,
  branches: Array,
})

const emit = defineEmits(['fetch-repo', 'update:repoUrl', 'update:selectedBranch', 'update:branches'])

const localBranches = ref([])
const isFetchingBranches = ref(false)

const { fetchBranches } = useGithubActions()
const githubState = useGithubState()

const updateRepoUrl = (newValue) => {
  emit('update:repoUrl', newValue)
}

const updateSelectedBranch = (event) => {
  emit('update:selectedBranch', event.target.value)
}

watch(() => props.repoUrl, async (newValue) => {
  if (newValue) {
    await handleRepoUrlInput()
  } else {
    localBranches.value = []
    emit('update:branches', [])
  }
})

const handleRepoUrlInput = () => {
  if (props.repoUrl) {
    clearTimeout(handleRepoUrlInput.timer)
    handleRepoUrlInput.timer = setTimeout(async () => {
      isFetchingBranches.value = true
      try {
        await fetchBranches()
        localBranches.value = props.branches
        emit('update:branches', props.branches)
      } catch (error) {
        console.error('Error fetching branches:', error)
        localBranches.value = []
        emit('update:branches', [])
        
        // Check if the error is due to API rate limit
        if (error.message && error.message.includes('API rate limit exceeded')) {
          githubState.value.showApiKeyModal = true
        }
      } finally {
        isFetchingBranches.value = false
      }
    }, 300)
  }
}
</script>