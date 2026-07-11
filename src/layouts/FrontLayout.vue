<script setup>
// @ts-nocheck

import { onMounted, ref, provide, watch } from 'vue'
import { useRouter } from 'vue-router'
import BaseButton from '../components/base/BaseButton.vue'
import FrontHeader from '../components/partials/FrontHeader.vue'
import FrontFooter from '../components/partials/FrontFooter.vue'
import BaseToast from '../components/base/BaseToast.vue'
import { useToast } from '../composables/useToast'

const theme = ref(
    localStorage.getItem('glpi-theme') ||
    (window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
)

const toastRef = ref(null)
const { setToastInstance } = useToast()
const router = useRouter()

const props = defineProps({
    showBackButton: { type: Boolean, default: true }
})

const goBack = () => {
    router.back()
}

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
    <div class="front-layout d-flex flex-column min-vh-100 bg-body">
        <FrontHeader />

        <main class="front-main flex-grow-1 container py-5">
            <div class="mb-3">
                <BaseButton v-if="props.showBackButton" type="button" variant="secondary" icon="bi bi-arrow-left" size="sm" @click="goBack">Retour</BaseButton>
            </div>
            <slot />
        </main>

        <FrontFooter />
    </div>

    <BaseToast ref="toastRef" />
</template>

<style scoped>
.front-main {
    width: 100%;
}

.front-layout {
    background-color: var(--surface-color) !important;
}

* {
    color: var(--text-color);
}
</style>