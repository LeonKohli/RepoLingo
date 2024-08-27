<template>
  <div class="fixed bottom-0 right-0 z-50 p-4 mb-8 space-y-4">
    <transition-group name="fade">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        class="max-w-xs p-4 rounded-lg shadow-lg"
        :class="{
          'bg-blue-500 text-white': toast.type === 'info',
          'bg-green-500 text-white': toast.type === 'success',
          'bg-red-500 text-white': toast.type === 'error'
        }"
      >
        {{ toast.message }}
      </div>
    </transition-group>
  </div>
</template>

<script setup>
defineProps({
  toasts: Array,
})
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>