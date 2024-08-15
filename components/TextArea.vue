<template>
  <div>
    <label :for="id" class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">{{ label }}</label>
    <textarea :id="id" :value="modelValue" @input="$emit('update:modelValue', $event.target.value)"
      :placeholder="placeholder" rows="3"
      class="w-full px-3 py-2 text-sm rounded-lg custom-input focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"></textarea>
  </div>
</template>

<script setup>
const props = defineProps({
  id: String,
  label: String,
  modelValue: String,
  placeholder: String
})

defineEmits(['update:modelValue'])
</script>