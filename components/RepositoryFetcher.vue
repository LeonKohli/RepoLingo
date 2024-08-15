<template>
  <section class="p-6 transition-all duration-300 bg-white shadow-lg dark:bg-gray-800 rounded-2xl hover:shadow-xl">
    <h2 class="mb-6 text-2xl font-semibold text-gray-800 dark:text-gray-200">Repository Fetcher</h2>
    <form @submit.prevent="$emit('fetch-repo')" class="space-y-6">
      <div>
        <label for="repo-url" class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Repository
          URL</label>
        <IconInput v-model="repoUrl" icon-name="uil:github" type="github-url" id="repo-url"
          placeholder="Enter GitHub repository URL" required />
      </div>
      <div>
        <label for="api-key" class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
          GitHub API Key
          <span class="relative ml-1 group">
            <Icon name="uil:info-circle" class="inline-block text-gray-400 cursor-help" />
            <span
              class="absolute z-50 w-64 p-2 text-xs text-white transition-opacity duration-200 bg-gray-800 rounded shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 -top-2 left-6">
              An API key is required for private repositories and to increase rate limits. It's optional for public
              repos.
            </span>
          </span>
        </label>
        <IconInput v-model="apiKey" icon-name="uil:key-skeleton" type="password" id="api-key"
          placeholder="GitHub API Key (optional)" />
        <div class="mt-1 text-xs text-gray-500 dark:text-gray-400">
          <a href="https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token"
            target="_blank" rel="noopener noreferrer" class="text-blue-500 hover:underline">
            How to get a GitHub API key
          </a>
        </div>
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
  apiKey: String
})

const repoUrl = ref(props.repoUrl)
const apiKey = ref(props.apiKey)

watch(repoUrl, (newValue) => {
  emit('update:repoUrl', newValue)
})

watch(apiKey, (newValue) => {
  emit('update:apiKey', newValue)
})

const emit = defineEmits(['fetch-repo', 'update:repoUrl', 'update:apiKey'])
</script>