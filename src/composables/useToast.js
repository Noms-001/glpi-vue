// @ts-nocheck
import { ref } from 'vue'

// Store toast instance globally
let toastInstance = null

export const useToast = () => {
  // Return methods that will use the global instance
  const showSuccess = (message, duration = 5000) => {
    if (toastInstance) {
      toastInstance.success(message, duration)
    } else {
      console.warn('Toast component not mounted yet')
    }
  }
  
  const showError = (message, duration = 5000) => {
    if (toastInstance) {
      toastInstance.error(message, duration)
    } else {
      console.warn('Toast component not mounted yet')
    }
  }
  
  const showInfo = (message, duration = 5000) => {
    if (toastInstance) {
      toastInstance.info(message, duration)
    } else {
      console.warn('Toast component not mounted yet')
    }
  }
  
  const showWarning = (message, duration = 5000) => {
    if (toastInstance) {
      toastInstance.warning(message, duration)
    } else {
      console.warn('Toast component not mounted yet')
    }
  }
  
  const setToastInstance = (instance) => {
    toastInstance = instance
  }
  
  return {
    showSuccess,
    showError,
    showInfo,
    showWarning,
    setToastInstance
  }
}