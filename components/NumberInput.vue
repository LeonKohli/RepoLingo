<template>
  <div>
    <label :for="id" class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">{{ label }}</label>
    <input :id="id" type="number" :value="modelValue" @input="$emit('update:modelValue', $event.target.value)"
      :min="min" :max="max"
      class="w-full px-4 py-2 text-sm rounded-lg custom-input focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
  </div>
</template>

<script setup>

const props = defineProps({
  id: String,
  label: String,
  modelValue: Number,
  min: Number,
  max: Number
})

defineEmits(['update:modelValue'])
</script>
