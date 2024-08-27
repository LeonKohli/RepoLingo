<template>
  <section class="flex flex-col h-full p-6 transition-all duration-300 bg-white shadow-lg dark:bg-gray-800 rounded-2xl hover:shadow-xl">
    <h2 class="mb-6 text-2xl font-semibold text-gray-800 dark:text-gray-200">Output</h2>
    <div class="flex flex-col flex-grow">
      <div v-if="loading" class="flex items-center justify-center flex-grow w-11/12 mx-auto transition-all duration-300">
        <div class="w-12 h-12 border-4 border-blue-500 rounded-full animate-spin border-t-transparent"></div>
      </div>
      <div v-else-if="output" class="flex flex-col flex-grow w-full space-y-4 transition-all duration-300">
        <div class="flex-grow overflow-auto" style="max-height: calc(100vh - 16rem);">
          <pre class="text-sm text-gray-800 whitespace-pre-wrap dark:text-gray-200">{{ output }}</pre>
        </div>
      </div>
      <div v-else class="flex items-center justify-center flex-grow w-11/12 mx-auto text-gray-500 transition-all duration-300 dark:text-gray-400">
        No output yet. Fetch a repository to see results.
      </div>
      
      <div class="flex mt-4 space-x-4">
        <button 
          @click="copyToClipboard" 
          class="px-4 py-2 text-white transition-all duration-300 bg-blue-500 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 active:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          :disabled="copying || !output"
        >
          <Icon :name="copying ? 'uil:check' : 'uil:copy'" class="mr-2" /> 
          {{ copying ? 'Copied!' : 'Copy to Clipboard' }}
        </button>
        <button 
          @click="downloadXml" 
          class="px-4 py-2 text-white transition-all duration-300 bg-green-500 rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 active:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          :disabled="downloading || !output"
        >
          <Icon :name="downloading ? 'uil:check' : 'uil:download-alt'" class="mr-2" /> 
          {{ downloading ? 'Downloaded!' : 'Download XML' }}
        </button>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  loading: Boolean,
  output: String,
})

const emit = defineEmits(['copy', 'download'])

const copying = ref(false)
const downloading = ref(false)

const copyToClipboard = async () => {
  copying.value = true
  emit('copy')
  setTimeout(() => {
    copying.value = false
  }, 2000)
}

const downloadXml = async () => {
  downloading.value = true
  emit('download')
  setTimeout(() => {
    downloading.value = false
  }, 2000)
}
</script>