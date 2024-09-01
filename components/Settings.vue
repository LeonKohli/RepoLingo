<template>
  <section
    class="p-6 transition-all duration-300 bg-white bg-opacity-50 border border-gray-200 shadow-lg dark:bg-background-dark dark:bg-opacity-50 rounded-2xl hover:shadow-xl dark:border-gray-700 border-opacity-10 backdrop-filter backdrop-blur-sm">
    <p class="mb-6 text-2xl font-semibold text-gray-900 dark:text-white">Settings</p>
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
        <NumberInput v-model="fileSizeLimit" id="file-size-limit" :min="1" :step="1" />
      </div>
      <div>
        <label for="custom-ignore" class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Custom ignore patterns</label>
        <textarea v-model="customIgnore" id="custom-ignore" placeholder="Enter custom ignore patterns, one per line"
          rows="4"
          class="w-full px-3 py-2 text-sm text-gray-800 transition-all duration-300 ease-in-out bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-background-dark dark:text-gray-200 dark:border-gray-700"></textarea>
      </div>
      <div>
        <label for="api-key" class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">GitHub API Key</label>
        <div class="relative">
          <input :value="apiKey" @input="handleApiKeyInput" :type="showApiKey ? 'text' : 'password'" id="api-key"
            class="w-full px-3 py-2 pr-10 text-sm text-gray-800 transition-all duration-300 ease-in-out bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-background-dark dark:text-gray-200 dark:border-gray-700"
            placeholder="Enter your GitHub API key" />
          <button @click="toggleApiKeyVisibility" type="button"
            class="absolute inset-y-0 right-0 flex items-center px-3 text-gray-700 transition-all duration-300 ease-in-out dark:text-gray-300">
            <Icon :name="showApiKey ? 'uil:eye-slash' : 'uil:eye'" />
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
const props = defineProps({
  useGitignore: Boolean,
  useStandardIgnore: Boolean,
  includeTree: Boolean,
  fileSizeLimit: Number,
  customIgnore: String,
})

const { apiKey, updateApiKey } = useApiKeyState()
const useGitignore = ref(props.useGitignore)
const useStandardIgnore = ref(props.useStandardIgnore)
const includeTree = ref(props.includeTree)
const fileSizeLimit = ref(props.fileSizeLimit)
const customIgnore = ref(props.customIgnore)
const showApiKey = ref(false)

const emit = defineEmits(['update:useGitignore', 'update:useStandardIgnore', 'update:includeTree', 'update:fileSizeLimit', 'update:customIgnore'])

watch(useGitignore, (newValue) => emit('update:useGitignore', newValue))
watch(useStandardIgnore, (newValue) => emit('update:useStandardIgnore', newValue))
watch(fileSizeLimit, (newValue) => emit('update:fileSizeLimit', newValue))
watch(customIgnore, (newValue) => emit('update:customIgnore', newValue))
watch(includeTree, (newValue) => emit('update:includeTree', newValue))

const toggleApiKeyVisibility = () => {
  showApiKey.value = !showApiKey.value
}

const handleApiKeyInput = (event) => {
  updateApiKey(event.target.value)
}
</script>