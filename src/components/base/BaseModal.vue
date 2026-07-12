<script setup>
// @ts-nocheck
import { onMounted, onUnmounted, watch } from 'vue'

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
        default: 'md',
        validator: (value) => ['sm', 'md', 'lg', 'xl'].includes(value)
    },
    closeOnOutside: {
        type: Boolean,
        default: true
    },
    closeOnEscape: {
        type: Boolean,
        default: true
    },
    loading: {
        type: Boolean,
        default: false
    },
    showCloseButton: {
        type: Boolean,
        default: true
    },
    customClass: {
        type: [String, Array, Object],
        default: ''
    }
})

const modalSizes = {
    sm: '480px',
    md: '640px',
    lg: '860px',
    xl: '1100px'
}

const emit = defineEmits([
    'update:modelValue',
    'close',
    'open'
])

const close = () => {
    emit('update:modelValue', false)
    emit('close')
}

const handleOverlayClick = (event) => {
    // Ne fermer que si on clique sur l'overlay, pas sur le contenu
    if (props.closeOnOutside && event.target === event.currentTarget) {
        close()
    }
}

const handleEscape = (event) => {
    if (props.closeOnEscape && event.key === 'Escape') {
        close()
    }
}

// Bloquer le scroll du body quand la modale est ouverte
watch(() => props.modelValue, (isOpen) => {
    if (isOpen) {
        document.body.style.overflow = 'hidden'
        emit('open')
    } else {
        document.body.style.overflow = ''
    }
})

onMounted(() => {
    window.addEventListener('keydown', handleEscape)
    if (props.modelValue) {
        document.body.style.overflow = 'hidden'
    }
})

onUnmounted(() => {
    window.removeEventListener('keydown', handleEscape)
    document.body.style.overflow = ''
})
</script>

<template>
    <Teleport to="body">
        <Transition name="modal-fade">
            <div 
                v-if="modelValue" 
                class="modal-overlay" 
                @click="handleOverlayClick"
                role="dialog"
                aria-modal="true"
                :aria-labelledby="title ? 'modal-title' : undefined"
            >
                <Transition name="modal-scale">
                    <div 
                        v-if="modelValue"
                        :class="['modal-panel', customClass]" 
                        :style="{ maxWidth: modalSizes[size] }" 
                        @click.stop
                    >
                        <!-- Header -->
                        <div class="modal-header">
                            <div class="modal-header-content">
                                <slot name="header">
                                    <h3 v-if="title" id="modal-title" class="modal-title">{{ title }}</h3>
                                </slot>
                            </div>
                            
                            <button 
                                v-if="showCloseButton"
                                class="modal-close-btn" 
                                @click="close" 
                                aria-label="Fermer la fenêtre"
                                title="Fermer"
                            >
                                <i class="bi bi-x-lg"></i>
                            </button>
                        </div>

                        <!-- Body -->
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
                                    <div class="skeleton skeleton-line"></div>
                                </div>
                            </template>
                        </div>

                        <!-- Footer -->
                        <div v-if="$slots.footer" class="modal-footer">
                            <slot name="footer" />
                        </div>
                    </div>
                </Transition>
            </div>
        </Transition>
    </Teleport>
</template>

<style scoped>
/* ============ OVERLAY ============ */
.modal-overlay {
    position: fixed;
    inset: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 1.5rem;
    background: rgba(12, 18, 22, 0.75);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    z-index: 9999;
}

/* ============ PANEL ============ */
.modal-panel {
    width: 100%;
    max-height: 85vh;
    display: flex;
    flex-direction: column;
    border-radius: 20px;
    background: var(--card-bg);
    border: 1px solid var(--border-color);
    box-shadow: 0 25px 60px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.05);
    overflow: hidden;
}

/* ============ HEADER ============ */
.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding: 1.5rem 1.75rem;
    border-bottom: 1px solid var(--border-color);
    gap: 1rem;
}

.modal-header-content {
    flex: 1;
    min-width: 0;
}

