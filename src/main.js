import { createApp } from 'vue'

import App from './App.vue'
import router from './router'
import { useTheme } from './composables/useTheme.js'
import 'bootstrap-icons/font/bootstrap-icons.css'
import 'bootstrap/dist/css/bootstrap.min.css'

useTheme()

const app = createApp(App).use(router).mount('#app')
