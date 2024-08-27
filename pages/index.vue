<template>
  <div class="min-h-screen text-white transition-colors duration-300 bg-gradient-to-br from-[#0f172a] to-[#1e293b]">
    <SeoManager :faqSchema="faqSchema" />
    <main class="container max-w-full px-4 py-2">
      <div class="flex flex-col gap-8 lg:flex-row" style="min-height: calc(100vh - 6rem);">
        <!-- Left column: RepositoryFetcher and Settings -->
        <div class="w-full space-y-8 lg:w-1/3">
          <RepositoryFetcher
            v-model:repoUrl="githubState.repoUrl"
            v-model:selectedBranch="githubState.selectedBranch"
            v-model:branches="githubState.branches"
            @fetch-repo="fetchRepoWithToast" 
          />

          <Settings 
            v-model:useGitignore="githubState.useGitignore"
            v-model:useStandardIgnore="githubState.useStandardIgnore" 
            v-model:includeTree="githubState.includeTree"
            v-model:fileSizeLimit="githubState.fileSizeLimit"
            v-model:customIgnore="githubState.customIgnore"
            v-model:apiKey="githubState.apiKey"
          />
        </div>

        <!-- Right column: Output -->
        <div class="w-full lg:w-2/3">
          <Output 
            :loading="githubState.loading" 
            :output="githubState.output"
            @copy="copyToClipboardWithToast" 
            @download="downloadXmlWithToast" 
            class="h-full"
          />
        </div>
      </div>
    </main>

    <ToastNotifications :toasts="toasts" />
    <ApiKeyModal 
      v-model:show="githubState.showApiKeyModal"
      @save="saveApiKey"
    />

    <!-- SEO content with spacing -->
    <div class="mt-32 ">
      <div class="container max-w-3xl px-4 py-16 mx-auto">
        <section class="mb-16 text-center">
          <h1 class="mb-8 text-4xl font-bold text-primary">GitHub to LLM Context Converter</h1>

          <h2 class="mb-4 text-2xl font-semibold text-white">Enhance Your AI Interactions</h2>
          <p class="mb-4 text-gray-300">
            Our GitHub to LLM Context Converter is a powerful tool designed to transform GitHub repositories into LLM-friendly context. 
            This innovative solution helps users provide comprehensive project information to AI models like ChatGPT, Claude, or any other LLM, enabling more effective communication and assistance.
          </p>
          <p class="text-gray-300">
            With customizable settings and efficient processing, you can easily convert complex repository structures into a format that's perfect for in-depth discussions about your projects with AI assistants.
          </p>
        </section>

        <section class="mb-16">
          <h2 class="mb-6 text-3xl font-semibold text-center text-primary">Frequently Asked Questions</h2>
          <div class="space-y-4">
            <details class="p-4 rounded-lg bg-background-light">
              <summary class="text-xl font-medium text-white cursor-pointer hover:text-primary">What is the GitHub to LLM Context Converter used for?</summary>
              <p class="mt-2 text-gray-300">This tool converts GitHub repositories into a format that's easily understood by Large Language Models (LLMs) like ChatGPT or Claude. It allows you to provide comprehensive context about your project to an AI, enabling more informed discussions, code reviews, or assistance with your work.</p>
            </details>
            <details class="p-4 rounded-lg bg-background-light">
              <summary class="text-xl font-medium text-white cursor-pointer hover:text-primary">How does the XML output structure look?</summary>
              <p class="mt-2 text-gray-300">The XML output follows this general structure:</p>
              <pre 
                class="w-full px-3 py-2 mt-2 text-sm text-gray-800 whitespace-pre-wrap bg-gray-100 border border-gray-300 rounded-lg focus:outline-none dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700"
                tabindex="0"
              ><code>&lt;llm_context&gt;
  &lt;repository&gt;
    &lt;metadata&gt;...&lt;/metadata&gt;
    &lt;tree_structure&gt;...&lt;/tree_structure&gt;
    &lt;contents&gt;
      &lt;file&gt;
        &lt;content&gt;&lt;![CDATA[...]]&gt;&lt;/content&gt;
      &lt;/file&gt;
      ...
    &lt;/contents&gt;
  &lt;/repository&gt;
