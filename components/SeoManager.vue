<template>
  <!-- This component doesn't render anything visible -->
</template>

<script setup>
const props = defineProps({
  title: {
    type: String,
    default: 'GitHub to LLM Context Converter | Enhance Your AI Interactions'
  },
  description: {
    type: String,
    default: 'Convert GitHub repositories to LLM-friendly context. Improve your interactions with ChatGPT, Claude, or any LLM by providing comprehensive project context for better understanding and assistance.'
  },
  keywords: {
    type: String,
    default: 'GitHub, LLM, AI, XML, context converter, ChatGPT, Claude, project understanding, code assistance, AI interaction'
  },
  faqSchema: {
    type: Array,
    default: () => []
  },
  canonicalUrl: {
    type: String,
    default: 'https://llm-context.leonkohli.dev'
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
  ogTitle: props.title,
  ogDescription: props.description,
  ogType: 'website',
  ogImage: '/og-image-1200x630.png',
  ogImageWidth: 1200,
  ogImageHeight: 630,
  twitterCard: 'summary_large_image',
  twitterTitle: props.title,
  twitterDescription: props.description,
  twitterImage: '/twitter-image-1200x600.png',
  twitterImageWidth: 1200,
  twitterImageHeight: 600,
})
</script>