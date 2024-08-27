<template>
  <div>
    <label :for="id" class="block mb-2 text-sm font-medium text-gray-300">{{ label }}</label>
    <div class="relative">
      <textarea 
        :id="id" 
        :value="modelValue" 
        @input="handleInput"
        :placeholder="placeholder" 
        :rows="rows"
        class="w-full px-3 py-2 text-sm text-gray-800 transition-all duration-300 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700"
      ></textarea>
    </div>
  </div>
</template>

<script setup>
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
.highlight-code {
  z-index: 0;
}
</style>