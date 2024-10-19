<template>
  <div class="file-tree-selector">
    <ul>
      <FileTreeNode
        v-for="node in treeData"
        :key="node.path"
        :node="node"
        v-model="selectedPaths"
      />
    </ul>
  </div>
</template>

<script setup lang="ts">

const props = defineProps({
  treeData: {
    type: Array as PropType<any[]>,
    default: () => [],
  },
  modelValue: {
    type: Array as PropType<string[]>,
    default: () => [],
  },
});

const emit = defineEmits(['update:modelValue']);

const selectedPaths = ref(props.modelValue);

watch(
  () => props.modelValue,
  (newValue) => {
    selectedPaths.value = newValue;
  }
);

watch(selectedPaths, (newValue) => {
  emit('update:modelValue', newValue);
});
</script>

<style scoped>
/* Add custom styles here */
</style>
