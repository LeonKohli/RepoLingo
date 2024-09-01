import { ref, reactive } from 'vue'

const toasts = ref([])
let toastId = 0

export const useToast = () => {
  const showToast = (message, type = 'info', duration = 3000) => {
    const id = toastId++
    const toast = reactive({ 
      id, 
      message, 
      type, 
      progress: 100, 
      startTime: Date.now(), 
      duration,
      isPaused: false,
      pauseTime: null
    })
    toasts.value.push(toast)
    startToastTimer(toast)
  }

  const startToastTimer = (toast) => {
    const updateProgress = () => {
      if (!toast.isPaused) {
        const elapsed = Date.now() - toast.startTime
        toast.progress = 100 - (elapsed / toast.duration) * 100
        if (toast.progress > 0) {
          requestAnimationFrame(updateProgress)
        } else {
          removeToast(toast)
        }
      }
    }
    requestAnimationFrame(updateProgress)
  }

  const removeToast = (toast) => {
    toasts.value = toasts.value.filter(t => t.id !== toast.id)
  }

  const pauseToast = (toast) => {
    toast.isPaused = true
    toast.pauseTime = Date.now()
  }

  const resumeToast = (toast) => {
    if (toast.pauseTime) {
      toast.startTime += Date.now() - toast.pauseTime
      toast.isPaused = false
      toast.pauseTime = null
      startToastTimer(toast)
    }
  }

  return {
    toasts,
    showToast,
    pauseToast,
    resumeToast,
    removeToast
  }
}