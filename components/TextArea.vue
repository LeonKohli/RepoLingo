<template>
  <div>
    <label :for="id" class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">{{ label }}</label>
    <div class="relative">
      <textarea 
        :id="id" 
        :value="modelValue" 
        @input="handleInput"
        :placeholder="placeholder" 
        rows="3"
        class="w-full px-3 py-2 text-sm rounded-lg custom-input focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
      ></textarea>
      <div class="absolute top-0 left-0 w-full h-full pointer-events-none">
        <highlight-code :lang="language">
          {{ modelValue }}
        </highlight-code>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  id: String,
  label: String,
  modelValue: String,
  placeholder: String,
  language: {
    type: String,
    default: 'plaintext'
  }
})

const emit = defineEmits(['update:modelValue'])

const handleInput = (event) => {
  emit('update:modelValue', event.target.value)
}
</script>

<style scoped>
.custom-input {
  background-color: transparent;
  z-index: 1;
}

.highlight-code {
  z-index: 0;
}
</style>