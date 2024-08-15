<template>
  <section class="p-6 transition-all duration-300 bg-white shadow-lg dark:bg-gray-800 rounded-2xl hover:shadow-xl">
    <h2 class="mb-6 text-2xl font-semibold text-gray-800 dark:text-gray-200">Settings</h2>
    <div class="space-y-6">
      <ToggleSwitch label="Use .gitignore" :modelValue="useGitignore"
        @update:modelValue="$emit('update:useGitignore', $event)" />
      <ToggleSwitch label="Use standard ignores" :modelValue="useStandardIgnore"
        @update:modelValue="$emit('update:useStandardIgnore', $event)" />
      <div>
        <label for="file-size-limit" class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">File size
          limit (KB)</label>
        <IconInput id="file-size-limit" :modelValue="fileSizeLimit"
          @update:modelValue="$emit('update:fileSizeLimit', Number($event))" type="number" :min="1" :max="10000"
          icon-name="uil:file-alt" />
      </div>
      <div>
        <label for="branch-select" class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Select a
          branch</label>
        <div class="relative">
          <select id="branch-select" :value="selectedBranch"
            @change="$emit('update:selectedBranch', $event.target.value)"
            class="block w-full px-4 py-2 pr-8 leading-tight text-gray-700 bg-white border border-gray-300 rounded appearance-none dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 focus:outline-none focus:border-blue-500">
            <option v-for="branch in branches" :key="branch" :value="branch">{{ branch }}</option>
          </select>
          <div class="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
            <svg class="w-4 h-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
              <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
            </svg>
          </div>
        </div>
      </div>
      <TextArea label="Custom ignore patterns" :modelValue="customIgnore"
        @update:modelValue="$emit('update:customIgnore', $event)" placeholder="Custom ignore patterns (one per line)" />
    </div>
  </section>
</template>

<script setup>
const props = defineProps({
  useGitignore: Boolean,
  useStandardIgnore: Boolean,
  fileSizeLimit: Number,
  selectedBranch: String,
  customIgnore: String,
  branches: Array
})

const emit = defineEmits(['update:useGitignore', 'update:useStandardIgnore', 'update:fileSizeLimit', 'update:selectedBranch', 'update:customIgnore'])
</script>