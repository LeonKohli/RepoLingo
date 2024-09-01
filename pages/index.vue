<template>
  <div class="min-h-screen text-gray-900 dark:text-white transition-colors duration-300 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-[#0f172a] dark:to-[#1e293b]">
    <ClientOnly>
      <SeoManager :faqSchema="faqSchema" />
    </ClientOnly>
    <main class="container max-w-full px-4 py-2">
      <!-- Main content -->
      <div class="flex flex-col gap-8 lg:flex-row" style="min-height: calc(100vh - 6rem);">
        <div class="w-full space-y-8 lg:w-1/3">
          <RepositoryFetcher v-model:repoUrl="githubState.repoUrl" v-model:selectedBranch="githubState.selectedBranch"
            v-model:branches="githubState.branches" @fetch-repo="fetchRepoWithToast" ref="repoFetcher" />
          <Settings v-model:useGitignore="githubState.useGitignore"
            v-model:useStandardIgnore="githubState.useStandardIgnore" v-model:includeTree="githubState.includeTree"
            v-model:fileSizeLimit="githubState.fileSizeLimit" v-model:customIgnore="githubState.customIgnore"
            v-model:apiKey="githubState.apiKey" />
        </div>
        <div class="w-full lg:w-2/3">
          <Output :loading="githubState.loading" :output="githubState.output" @copy="copyToClipboardWithToast"
            @download="downloadXmlWithToast" class="h-full" />
        </div>
      </div>
    </main>
    <ToastNotifications />
    <ClientOnly>
      <ApiKeyModal v-model:show="githubState.showApiKeyModal" @save="handleSaveApiKey" />
    </ClientOnly>
    <div class="mt-32">
      <div class="container max-w-3xl px-4 py-16 mx-auto">
        <section class="mb-16 text-center">
          <h1 class="mb-8 text-4xl font-bold text-primary">GitHub to LLM Context Converter</h1>
          <h2 class="mb-4 text-2xl font-semibold text-gray-800 dark:text-white">Enhance Your AI Interactions</h2>
          <p class="mb-4 text-gray-600 dark:text-gray-300">
            Our GitHub to LLM Context Converter is a powerful tool designed to transform GitHub repositories into
            LLM-friendly context. This innovative solution helps users provide comprehensive project information to AI models like ChatGPT,
            Claude, or any other LLM, enabling more effective communication and assistance.
          </p>
          <p class="mb-6 text-gray-600 dark:text-gray-300">
            With customizable settings and efficient processing, you can easily convert complex repository structures
            into a format that's perfect for in-depth discussions about your projects with AI assistants.
          </p>
          <a href="https://github.com/LeonKohli/github-to-llm-context-converter" target="_blank" rel="noopener noreferrer" 
             class="inline-flex items-center px-6 py-3 text-white transition-colors duration-300 rounded-lg bg-primary hover:bg-primary-dark">
            <Icon name="mdi:github" class="w-6 h-6 mr-2" />
            View on GitHub
          </a>
        </section>
        <section class="mb-16">
          <h2 class="mb-6 text-3xl font-semibold text-center text-primary">Key Features</h2>
          <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div class="p-6 bg-white rounded-lg shadow-md dark:bg-background-light">
              <Icon name="mdi:file-tree" class="w-12 h-12 mb-4 text-primary" />
              <h3 class="mb-2 text-xl font-semibold">Repository Structure</h3>
              <p class="text-gray-600 dark:text-gray-300">Preserves the original file structure for easy navigation and understanding.</p>
            </div>
            <div class="p-6 bg-white rounded-lg shadow-md dark:bg-background-light">
              <Icon name="mdi:cog" class="w-12 h-12 mb-4 text-primary" />
              <h3 class="mb-2 text-xl font-semibold">Customizable Settings</h3>
              <p class="text-gray-600 dark:text-gray-300">Tailor the output with ignore patterns, file size limits, and more.</p>
            </div>
            <div class="p-6 bg-white rounded-lg shadow-md dark:bg-background-light">
              <Icon name="mdi:xml" class="w-12 h-12 mb-4 text-primary" />
              <h3 class="mb-2 text-xl font-semibold">XML Output</h3>
              <p class="text-gray-600 dark:text-gray-300">Generates a structured XML format that's easily parsed by LLMs.</p>
            </div>
            <div class="p-6 bg-white rounded-lg shadow-md dark:bg-background-light">
              <Icon name="mdi:shield-lock" class="w-12 h-12 mb-4 text-primary" />
              <h3 class="mb-2 text-xl font-semibold">Secure Processing</h3>
              <p class="text-gray-600 dark:text-gray-300">Your GitHub API key is securely stored and used only client-side.</p>
            </div>
          </div>
        </section>
        <section class="mb-16">
          <h2 class="mb-6 text-3xl font-semibold text-center text-primary">Frequently Asked Questions</h2>
          <div class="space-y-4">
            <div v-for="(faq, index) in faqs" :key="index" class="p-4 bg-white rounded-lg dark:bg-background-light">
              <button 
                @click="faq.isOpen = !faq.isOpen"
                class="flex items-center justify-between w-full text-xl font-medium text-gray-800 cursor-pointer dark:text-white hover:text-primary"
              >
                <span class="flex items-center">
                  <Icon :name="faq.icon" class="w-6 h-6 mr-2" />
                  {{ faq.question }}
                </span>
                <Icon 
                  name="mdi:chevron-down" 
                  class="w-6 h-6 transition-transform duration-300"
                  :class="{ 'transform rotate-180': faq.isOpen }"
                />
              </button>
              <Transition name="fade">
                <div v-if="faq.isOpen" class="mt-2">
                  <p class="text-gray-600 dark:text-gray-300" v-html="faq.answer"></p>
                  <ul v-if="faq.list" class="mt-2 text-gray-600 list-disc list-inside dark:text-gray-300">
                    <li v-for="item in faq.list" :key="item">{{ item }}</li>
                  </ul>
                  <pre v-if="faq.code" class="w-full px-3 py-2 mt-2 text-sm text-gray-800 whitespace-pre-wrap bg-gray-100 border border-gray-300 rounded-lg focus:outline-none dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700" tabindex="0"><code>{{ faq.code }}</code></pre>
                </div>
              </Transition>
            </div>
          </div>
        </section>
      </div>
      <footer class="py-8">
        <div class="container px-4 mx-auto">
          <div class="flex flex-col items-center justify-between md:flex-row">
            <div class="flex mb-4 space-x-6 md:mb-0 md:order-2">
              <a href="https://github.com/LeonKohli/github-to-llm-context-converter" target="_blank" rel="noopener noreferrer" 
                 class="text-gray-600 transition-colors duration-300 dark:text-gray-300 hover:text-primary">
                <Icon name="mdi:github" class="w-6 h-6 transition-transform duration-300 transform hover:scale-110" />
              </a>
              <a href="https://x.com/LeonKohli" target="_blank" rel="noopener noreferrer" 
                 class="text-gray-600 transition-colors duration-300 dark:text-gray-300 hover:text-primary">
                <Icon name="mdi:twitter" class="w-6 h-6 transition-transform duration-300 transform hover:scale-110" />
              </a>
            </div>
            <div class="md:order-1">
              <p class="text-gray-600 dark:text-gray-300">&copy; {{ new Date().getFullYear() }} GitHub to LLM Context Converter</p>
              <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">Empowering developers with AI-friendly context</p>
            </div>
          </div>
          <div class="pt-6 mt-6 border-t border-gray-200 dark:border-gray-700">
            <p class="text-sm text-center text-gray-500 dark:text-gray-400">
              Made with <span class="text-red-500">&hearts;</span> by Leon Kohli. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  </div>
