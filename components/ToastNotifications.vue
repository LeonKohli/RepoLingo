<template>
  <div class="fixed bottom-4 right-4 z-50 space-y-2">
    <TransitionGroup name="fade">
      <div v-for="toast in toasts" :key="toast.id" 
           class="p-4 rounded-lg shadow-lg text-white max-w-sm"
           :class="toastClasses[toast.type]">
        {{ toast.message }}
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup>
const props = defineProps({
  toasts: Array
})

const toastClasses = {
  success: 'bg-green-500',
  error: 'bg-red-500',
  info: 'bg-blue-500'
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(30px);
}
</style>