<script setup>
import { computed, onMounted, ref, watch, provide } from 'vue'
import { useRoute } from 'vue-router'
import Sidebar from '../components/partials/SideBar.vue'
import Navbar from '../components/partials/NavBar.vue'
import Footer from '../components/partials/Footer.vue'
import BaseToast from '../components/base/BaseToast.vue'
import { useToast } from '../composables/useToast'

const route = useRoute()
const sidebarCollapsed = ref(false)
const mobileSidebarOpen = ref(false)
const searchQuery = ref('')
const theme = ref(
    localStorage.getItem('glpi-theme') ||
    (window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
)

const toastRef = ref(null)
const { setToastInstance } = useToast()

const isStandalonePage = computed(() => route.path === '/backoffice/login')

/** @param {string} value */
const applyTheme = (value) => {
    document.documentElement.dataset.theme = value
    localStorage.setItem('glpi-theme', value)
}

const toggleTheme = () => {
    theme.value = theme.value === 'light' ? 'dark' : 'light'
}

const toggleSidebar = () => {
    sidebarCollapsed.value = !sidebarCollapsed.value
}

const openMobileSidebar = () => {
    mobileSidebarOpen.value = true
}

const closeMobileSidebar = () => {
    mobileSidebarOpen.value = false
}

provide('sidebarCollapsed', sidebarCollapsed)
provide('mobileSidebarOpen', mobileSidebarOpen)
provide('theme', theme)
provide('toggleSidebar', toggleSidebar)
provide('toggleTheme', toggleTheme)
provide('openMobileSidebar', openMobileSidebar)
provide('closeMobileSidebar', closeMobileSidebar)

watch(theme, (value) => applyTheme(value), { immediate: true })
onMounted(() => {
    applyTheme(theme.value)
    if (toastRef.value) {
        setToastInstance(toastRef.value)
    }
})
</script>

<template>
    <div class="app-shell"
        :class="{ 
            'collapsed': sidebarCollapsed, 
            'mobile-sidebar-open': mobileSidebarOpen 
        }">
        
        <Navbar v-if="!isStandalonePage" v-model:searchQuery="searchQuery" />

        <div class="app-body">
            <div v-if="mobileSidebarOpen" class="layout-backdrop" @click="closeMobileSidebar"></div>
            
            <Sidebar />

            <main class="main-content">
                <slot />
            </main>
        </div>

        <Footer v-if="!isStandalonePage" />
    </div>

    <BaseToast ref="toastRef" />
</template>

<style scoped>
.app-shell {
    min-height: 100vh;
    background: var(--bg);
    color: var(--text-main);
    transition: background .25s ease, color .25s ease;
}

.app-body {
    display: flex;
    align-items: flex-start;
}

.layout-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(12, 18, 22, 0.6);
    backdrop-filter: blur(3px);
    z-index: 59;
    display: none;
}

.main-content {
    padding: 28px 32px 40px 32px;
    flex: 1;
    min-width: 0;
    transition: margin-left .25s ease;
}

.app-shell.collapsed .main-content {
    margin-left: var(--sidebar-w-collapsed);
}

@media (max-width: 991px) {
    .main-content {
        margin-left: 0 !important;
    }
    
    .layout-backdrop {
        display: block;
    }
}

@media (max-width: 768px) {
    .main-content {
        padding: 20px 16px 30px 16px;
    }
}
</style>