</template>
<script setup>
const githubState = useGithubState()
const { fetchRepo, fetchBranches, resetState, copyToClipboard, downloadXml } = useGithubActions()
const { showToast } = useToast()

const fetchRepoWithToast = async () => {
  try {
    const success = await fetchRepo()
    if (success) {
      showToast('Repository fetched successfully', 'success')
    }
  } catch (error) {
    console.error("Error in fetchRepoWithToast:", error)
  }
}

const copyToClipboardWithToast = async () => {
  const result = await copyToClipboard()
  showToast(result.message, result.success ? 'success' : 'error')
}

const downloadXmlWithToast = () => {
  const result = downloadXml()
  showToast(result.message, result.success ? 'success' : 'error')
}

const handleSaveApiKey = async (newApiKey) => {
  githubState.value.apiKey = newApiKey
  if (repoFetcher.value && githubState.value.repoUrl) {
    await repoFetcher.value.fetchBranches()
  }
  fetchRepoWithToast()
}

const faqs = ref([
  {
    icon: "mdi:help-circle",
    question: "What is the GitHub to LLM Context Converter used for?",
    answer: "This tool converts GitHub repositories into a format that's easily understood by Large Language Models (LLMs) like ChatGPT or Claude. It allows you to provide comprehensive context about your project to an AI, enabling more informed discussions, code reviews, or assistance with your work.",
    isOpen: false
  },
  {
    icon: "mdi:code-tags",
    question: "How does the XML output structure look?",
    answer: "The XML output follows this general structure:",
    code: `<llm_context>
  <repository>
    <metadata>...</metadata>
    <tree_structure>...</tree_structure>
    <contents>
      <file>
        <content><![CDATA[...]]></content>
      </file>
      ...
    </contents>
  </repository>
</llm_context>`,
    isOpen: false
  },
  {
    icon: "mdi:file-cog",
    question: "Can I customize which files are included in the output?",
    answer: "Yes, you can customize file inclusion using several options:",
    list: [
      "Use .gitignore patterns",
      "Apply standard ignore patterns",
      "Set a custom file size limit",
      "Specify custom ignore patterns"
    ],
    isOpen: false
  },
  {
    icon: "mdi:database",
    question: "How does the tool handle large repositories?",
    answer: "The converter processes repositories efficiently, but for very large repos, it may take some time. You can set a file size limit to exclude large files and use ignore patterns to focus on relevant content.",
    isOpen: false
  },
  {
    icon: "mdi:shield-check",
    question: "Is my GitHub API key safe?",
    answer: "Yes, your GitHub API key is securely stored in your browser using encryption and is never sent to our servers. It's only used client-side to authenticate requests to the GitHub API.",
    isOpen: false
  },
  {
    icon: "mdi:language-markdown",
    question: "Does the converter support all file types?",
    answer: "The converter supports all text-based file types commonly found in GitHub repositories, including but not limited to: source code files (e.g., .js, .py, .java), markup files (e.g., .md, .html), configuration files (e.g., .json, .yaml), and more. Binary files are excluded by default to optimize the output for LLM processing.",
    isOpen: false
  },
  {
    icon: "mdi:github",
    question: "Can I use this tool with private GitHub repositories?",
    answer: "Yes, you can use this tool with private GitHub repositories. You'll need to provide a GitHub API key with the necessary permissions to access your private repositories. The tool will then be able to fetch and process the content of your private repos securely.",
    isOpen: false
  },
  {
    icon: "mdi:refresh",
    question: "How often is the repository data updated?",
    answer: "The tool fetches the latest data from your GitHub repository each time you initiate the conversion process. This ensures that you're always working with the most up-to-date version of your codebase when interacting with LLMs.",
    isOpen: false
  },
])

const faqSchema = faqs.value.map(faq => ({
  "@type": "Question",
  "name": faq.question,
  "acceptedAnswer": {
    "@type": "Answer",
    "text": faq.answer + (faq.list ? ' ' + faq.list.join(', ') : '')
  }
}))

const repoFetcher = ref(null)
onUnmounted(() => {
  resetState()
})
useSeoMeta({
  ogImage: '/og-image-1200x630.png',
  twitterTitle: 'GitHub to LLM Context Converter',
  twitterDescription: 'Convert GitHub repositories to LLM-friendly context. Improve your interactions with ChatGPT, Claude, or any LLM by providing comprehensive project context for better understanding and assistance.',
  twitterImage: '/og-image-1200x630.png',
  twitterCard: 'summary_large_image'
})
useHead({
  link: [
    {
      rel: 'icon',
      type: 'image/x-icon',
      href: '/favicon.ico'
    }
  ]
})
</script>
<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>