.modal-title {
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--text-main);
    margin: 0;
    letter-spacing: -0.01em;
    line-height: 1.3;
}

/* Bouton de fermeture */
.modal-close-btn {
    width: 38px;
    height: 38px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    border-radius: 10px;
    background: var(--pill-bg);
    color: var(--text-muted);
    cursor: pointer;
    font-size: 1rem;
    transition: all 0.2s ease;
    flex-shrink: 0;
}

.modal-close-btn:hover {
    background: rgba(239, 68, 68, 0.12);
    color: var(--danger-color);
    transform: rotate(90deg);
}

.modal-close-btn:active {
    transform: rotate(90deg) scale(0.95);
}

/* ============ BODY ============ */
.modal-body {
    padding: 1.75rem;
    overflow-y: auto;
    flex: 1;
    scroll-behavior: smooth;
}

/* Scrollbar personnalisée */
.modal-body::-webkit-scrollbar {
    width: 6px;
}

.modal-body::-webkit-scrollbar-track {
    background: transparent;
}

.modal-body::-webkit-scrollbar-thumb {
    background: var(--border-color);
    border-radius: 999px;
}

.modal-body::-webkit-scrollbar-thumb:hover {
    background: var(--text-muted);
}

/* ============ FOOTER ============ */
.modal-footer {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: 0.75rem;
    padding: 1.25rem 1.75rem;
    border-top: 1px solid var(--border-color);
    background: var(--bg);
}

/* ============ SKELETON LOADING ============ */
.modal-skeleton {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 0.5rem 0;
}

.skeleton {
    position: relative;
    overflow: hidden;
    background: var(--skeleton-bg);
    border-radius: 8px;
}

.skeleton::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(
        90deg,
        transparent,
        var(--skeleton-highlight),
        transparent
    );
    transform: translateX(-100%);
    animation: skeleton-shimmer 1.4s infinite;
}

.skeleton-title {
    height: 20px;
    width: 50%;
}

.skeleton-line {
    height: 14px;
    width: 100%;
}

.skeleton-line.short {
    width: 65%;
}

@keyframes skeleton-shimmer {
    0% {
        transform: translateX(-100%);
    }
    100% {
        transform: translateX(100%);
    }
}

/* ============ TRANSITIONS ============ */
.modal-fade-enter-active,
.modal-fade-leave-active {
    transition: opacity 0.3s ease;
}

.modal-fade-enter-active .modal-panel,
.modal-fade-leave-active .modal-panel {
    transition: transform 0.3s ease, opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
    opacity: 0;
}

.modal-fade-enter-from .modal-panel {
    opacity: 0;
    transform: scale(0.95) translateY(10px);
}

.modal-fade-leave-to .modal-panel {
    opacity: 0;
    transform: scale(0.95) translateY(-10px);
}

.modal-scale-enter-active {
    transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.modal-scale-leave-active {
    transition: all 0.2s ease-in;
}

.modal-scale-enter-from {
    opacity: 0;
    transform: scale(0.92) translateY(20px);
}

.modal-scale-leave-to {
    opacity: 0;
    transform: scale(0.95) translateY(-10px);
}

/* ============ RESPONSIVE ============ */
@media (max-width: 768px) {
    .modal-overlay {
        padding: 1rem;
        align-items: flex-end;
    }
    
    .modal-panel {
        max-height: 90vh;
        border-radius: 20px 20px 0 0;
        max-width: 100% !important;
    }
    
    .modal-header {
        padding: 1.25rem 1.25rem;
    }
    
    .modal-body {
        padding: 1.25rem;
    }
    
    .modal-footer {
        padding: 1rem 1.25rem;
        flex-direction: column-reverse;
        gap: 0.5rem;
    }
    
    .modal-title {
        font-size: 1.1rem;
    }
}

@media (max-width: 480px) {
    .modal-overlay {
        padding: 0.5rem;
    }
    
    .modal-header {
        padding: 1rem;
    }
    
    .modal-body {
        padding: 1rem;
    }
}
</style>