<template>
  <section class="p-6 transition-all duration-300 bg-[#0f172a] bg-opacity-50 shadow-lg rounded-2xl hover:shadow-xl border border-white border-opacity-10 backdrop-filter backdrop-blur-sm">
    <p class="mb-6 text-2xl font-semibold text-white">Repository Fetcher</p>
    <form @submit.prevent="$emit('fetch-repo')" class="space-y-6">
      <div>
        <label for="repo-url" class="block mb-2 text-sm font-medium text-gray-300">Repository URL</label>
        <div class="relative">
          <input 
            :value="repoUrl"
            @input="updateRepoUrl($event.target.value)"
            type="url" 
            id="repo-url"
            placeholder="Enter GitHub repository URL" 
            required 
            class="w-full py-2 pl-10 pr-3 text-sm text-gray-800 transition-all duration-300 ease-in-out bg-gray-100 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700"
          />
          <Icon name="uil:github" class="absolute text-gray-400 transition-all duration-300 ease-in-out transform -translate-y-1/2 left-3 top-1/2" />
        </div>
      </div>
      <div>
        <label for="selected-branch" class="block mb-2 text-sm font-medium text-gray-300">Branch</label>
        <CustomDropdown
          v-model="localSelectedBranch"
          :options="localBranches"
          :loading="isFetchingBranches"
          placeholder="Default branch"
          class="transition-all duration-300 ease-in-out"
        />
      </div>
      <button type="submit"
        class="w-full px-4 py-2 font-medium text-gray-800 transition-all duration-300 ease-in-out border border-white rounded-lg bg-primary border-opacity-20 hover:bg-primary-light focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 active:bg-primary-dark">
        <Icon name="uil:search" class="mr-2 transition-all duration-300 ease-in-out" /> Fetch Repository
      </button>
    </form>
  </section>
</template>

<script setup>
import { useGithubState, useGithubActions } from '~/composables/useGithubState'
import CustomDropdown from './CustomDropdown.vue'

const props = defineProps({
  repoUrl: String,
  selectedBranch: String,
  branches: Array,
})

const emit = defineEmits(['fetch-repo', 'update:repoUrl', 'update:selectedBranch', 'update:branches'])

const localBranches = ref([])
const isFetchingBranches = ref(false)
const localSelectedBranch = ref(props.selectedBranch)

const { fetchBranches } = useGithubActions()
const githubState = useGithubState()

const updateRepoUrl = (newValue) => {
  emit('update:repoUrl', newValue)
  handleRepoUrlInput()
}

watch(localSelectedBranch, (newValue) => {
  emit('update:selectedBranch', newValue)
})

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