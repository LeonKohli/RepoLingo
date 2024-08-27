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
  ]
})

useSeoMeta({
  description: props.description,
  keywords: props.keywords,
  ogTitle: props.title,
  ogDescription: props.description,
  ogType: 'website',
  ogImage: '/og-image.jpg', // Make sure to add an Open Graph image
  twitterCard: 'summary_large_image',
  twitterTitle: props.title,
  twitterDescription: props.description,
  twitterImage: '/twitter-image.jpg', // Make sure to add a Twitter image
})
</script>