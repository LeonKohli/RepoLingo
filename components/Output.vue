<template>
  <section
    class="flex flex-col h-full p-6 transition-all duration-300 bg-[#0f172a] bg-opacity-50 shadow-lg rounded-2xl hover:shadow-xl border border-white border-opacity-10 backdrop-filter backdrop-blur-sm">
    <p class="mb-6 text-2xl font-semibold text-white">Output</p>
    <div class="flex flex-col flex-grow">
      <div v-if="loading"
        class="flex flex-col items-center justify-center flex-grow w-11/12 mx-auto transition-all duration-300">
        <div class="w-16 h-16 border-4 rounded-full border-primary animate-spin border-t-transparent"></div>
        <p class="mt-4 text-sm text-gray-400">Fetching repository...</p>
      </div>
      <div v-else-if="output" class="flex flex-col flex-grow w-full space-y-4 transition-all duration-300">
        <div class="flex-grow overflow-auto rounded-lg" style="max-height: calc(100vh - 12rem);">
          <pre
            class="w-full h-full px-3 py-2 text-sm text-gray-800 whitespace-pre-wrap bg-gray-100 border border-gray-300 rounded-lg focus:outline-none dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700"
            tabindex="0" @keydown.ctrl.a.prevent="selectAllOutput"
            ref="outputContent"><code v-html="highlightedOutput"></code></pre>
        </div>
      </div>
      <div v-else
        class="flex items-center justify-center flex-grow w-11/12 mx-auto text-gray-500 transition-all duration-300 dark:text-gray-400">
        No output yet. Fetch a repository to see results.
      </div>

      <div class="flex items-center justify-between mt-4">
        <div class="flex space-x-4">
          <button @click="copyToClipboard"
            class="px-4 py-2 text-gray-800 transition-all duration-300 border border-white rounded-lg bg-primary hover:bg-primary-light focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 active:bg-primary-dark border-opacity-20">
            <Icon :name="copyingState ? 'uil:check' : 'uil:copy'" class="mr-2" />
            {{ copyingState ? 'Copied!' : 'Copy' }}
          </button>
          <button @click="downloadXml"
            class="px-4 py-2 text-white transition-all duration-300 bg-gray-600 border border-gray-500 rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 active:bg-gray-800">
            <Icon :name="downloadingState ? 'uil:check' : 'uil:download-alt'" class="mr-2" />
            {{ downloadingState ? 'Downloaded!' : 'Download' }}
          </button>
        </div>
        <div v-if="output" class="text-sm text-gray-600 dark:text-gray-400">
          Estimated tokens: {{ tokenCount }}
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { encode } from 'gpt-tokenizer'
import hljs from 'highlight.js/lib/core'
import xml from 'highlight.js/lib/languages/xml'
import 'highlight.js/styles/github-dark.css'

hljs.registerLanguage('xml', xml)

const props = defineProps({
  loading: Boolean,
  output: String,
})

const emit = defineEmits(['copy', 'download'])

const copyingState = ref(false)
const downloadingState = ref(false)
const outputContent = ref(null)

const tokenCount = computed(() => {
  if (!props.output) return 0
  return encode(props.output).length
})

const copyToClipboard = async () => {
  copyingState.value = true
  emit('copy')
  setTimeout(() => {
    copyingState.value = false
  }, 2000)
}

const downloadXml = async () => {
  downloadingState.value = true
  emit('download')
  setTimeout(() => {
    downloadingState.value = false
  }, 2000)
}

const selectAllOutput = () => {
  if (outputContent.value) {
    const range = document.createRange()
    range.selectNodeContents(outputContent.value)
    const selection = window.getSelection()
    selection.removeAllRanges()
    selection.addRange(range)
  }
}

const highlightedOutput = computed(() => {
  if (!props.output) return ''
  return hljs.highlight(props.output, { language: 'xml' }).value
})
</script>

<style>
.hljs {
  background: transparent !important;
}
</style>