<template>
  <section class="p-6 transition-all duration-300 bg-white shadow-lg dark:bg-gray-800 rounded-2xl hover:shadow-xl">
    <h2 class="mb-6 text-2xl font-semibold text-gray-800 dark:text-gray-200">Settings</h2>
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <label for="use-gitignore" class="text-sm font-medium text-gray-700 dark:text-gray-300">Use .gitignore</label>
        <ToggleSwitch v-model="useGitignore" id="use-gitignore" />
      </div>
      <div class="flex items-center justify-between">
        <label for="use-standard-ignore" class="text-sm font-medium text-gray-700 dark:text-gray-300">Use standard ignore patterns</label>
        <ToggleSwitch v-model="useStandardIgnore" id="use-standard-ignore" />
      </div>
      <div class="flex items-center justify-between">
        <label for="include-tree" class="text-sm font-medium text-gray-700 dark:text-gray-300">Include tree</label>
        <ToggleSwitch v-model="includeTree" id="include-tree" />
      </div>
      <div>
        <label for="file-size-limit" class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">File size limit (KB)</label>
        <input 
          v-model.number="fileSizeLimit" 
          type="number" 
          id="file-size-limit" 
          min="1" 
          step="1" 
          class="w-full px-3 py-2 text-gray-700 bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600"
        />
      </div>
      <div>
        <label for="custom-ignore" class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Custom ignore patterns</label>
        <textarea 
          v-model="customIgnore" 
          id="custom-ignore" 
          rows="4" 
          class="w-full px-3 py-2 text-gray-700 bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600" 
          placeholder="Enter custom ignore patterns, one per line"
        ></textarea>
      </div>
      <div>
        <label for="api-key" class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">GitHub API Key</label>
        <div class="relative">
          <input 
            v-model="localApiKey" 
            :type="showApiKey ? 'text' : 'password'" 
            id="api-key" 
            class="w-full px-3 py-2 pr-10 text-gray-700 bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600"
            placeholder="Enter your GitHub API key"
          />
          <button 
            @click="toggleApiKeyVisibility" 
            type="button" 
            class="absolute inset-y-0 right-0 flex items-center px-3 text-gray-700 dark:text-gray-300"
          >
            <Icon :name="showApiKey ? 'uil:eye-slash' : 'uil:eye'" />
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { useGithubActions } from '~/composables/useGithubState'

const props = defineProps({
  useGitignore: Boolean,
  useStandardIgnore: Boolean,
  includeTree: Boolean,
  fileSizeLimit: Number,
  customIgnore: String,
})

const { apiKey, setApiKey } = useGithubActions()

const useGitignore = ref(props.useGitignore)
const useStandardIgnore = ref(props.useStandardIgnore)
const includeTree = ref(props.includeTree)
const fileSizeLimit = ref(props.fileSizeLimit)
const customIgnore = ref(props.customIgnore)
const showApiKey = ref(false)
const localApiKey = ref(apiKey.value)

const emit = defineEmits(['update:useGitignore', 'update:useStandardIgnore', 'update:includeTree', 'update:fileSizeLimit', 'update:customIgnore'])

watch(useGitignore, (newValue) => emit('update:useGitignore', newValue))
watch(useStandardIgnore, (newValue) => emit('update:useStandardIgnore', newValue))
watch(fileSizeLimit, (newValue) => emit('update:fileSizeLimit', newValue))
watch(customIgnore, (newValue) => emit('update:customIgnore', newValue))
watch(includeTree, (newValue) => emit('update:includeTree', newValue))

watch(localApiKey, (newValue) => {
  setApiKey(newValue)
})

watch(apiKey, (newValue) => {
  localApiKey.value = newValue
})

const toggleApiKeyVisibility = () => {
  showApiKey.value = !showApiKey.value
}
</script>