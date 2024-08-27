<template>
  <section class="p-6 transition-all duration-300 bg-white shadow-lg dark:bg-gray-800 rounded-2xl hover:shadow-xl">
    <h2 class="mb-6 text-2xl font-semibold text-gray-800 dark:text-gray-200">Repository Fetcher</h2>
    <form @submit.prevent="$emit('fetch-repo')" class="space-y-6">
      <div>
        <label for="repo-url" class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Repository URL</label>
        <IconInput 
          v-model="repoUrl" 
          icon-name="uil:github" 
          type="url" 
          id="repo-url"
          placeholder="Enter GitHub repository URL" 
          required 
        />
      </div>
      <!-- New branch selector -->
      <div>
        <label for="selected-branch" class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Branch</label>
        <select 
          v-model="selectedBranch" 
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
const props = defineProps({
  repoUrl: String,
  selectedBranch: String,
  branches: Array,
})

const repoUrl = ref(props.repoUrl)
const selectedBranch = ref(props.selectedBranch)
const localBranches = ref([])
const isFetchingBranches = ref(false)

const emit = defineEmits(['fetch-repo', 'update:repoUrl', 'update:selectedBranch', 'update:branches'])

watch(repoUrl, async (newValue) => {
  emit('update:repoUrl', newValue)
  if (newValue) {
    await fetchBranches(newValue)
  } else {
    localBranches.value = []
    emit('update:branches', [])
  }
})

watch(selectedBranch, (newValue) => {
  emit('update:selectedBranch', newValue)
})

const fetchBranches = async (url) => {
  isFetchingBranches.value = true
  try {
    const response = await fetch('/api/github-branches', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ repoUrl: url }),
    })
    if (!response.ok) throw new Error('Failed to fetch branches')
    const data = await response.json()
    localBranches.value = data.branches
    emit('update:branches', data.branches)
  } catch (error) {
    console.error('Error fetching branches:', error)
    localBranches.value = []
    emit('update:branches', [])
  } finally {
    isFetchingBranches.value = false
  }
}
</script>