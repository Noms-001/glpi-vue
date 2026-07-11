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
    <div class="base-layout"
        :class="{ 'sidebar-collapsed': sidebarCollapsed, 'mobile-sidebar-open': mobileSidebarOpen }">
        <div v-if="mobileSidebarOpen" class="layout-backdrop" @click="closeMobileSidebar"></div>

        <Sidebar />

        <div class="layout-main">
            <Navbar v-if="!isStandalonePage" v-model:searchQuery="searchQuery" />

            <main class="layout-content">
                <slot />
            </main>

            <Footer v-if="!isStandalonePage" />
        </div>
    </div>

    <BaseToast ref="toastRef" />
</template>

<style scoped>
.base-layout {
    min-height: 100vh;
    display: flex;
    background: var(--bg-color);
    color: var(--text-color);
}

.layout-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(8, 15, 31, 0.32);
    backdrop-filter: blur(2px);
    z-index: 19;
}

.layout-main {
    margin-left: 280px;
    width: calc(100% - 280px);
    min-height: 100vh;
    transition: margin-left var(--transition-normal), width var(--transition-normal);
    display: flex;
    flex-direction: column;
}

.sidebar-collapsed .layout-main {
    margin-left: 92px;
    width: calc(100% - 92px);
}

.layout-content {
    flex: 1;
    padding: 3rem;
}

@media (max-width: 1100px) {
    .layout-main {
        margin-left: 92px;
        width: calc(100% - 92px);
    }
}

@media (max-width: 992px) {
    .layout-main {
        margin-left: 0;
        width: 100%;
    }
}
</style>