import { ref, watch } from 'vue'

const STORAGE_KEY = 'glpi-theme'

const theme = ref(
  localStorage.getItem(STORAGE_KEY) ||
    (window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
)

const applyTheme = (value) => {
  document.documentElement.dataset.theme = value
  localStorage.setItem(STORAGE_KEY, value)
}

const toggleTheme = () => {
  theme.value = theme.value === 'light' ? 'dark' : 'light'
}

watch(theme, (value) => applyTheme(value), { immediate: true })

export function useTheme() {
  return {
    theme,
    toggleTheme,
    applyTheme
  }
}
