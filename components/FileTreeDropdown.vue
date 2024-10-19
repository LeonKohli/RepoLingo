<template>
    <div class="relative">
      <button
        @click="toggleDropdown"
        type="button"
        ref="buttonRef"
        class="w-full px-3 py-2 text-sm text-left text-gray-800 transition-all duration-300 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary hover:bg-gray-100 dark:bg-background-dark dark:text-gray-200 dark:border-gray-700 dark:hover:bg-background-light"
      >
        <span v-if="loading">
          <Icon name="uil:spinner" class="mr-2 animate-spin" />
          Loading...
        </span>
        <span v-else>
          {{ selectedCount }} item{{ selectedCount !== 1 ? 's' : '' }} selected
        </span>
        <Icon name="uil:angle-down" class="absolute transform -translate-y-1/2 right-3 top-1/2" />
      </button>
      <Teleport to="body">
        <transition name="fade">
          <div
            v-if="isOpen && !loading"
            ref="dropdownRef"
            class="absolute z-[9999] mt-1 overflow-auto text-sm bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 dark:bg-background-dark dark:border-gray-700 dropdown-menu"
            :style="dropdownStyle"
          >
            <div class="p-2">
              <div class="flex items-center mb-2">
                <input
                  v-model="searchQuery"
                  type="text"
                  placeholder="Search files..."
                  class="flex-grow px-2 py-1 text-sm border border-gray-300 rounded dark:bg-background-dark dark:border-gray-700"
                  @click.stop
                />
                <button
                  @click="unselectAll"
                  class="flex items-center justify-center p-1 ml-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 focus:outline-none"
                  title="Unselect All"
                >
                  <Icon name="uil:times-circle" class="w-5 h-5" />
                </button>
              </div>
              <ul class="space-y-1">
                <FileTreeNode
                  v-for="node in filteredTreeData"
                  :key="node.path"
                  :node="node"
                  v-model="selectedPaths"
                  @update:modelValue="handleNodeUpdate"
                />
              </ul>
            </div>
          </div>
        </transition>
      </Teleport>
    </div>
  </template>

<script setup>

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => [],
  },
  treeData: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
  repoUrl: {
    type: String,
    default: '',
  },
  selectedBranch: {
    type: String,
    default: '',
  },
});

const emit = defineEmits(['update:modelValue']);

const isOpen = ref(false);
const selectedPaths = ref(props.modelValue);
const buttonRef = ref(null);
const dropdownRef = ref(null);
const searchQuery = ref('');

const selectedCount = computed(() => selectedPaths.value.length);

const filteredTreeData = computed(() => {
  if (!searchQuery.value) return props.treeData;
  return filterTree(props.treeData, searchQuery.value.toLowerCase());
});

const dropdownStyle = computed(() => {
  if (!buttonRef.value) return {};
  const rect = buttonRef.value.getBoundingClientRect();
  return {
    top: `${window.scrollY + rect.bottom}px`,
    left: `${rect.left}px`,
    width: `${rect.width}px`,
  };
});

const toggleDropdown = () => {
  isOpen.value = !isOpen.value;
  if (isOpen.value) {
    nextTick(() => {
      updateDropdownPosition();
    });
  }
};

const updateDropdownPosition = () => {
  if (buttonRef.value && dropdownRef.value) {
    const buttonRect = buttonRef.value.getBoundingClientRect();
    const dropdownRect = dropdownRef.value.getBoundingClientRect();

    dropdownRef.value.style.top = `${window.scrollY + buttonRect.bottom}px`;
    dropdownRef.value.style.left = `${buttonRect.left}px`;
    dropdownRef.value.style.width = `${buttonRect.width}px`;

    if (window.innerHeight < buttonRect.bottom + dropdownRect.height) {
      dropdownRef.value.style.top = `${window.scrollY + buttonRect.top - dropdownRect.height}px`;
    }
  }
};

const filterTree = (tree, query) => {
  return tree
    .map((node) => {
      if (node.name.toLowerCase().includes(query)) {
        return node;
      }
      if (node.children) {
        const filteredChildren = filterTree(node.children, query);
        if (filteredChildren.length > 0) {
          return {
            ...node,
            children: filteredChildren,
          };
        }
      }
      return null;
    })
    .filter((node) => node !== null);
};

const handleNodeUpdate = (newValue) => {
  selectedPaths.value = newValue;
  emit('update:modelValue', newValue);
};

const unselectAll = () => {
  selectedPaths.value = [];
  emit('update:modelValue', []);
};

watch(selectedPaths, (newValue) => {
  emit('update:modelValue', newValue);
});

watch(
  () => props.repoUrl,
  () => {
    resetSelection();
  }
);

watch(
  () => props.selectedBranch,
  () => {
    resetSelection();
  }
);

const resetSelection = () => {
  selectedPaths.value = [];
  searchQuery.value = '';
  emit('update:modelValue', []);
};

// Updated closeDropdown function
const closeDropdown = (e) => {
  if (
    isOpen.value &&
    !buttonRef.value.contains(e.target) &&
    !dropdownRef.value.contains(e.target)
  ) {
    isOpen.value = false;
  }
};

onMounted(() => {
  document.addEventListener('click', closeDropdown);
  window.addEventListener('scroll', updateDropdownPosition);
  window.addEventListener('resize', updateDropdownPosition);
});

onUnmounted(() => {
  document.removeEventListener('click', closeDropdown);
  window.removeEventListener('scroll', updateDropdownPosition);
  window.removeEventListener('resize', updateDropdownPosition);
});
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.dropdown-menu {
  position: absolute;
  z-index: 9999;
}
</style>

