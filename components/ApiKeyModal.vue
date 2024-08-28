<template>
  <Transition name="modal">
    <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center overflow-auto bg-black bg-opacity-50">
      <div
        class="relative w-full max-w-md p-8 m-4 border border-white rounded-lg shadow-xl bg-background-dark bg-opacity-90 backdrop-filter backdrop-blur-sm border-opacity-10">
        <h2 class="mb-4 text-2xl font-bold text-white">GitHub API Rate Limit Exceeded</h2>
        <p class="mb-4 text-gray-300">
          You've hit the GitHub API rate limit. To continue, please enter a GitHub Personal Access Token.
        </p>
        <a href="https://github.com/settings/tokens" target="_blank" rel="noopener noreferrer"
          class="inline-block mb-4 text-primary hover:underline">
          Get a token here
        </a>
        <input v-model="apiKey" type="password" placeholder="Enter your GitHub API token"
          class="w-full px-3 py-2 mb-4 text-gray-800 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700" />
        <div class="flex justify-end">
          <button @click="saveApiKey"
            class="px-4 py-2 font-medium text-gray-800 transition-all duration-300 border border-white rounded-lg bg-primary border-opacity-20 hover:bg-primary-light focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 active:bg-primary-dark">
            Save
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
const props = defineProps({
  show: Boolean,
})

const emit = defineEmits(['update:show', 'save'])

const apiKey = useApiKeyState()

const saveApiKey = () => {
  emit('save', apiKey.value)
  emit('update:show', false)
}
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style>
