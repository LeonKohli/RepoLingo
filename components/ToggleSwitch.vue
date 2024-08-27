<template>
  <label class="relative inline-flex items-center cursor-pointer group">
    <input type="checkbox" :checked="modelValue" class="sr-only peer" @change="$emit('update:modelValue', $event.target.checked)">
    <div class="w-14 h-8 bg-secondary peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-dark peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-secondary after:border after:rounded-full after:h-6 after:w-6 after:transition-all dark:border-secondary peer-checked:bg-primary overflow-hidden">
    </div>
    <span class="ml-3 text-sm font-medium transition-colors duration-300 text-dark dark:text-light group-hover:text-primary dark:group-hover:text-primary-400">{{ modelValue ? 'Enabled' : 'Disabled' }}</span>
  </label>
</template>

<script setup>
const props = defineProps({
  modelValue: Boolean,
})

const emit = defineEmits(['update:modelValue'])
</script>