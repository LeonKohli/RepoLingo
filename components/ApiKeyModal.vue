<template>
  <Transition name="modal">
    <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center overflow-auto bg-black bg-opacity-50">
      <div class="relative w-full max-w-md p-8 m-4 bg-white rounded-lg shadow-xl dark:bg-gray-800">
        <h2 class="mb-4 text-2xl font-bold text-gray-800 dark:text-gray-200">GitHub API Rate Limit Exceeded</h2>
        <p class="mb-4 text-gray-600 dark:text-gray-400">
          You've hit the GitHub API rate limit. To continue, please enter a GitHub Personal Access Token.
        </p>
        <a href="https://github.com/settings/tokens" target="_blank" rel="noopener noreferrer" class="inline-block mb-4 text-blue-500 hover:underline">
          Get a token here
        </a>
        <input 
          v-model="apiKey"
          type="password"
          placeholder="Enter your GitHub API token"
          class="w-full px-3 py-2 mb-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600"
        />
        <div class="flex justify-end">
          <button 
            @click="saveApiKey"
            class="px-4 py-2 text-white bg-blue-500 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
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

const apiKey = ref('')

const saveApiKey = () => {
  emit('save', apiKey.value)
  emit('update:show', false)
  apiKey.value = ''
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