&lt;/llm_context&gt;</code></pre>
            </details>
            <details class="p-4 rounded-lg bg-background-light">
              <summary class="text-xl font-medium text-white cursor-pointer hover:text-primary">Can I customize which files are included in the output?</summary>
              <p class="mt-2 text-gray-300">Yes, you can customize file inclusion using several options:</p>
              <ul class="mt-2 text-gray-300 list-disc list-inside">
                <li>Use .gitignore patterns</li>
                <li>Apply standard ignore patterns</li>
                <li>Set a custom file size limit</li>
                <li>Specify custom ignore patterns</li>
              </ul>
            </details>
            <details class="p-4 rounded-lg bg-background-light">
              <summary class="text-xl font-medium text-white cursor-pointer hover:text-primary">How does the tool handle large repositories?</summary>
              <p class="mt-2 text-gray-300">The converter processes repositories efficiently, but for very large repos, it may take some time. You can set a file size limit to exclude large files and use ignore patterns to focus on relevant content.</p>
            </details>
            <details class="p-4 rounded-lg bg-background-light">
              <summary class="text-xl font-medium text-white cursor-pointer hover:text-primary">Is my GitHub API key safe?</summary>
              <p class="mt-2 text-gray-300">Yes, your GitHub API key is securely stored in your browser using encryption and is never sent to our servers. It's only used client-side to authenticate requests to the GitHub API.</p>
            </details>
          </div>
        </section>
      </div>

      <footer class="py-6 text-center text-gray-400 ">
        <p>&copy; {{ new Date().getFullYear() }} GitHub to LLM Context Converter. All rights reserved.</p>
      </footer>
    </div>
  </div>
</template>

<script setup>
import SeoManager from '~/components/SeoManager.vue'

const githubState = useGithubState()
const { fetchRepo, fetchBranches, resetState, copyToClipboard, downloadXml, setApiKey } = useGithubActions()

const toasts = ref([])
let toastId = 0

const showToast = (message, type = 'info') => {
  const id = toastId++
  toasts.value.push({ id, message, type })
  setTimeout(() => {
    toasts.value = toasts.value.filter(t => t.id !== id)
  }, 3000)
}

const fetchRepoWithToast = async () => {
  try {
    await fetchRepo()
    if (githubState.value.error) {
      const customErrorMessage = getCustomErrorMessage(githubState.value.error)
      showToast(customErrorMessage, 'error')
    } else {
      showToast('Repository fetched successfully', 'success')
    }
  } catch (error) {
    const customErrorMessage = getCustomErrorMessage(error.message)
    showToast(customErrorMessage, 'error')
  }
}

const getCustomErrorMessage = (errorMessage) => {
  if (errorMessage.includes('Repository not found') || errorMessage.includes('not found')) {
    return "Oops! We couldn't find that repository. Double-check the URL and try again."
  }
  if (errorMessage.includes('API rate limit exceeded')) {
    return "Oops! We've hit GitHub's API rate limit. Try adding your GitHub API key in the settings or wait a bit before trying again."
  }
  if (errorMessage.includes('Network Error')) {
    return "Looks like the internet gremlins are at it again. Check your connection and give it another shot."
  }
  // Add more custom error messages as needed
  return "Something went wrong. Let's give it another try!"
}

const copyToClipboardWithToast = async () => {
  const result = await copyToClipboard()
  showToast(result.message, result.success ? 'success' : 'error')
}

const downloadXmlWithToast = () => {
  const result = downloadXml()
  showToast(result.message, result.success ? 'success' : 'error')
}

const saveApiKey = (newApiKey) => {
  setApiKey(newApiKey)
  showToast('API key saved successfully', 'success')
  if (githubState.value.repoUrl) {
    fetchBranches()
  }
}

const faqSchema = [
  {
    "@type": "Question",
    "name": "What is the GitHub to LLM Context Converter used for?",
    "acceptedAnswer": {
      "@type": "Answer",
      "text": "This tool converts GitHub repositories into a format that's easily understood by Large Language Models (LLMs) like ChatGPT or Claude. It allows you to provide comprehensive context about your project to an AI, enabling more informed discussions, code reviews, or assistance with your work."
    }
  },
  {
    "@type": "Question",
    "name": "How does the XML output structure look?",
    "acceptedAnswer": {
      "@type": "Answer",
      "text": "The XML output follows this general structure: <llm_context><repository><metadata>...</metadata><tree_structure>...</tree_structure><contents><file><content><![CDATA[...]]></content></file>...</contents></repository></llm_context>"
    }
  },
  {
    "@type": "Question",
    "name": "Can I customize which files are included in the output?",
    "acceptedAnswer": {
      "@type": "Answer",
      "text": "Yes, you can customize file inclusion using several options: Use .gitignore patterns, Apply standard ignore patterns, Set a custom file size limit, Specify custom ignore patterns."
    }
  },
  {
    "@type": "Question",
    "name": "How does the tool handle large repositories?",
    "acceptedAnswer": {
      "@type": "Answer",
      "text": "The converter processes repositories efficiently, but for very large repos, it may take some time. You can set a file size limit to exclude large files and use ignore patterns to focus on relevant content."
    }
  },
  {
    "@type": "Question",
    "name": "Is my GitHub API key safe?",
    "acceptedAnswer": {
      "@type": "Answer",
      "text": "Yes, your GitHub API key is securely stored in your browser using encryption and is never sent to our servers. It's only used client-side to authenticate requests to the GitHub API."
    }
  }
]

onUnmounted(() => {
  resetState()
})
</script>