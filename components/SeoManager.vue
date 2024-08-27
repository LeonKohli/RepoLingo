<template>
  <!-- This component doesn't render anything visible -->
</template>

<script setup>
const props = defineProps({
  title: {
    type: String,
    default: 'GitHub to LLM Context Converter'
  },
  description: {
    type: String,
    default: 'Convert GitHub repositories to LLM-friendly context. Optimize your AI training data with our advanced, customizable tool.'
  },
  keywords: {
    type: String,
    default: 'GitHub, LLM, AI, context, converter, repository, machine learning'
  }
})

useHead({
  title: props.title,
  meta: [
    { name: 'description', content: props.description },
    { name: 'keywords', content: props.keywords },
    { property: 'og:title', content: props.title },
    { property: 'og:description', content: props.description },
    { property: 'og:type', content: 'website' },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: props.title },
    { name: 'twitter:description', content: props.description },
  ]
})
</script>