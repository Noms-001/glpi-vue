<script setup>
// @ts-nocheck
import { onMounted, onUnmounted } from 'vue'

const props = defineProps({
    modelValue: {
        type: Boolean,
        default: false
    },
    title: {
        type: String,
        default: ''
    },
    size: {
        type: String,
        default: 'md'
    },
    closeOnOutside: {
        type: Boolean,
        default: true
    },
    loading: {
        type: Boolean,
        default: false
    },
    customClass: {
        type: [String, Array, Object],
        default: ''
    }
})

const modalSizes = {
    sm: '420px',
    md: '620px',
    lg: '900px',
    xl: '1120px'
}

const emit = defineEmits([
    'update:modelValue',
    'close'
])

const close = () => {
    emit('update:modelValue', false)
    emit('close')
}

const handleOverlayClick = () => {
    if (props.closeOnOutside) {
        close()
    }
}

const handleEscape = (event) => {
    if (event.key === 'Escape') {
        close()
    }
}

onMounted(() => {
    window.addEventListener('keydown', handleEscape)
})

onUnmounted(() => {
    window.removeEventListener('keydown', handleEscape)
})
</script>

<template>
    <Teleport to="body">
        <div v-if="modelValue" class="modal-overlay" @click="handleOverlayClick">
            <div :class="['modal-content', customClass]" :style="{ width: modalSizes[size] }" @click.stop>
                <div class="modal-header">
                    <slot name="header">
                        <h3>{{ title }}</h3>
                    </slot>
                    <button class="close-btn" @click="close" aria-label="Fermer la fenêtre">×</button>
                </div>
                <div class="modal-body" :aria-busy="loading">
                    <template v-if="!loading">
                        <slot />
                    </template>
                    <template v-else>
                        <div class="modal-skeleton">
                            <div class="skeleton skeleton-title"></div>
                            <div class="skeleton skeleton-line"></div>
                            <div class="skeleton skeleton-line"></div>
                            <div class="skeleton skeleton-line short"></div>
                        </div>
                    </template>
                </div>
                <div v-if="$slots.footer" class="modal-footer">
                    <slot name="footer" />
                </div>
            </div>
        </div>
    </Teleport>
</template>

<style scoped>
.modal-overlay {
    position: fixed;
    inset: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    background: rgba(2, 12, 27, 0.7);
    backdrop-filter: blur(6px);
    z-index: 9999;
}

.modal-content {
    max-width: 95%;
    max-height: 90vh;
    overflow: auto;
    border-radius: var(--radius-xl);
    background: var(--card-bg);
    border: 1px solid rgba(255, 255, 255, 0.08);
    box-shadow: var(--shadow-lg);
}

h3 {
    color: var(--text-color);
}

.modal-header,
.modal-footer {
    padding: 1.25rem 1.5rem;
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid var(--border-color);
}

.modal-header h3 {
    margin: 0;
    font-size: 1.2rem;
}

.modal-body {
    padding: 1.5rem;
}

.modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 0.75rem;
    border-top: 1px solid var(--border-color);
}

.close-btn {
    width: 42px;
    height: 42px;
    border: none;
    border-radius: 14px;
    background: rgba(79, 70, 229, 0.08);
    color: var(--text-color);
    cursor: pointer;
    font-size: 1.4rem;
    display: grid;
    place-items: center;
}

.close-btn:hover {
    background: rgba(79, 70, 229, 0.16);
}
</style>
