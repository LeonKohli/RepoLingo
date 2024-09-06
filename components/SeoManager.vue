<template>
  <div style="display: none;">
    <!-- This component doesn't render anything visible, but we need a root element -->
  </div>
</template>

<script setup>
const props = defineProps({
  title: {
    type: String,
    default: 'RepoLingo - Convert GitHub Repositories to LLM-ready Data'
  },
  description: {
    type: String,
    default: 'Turn any GitHub Repository into LLM-ready data. Improve ChatGPT, Claude, or any LLM by providing comprehensive project context for better understanding and assistance.'
  },
  keywords: {
    type: String,
    default: 'RepoLingo, GitHub, LLM, AI, XML, Github converter, ChatGPT, Claude, project understanding, code assistance, repository converter'
  },
  faqSchema: {
    type: Array,
    default: () => []
  },
  canonicalUrl: {
    type: String,
    default: 'https://repolingo.leonkohli.dev'
  }
})

useHead({
  title: props.title,
  htmlAttrs: {
    lang: 'en'
  },
  script: [
    {
      type: 'application/ld+json',
      children: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": props.faqSchema
      })
    }
  ],
  link: [
    {
      rel: 'canonical',
      href: props.canonicalUrl
    }
  ]
})

useSeoMeta({
  description: props.description,
  keywords: props.keywords,
})
</script>