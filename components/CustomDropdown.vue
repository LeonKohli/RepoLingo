<template>
  <div class="relative">
    <button @click="toggleDropdown" type="button" ref="buttonRef"
      class="w-full px-3 py-2 text-sm text-left text-gray-800 transition-all duration-300 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary hover:bg-gray-100 dark:bg-background-dark dark:text-gray-200 dark:border-gray-700 dark:hover:bg-background-light">
      <span v-if="loading" class="flex items-center">
        <Icon name="uil:spinner" class="mr-2 animate-spin" />
        Loading...
      </span>
      <span v-else>
        {{ selectedOption || placeholder }}
      </span>
      <Icon name="uil:angle-down" class="absolute transform -translate-y-1/2 right-3 top-1/2" />
    </button>
    <Teleport to="body">
      <transition name="fade">
        <ul v-if="isOpen && !loading" ref="dropdownRef"
          class="absolute z-[9999] mt-1 overflow-auto text-sm bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 dark:bg-background-dark dark:border-gray-700 dropdown-menu"
          :style="dropdownStyle">
          <transition-group name="list">
            <li v-for="option in options" :key="option" @click="selectOption(option)"
              class="px-3 py-2 transition-colors duration-200 cursor-pointer hover:bg-gray-100 dark:hover:bg-background-light">
              {{ option }}
            </li>
          </transition-group>
        </ul>
      </transition>
    </Teleport>
  </div>
</template>

<script setup>
const props = defineProps({
  modelValue: String,
  options: Array,
  placeholder: {
    type: String,
    default: 'Select an option'
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue'])

const isOpen = ref(false)
const selectedOption = ref(props.modelValue)
const buttonRef = ref(null)
const dropdownRef = ref(null)

watch(() => props.modelValue, (newValue) => {
  selectedOption.value = newValue
})

const dropdownStyle = computed(() => {
  if (!buttonRef.value) return {}
  const rect = buttonRef.value.getBoundingClientRect()
  return {
    top: `${window.scrollY + rect.bottom}px`,
    left: `${rect.left}px`,
    width: `${rect.width}px`
  }
})

const toggleDropdown = () => {
  isOpen.value = !isOpen.value
  if (isOpen.value) {
    nextTick(() => {
      updateDropdownPosition()
    })
  }
}

const updateDropdownPosition = () => {
  if (buttonRef.value && dropdownRef.value) {
    const buttonRect = buttonRef.value.getBoundingClientRect()
    const dropdownRect = dropdownRef.value.getBoundingClientRect()

    dropdownRef.value.style.top = `${window.scrollY + buttonRect.bottom}px`
    dropdownRef.value.style.left = `${buttonRect.left}px`
    dropdownRef.value.style.width = `${buttonRect.width}px`

    // Adjust vertical position if dropdown goes off-screen
    if (window.innerHeight < buttonRect.bottom + dropdownRect.height) {
      dropdownRef.value.style.top = `${window.scrollY + buttonRect.top - dropdownRect.height}px`
    }
  }
}

const selectOption = (option) => {
  selectedOption.value = option
  emit('update:modelValue', option)
  isOpen.value = false
}

// Close dropdown when clicking outside
const closeDropdown = (e) => {
  if (!e.target.closest('.relative')) {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', closeDropdown)
  window.addEventListener('scroll', updateDropdownPosition)
  window.addEventListener('resize', updateDropdownPosition)
})

onUnmounted(() => {
  document.removeEventListener('click', closeDropdown)
  window.removeEventListener('scroll', updateDropdownPosition)
  window.removeEventListener('resize', updateDropdownPosition)
})
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

.list-enter-active,
.list-leave-active {
  transition: all 0.3s ease;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.dropdown-menu {
  position: absolute;
  z-index: 9999;
}
</style>