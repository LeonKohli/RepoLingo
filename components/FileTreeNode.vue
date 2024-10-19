<!-- In FileTreeNode.vue -->
<template>
  <li>
    <div class="flex items-center">
      <input
        type="checkbox"
        :checked="isChecked"
        @change="toggleSelection"
        class="mr-2 rounded text-primary focus:ring-primary"
      />
      <span @click="toggleCollapse" class="flex items-center cursor-pointer">
        <Icon
          v-if="node.type === 'dir'"
          :name="isCollapsed ? 'mdi:folder' : 'mdi:folder-open'"
          class="w-5 h-5 mr-1 text-primary"
        />
        <Icon v-else name="mdi:file" class="w-5 h-5 mr-1 text-gray-500" />
        <span class="text-sm text-gray-800 dark:text-gray-200">
          {{ node.name }}
        </span>
      </span>
    </div>
    <ul v-if="node.children && !isCollapsed" class="ml-6">
      <FileTreeNode
        v-for="child in node.children"
        :key="child.path"
        :node="child"
        v-model="selectedPaths"
      />
    </ul>
  </li>
</template>


<script setup lang="ts">
import { ref, computed, watch } from 'vue'

const props = defineProps({
  node: {
    type: Object as PropType<any>,
    required: true,
  },
  modelValue: {
    type: Array as PropType<string[]>,
    default: () => [],
  },
});

const emit = defineEmits(['update:modelValue']);

const isCollapsed = ref(true);
const selectedPaths = ref(props.modelValue);

const isChecked = computed(() => selectedPaths.value.includes(props.node.path));

const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value;
};

const toggleSelection = () => {
  if (isChecked.value) {
    selectedPaths.value = selectedPaths.value.filter((path) => !path.startsWith(props.node.path));
  } else {
    addPathRecursively(props.node);
  }
  emit('update:modelValue', selectedPaths.value);
};

const addPathRecursively = (node: any) => {
  selectedPaths.value.push(node.path);
  if (node.children) {
    node.children.forEach((child: any) => addPathRecursively(child));
  }
};

watch(
  () => props.modelValue,
  (newValue) => {
    selectedPaths.value = newValue;
  }
);
</script>

<style scoped>
/* Add custom styles here */
</style>
