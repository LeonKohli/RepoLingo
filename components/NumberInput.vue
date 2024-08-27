<template>
  <div>
    <label :for="id" class="block mb-2 text-sm font-medium text-gray-300">{{ label }}</label>
    <input 
      :id="id" 
      :value="modelValue" 
      @input="$emit('update:modelValue', $event.target.value)" 
      type="number"
      :min="min"
      :step="step"
      class="w-full px-3 py-2 text-sm text-gray-800 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700"
    />
  </div>
</template>

<script setup>
defineProps({
  id: String,
  label: String,
  modelValue: [Number, String],
  min: Number,
  step: Number
})

defineEmits(['update:modelValue'])
</script>
