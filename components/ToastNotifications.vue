<template>
  <ClientOnly>
    <div class="fixed bottom-0 right-0 z-50 p-4 mb-8 space-y-6">
      <TransitionGroup name="toast" tag="div">
        <div v-for="toast in toasts" :key="toast.id"
          class="relative max-w-xs p-4 mb-2 transition-all duration-500 ease-in-out transform border border-white rounded-lg shadow-lg backdrop-filter backdrop-blur-sm border-opacity-10"
          :class="{
            'bg-primary bg-opacity-80 text-white': toast.type === 'info',
            'bg-green-500 bg-opacity-80 text-white': toast.type === 'success',
            'bg-red-500 bg-opacity-80 text-white': toast.type === 'error'
          }"
          @mouseenter="pauseToast(toast)"
          @mouseleave="resumeToast(toast)">
          {{ toast.message }}
          <div class="absolute bottom-0 left-0 h-1 transition-all duration-100 ease-linear bg-white bg-opacity-30"
            :style="{ width: `${toast.progress}%`, transitionDuration: toast.isPaused ? '0s' : '0.1s' }">
          </div>
        </div>
      </TransitionGroup>
    </div>
  </ClientOnly>
</template>

<script setup>
const { toasts, pauseToast, resumeToast } = useToast()
</script>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(100%) scale(0.5) rotate(10deg);
}
.toast-leave-to {
  transform: translateX(100%) scale(0.8) rotate(-10deg);
}
.toast-move {
  transition: transform 0.5s ease;
}
</style>