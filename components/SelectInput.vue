<template>
  <div>
    <label :for="id" class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">{{ label }}</label>
    <select :id="id" :value="modelValue" @change="$emit('update:modelValue', $event.target.value)"
      class="w-full py-2 pl-3 pr-10 text-sm rounded-lg custom-input focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
      <option value="">Select an option</option>
      <option v-for="option in options" :key="option" :value="option">{{ option }}</option>
    </select>
  </div>
</template>

<script setup>
const props = defineProps({
  id: String,
  label: String,
  modelValue: String,
  options: Array
})

defineEmits(['update:modelValue'])
</script>
