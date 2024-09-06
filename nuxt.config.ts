// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: true },
  css: ['~/assets/css/main.css'],
  modules: ['@nuxtjs/tailwindcss', '@nuxt/icon', '@nuxtjs/color-mode', '@nuxtjs/seo'],
  colorMode: {
    classSuffix: ''
  },
  site: {
    url: 'https://llm-context.leonkohli.dev/',
    name: 'RepoLingo',
    description: 'RepoLingo - Convert GitHub Repositories to LLM-ready Data',
    defaultLocale: 'en'
  },
  app: {
    head: {
      title: 'RepoLingo - Convert GitHub Repositories to LLM-ready Data',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { hid: 'description', name: 'description', content: 'RepoLingo - Convert GitHub Repositories to LLM-ready Data' }
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
      ],
      script: [
        { src: process.env.UMAMI_SCRIPT_URL || '', defer: true, 'data-website-id': process.env.UMAMI_WEBSITE_ID || '' }
      ]
    }
  }
})
