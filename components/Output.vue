<template>
  <section
    class="flex flex-col h-full p-6 transition-all duration-300 bg-white shadow-lg dark:bg-gray-800 rounded-2xl hover:shadow-xl">
    <h2 class="mb-6 text-2xl font-semibold text-gray-800 dark:text-gray-200">Output</h2>
    <div class="flex-grow flex flex-col overflow-hidden">
      <div v-if="loading" class="flex items-center justify-center flex-grow">
        <div class="w-12 h-12 border-4 border-blue-200 rounded-full border-t-blue-500 animate-spin"></div>
      </div>
      <div v-else-if="error"
        class="flex-grow p-4 mb-4 overflow-y-auto text-red-700 bg-red-100 rounded-lg dark:text-red-100 dark:bg-red-900">
        <Icon name="uil:exclamation-circle" class="inline-block mr-2" />
        {{ error }}
      </div>
      <div v-else-if="output" class="flex-grow overflow-hidden">
        <div class="h-full p-4 overflow-y-auto bg-gray-100 rounded-lg dark:bg-gray-700">
          <pre class="text-sm text-gray-800 whitespace-pre-wrap dark:text-gray-200">{{ output }}</pre>
        </div>
      </div>
    </div>
    <div class="flex justify-end pt-4 mt-4 space-x-4 border-t border-gray-200 dark:border-gray-700">
      <button @click="$emit('copy')"
        class="px-4 py-2 font-medium text-blue-600 transition-all duration-300 bg-blue-100 rounded-lg dark:text-blue-400 dark:bg-blue-900 hover:bg-blue-200 dark:hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500">
        <Icon name="uil:copy" class="mr-2" /> Copy
      </button>
      <button @click="$emit('download')"
        class="px-4 py-2 font-medium text-white transition-all duration-300 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2">
        <Icon name="uil:download-alt" class="mr-2" /> Download XML
      </button>
    </div>
  </section>
</template>

<script setup>
const props = defineProps({
  loading: Boolean,
  error: String,
  output: String
})

const emit = defineEmits(['copy', 'download'])
</script>