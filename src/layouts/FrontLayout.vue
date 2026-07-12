<script setup>
// @ts-nocheck

import { onMounted, ref, provide, watch } from 'vue'
import FrontHeader from '../components/partials/FrontHeader.vue'
import BaseToast from '../components/base/BaseToast.vue'
import { useToast } from '../composables/useToast'

const theme = ref(
    localStorage.getItem('glpi-theme') ||
    (window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
)

const toastRef = ref(null)
const { setToastInstance } = useToast()

const applyTheme = (value) => {
    document.documentElement.dataset.theme = value
    localStorage.setItem('glpi-theme', value)
}

const toggleTheme = () => {
    theme.value = theme.value === 'light' ? 'dark' : 'light'
}

provide('theme', theme)
provide('toggleTheme', toggleTheme)

watch(theme, (value) => applyTheme(value), { immediate: true })
onMounted(() => {
    applyTheme(theme.value)
    if (toastRef.value) {
        setToastInstance(toastRef.value)
    }
})
</script>

<template>
    <!-- Layout identique à la référence TalentaSync -->
    <div class="app-shell">
        <FrontHeader>
            <slot />
        </FrontHeader>
    </div>

    <BaseToast ref="toastRef" />
</template>

<style scoped>
.app-shell {
    display: grid;
    grid-template-columns: 260px 1fr;
    min-height: 100vh;
}

@media (max-width: 991px) {
    .app-shell {
        grid-template-columns: 1fr;
    }
}
</style>