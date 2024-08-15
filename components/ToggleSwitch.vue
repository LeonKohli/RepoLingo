<template>
  <div class="flex items-center justify-between">
    <span class="text-sm font-medium text-gray-700 dark:text-gray-300">{{ label }}</span>
    <label class="relative inline-flex items-center cursor-pointer">
      <input type="checkbox" :checked="modelValue" @change="$emit('update:modelValue', $event.target.checked)"
        class="sr-only peer">
      <div
        class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600">
      </div>
    </label>
  </div>
</template>

<script setup>
const props = defineProps({
  label: String,
  modelValue: Boolean
})

const emit = defineEmits(['update:modelValue'])
</script>