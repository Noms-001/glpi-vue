<script setup lang="ts">
import type { PropType } from 'vue'

defineProps({
    label: {
        type: String,
        default: ''
    },

    title: {
        type: String,
        default: ''
    },

    variant: {
        type: String as PropType<'primary' | 'secondary' | 'outline-secondary' | 'success' | 'danger' | 'warning' | 'ghost'>,
        default: 'primary'
    },

    size: {
        type: String as PropType<'sm' | 'md' | 'lg'>,
        default: 'md'
    },

    loading: {
        type: Boolean,
        default: false
    },

    disabled: {
        type: Boolean,
        default: false
    },

    icon: {
        type: String,
        default: ''
    },

    type: {
        type: String as PropType<'button' | 'submit' | 'reset'>,
        default: 'button'
    },

    pill: {
        type: Boolean,
        default: false
    },

    customClass: {
        type: [String, Array, Object],
        default: ''
    }
})
</script>

<template>
    <button 
        :type="type" 
        :disabled="disabled || loading" 
        :title="title" 
        :class="[
            'btn-custom',
            `btn-${variant}`,
            `btn-${size}`,
            {
                'btn-pill': pill,
                'btn-loading': loading,
                'btn-icon-only': !label && !$slots.default && icon
            },
            customClass,
            'no-row-click'
        ]"
    >
        <!-- Spinner de chargement -->
        <span v-if="loading" class="btn-spinner">
            <span class="spinner-dot"></span>
            <span class="spinner-dot"></span>
            <span class="spinner-dot"></span>
        </span>

        <template v-else>
            <i v-if="icon" :class="icon" class="btn-icon"></i>
            <template v-if="$slots.default">
                <slot />
            </template>
            <template v-else-if="label">
                <span class="btn-label">{{ label }}</span>
            </template>
        </template>
    </button>
</template>

<style scoped>
/* ============ BASE ============ */
.btn-custom {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    border: 1.5px solid transparent;
    font-family: var(--font-family);
    font-weight: 600;
    letter-spacing: 0.01em;
    cursor: pointer;
    transition: all 0.2s ease;
    position: relative;
    overflow: hidden;
    text-decoration: none;
    white-space: nowrap;
    user-select: none;
}

.btn-custom:active:not(:disabled) {
    transform: scale(0.97);
}

.btn-custom:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    pointer-events: none;
}

/* ============ SIZES ============ */
.btn-sm {
    padding: 0.5rem 1rem;
    font-size: 0.8rem;
    border-radius: 8px;
}

.btn-md {
    padding: 0.65rem 1.25rem;
    font-size: 0.88rem;
    border-radius: 10px;
}

.btn-lg {
    padding: 0.8rem 1.5rem;
    font-size: 0.92rem;
    border-radius: 12px;
}

/* Pill style */
.btn-pill {
    border-radius: 999px !important;
}

/* Icon only */
.btn-icon-only {
    padding: 0.65rem;
    min-width: 42px;
    min-height: 42px;
}

.btn-icon-only.btn-sm {
    padding: 0.45rem;
    min-width: 34px;
    min-height: 34px;
}

.btn-icon-only.btn-lg {
    padding: 0.75rem;
    min-width: 50px;
    min-height: 50px;
}

/* ============ VARIANTS ============ */

/* Primary */
.btn-primary {
    background: var(--brand-green);
    border-color: var(--brand-green);
    color: #FFFFFF;
    box-shadow: 0 2px 8px rgba(14, 59, 54, 0.2);
}

.btn-primary:hover:not(:disabled) {
    background: #0a2e2a;
    border-color: #0a2e2a;
    box-shadow: 0 4px 16px rgba(14, 59, 54, 0.3);
    transform: translateY(-1px);
}

/* Secondary */
.btn-secondary {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(255, 255, 255, 0.12);
    color: #FFFFFF;
}

.btn-secondary:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.15);
    border-color: rgba(255, 255, 255, 0.2);
    transform: translateY(-1px);
}

/* Outline Secondary */
.btn-outline-secondary {
    background: transparent;
    border-color: var(--border-color);
    color: var(--text-main);
}

.btn-outline-secondary:hover:not(:disabled) {
    background: var(--pill-bg);
    border-color: var(--text-muted);
    transform: translateY(-1px);
}

/* Success */
.btn-success {
    background: var(--success-color);
    border-color: var(--success-color);
    color: #FFFFFF;
    box-shadow: 0 2px 8px rgba(16, 185, 129, 0.2);
}

.btn-success:hover:not(:disabled) {
    filter: brightness(1.1);
    box-shadow: 0 4px 16px rgba(16, 185, 129, 0.3);
    transform: translateY(-1px);
}

/* Danger */
.btn-danger {
    background: var(--danger-color);
    border-color: var(--danger-color);
    color: #FFFFFF;
    box-shadow: 0 2px 8px rgba(239, 68, 68, 0.2);
}

.btn-danger:hover:not(:disabled) {
    background: #dc2626;
    border-color: #dc2626;
    box-shadow: 0 4px 16px rgba(239, 68, 68, 0.35);
    transform: translateY(-1px);
}

/* Warning */
.btn-warning {
    background: var(--accent-orange);
    border-color: var(--accent-orange);
    color: #23180a;
    box-shadow: 0 2px 8px rgba(244, 169, 80, 0.25);
}

.btn-warning:hover:not(:disabled) {
    filter: brightness(1.05);
    box-shadow: 0 4px 16px rgba(244, 169, 80, 0.35);
    transform: translateY(-1px);
}

/* Ghost */
.btn-ghost {
    background: transparent;
    border-color: transparent;
    color: var(--text-main);
}

.btn-ghost:hover:not(:disabled) {
    background: var(--pill-bg);
    transform: translateY(-1px);
}

/* ============ ICON ============ */
.btn-icon {
    font-size: 1.1em;
    line-height: 1;
}

.btn-sm .btn-icon {
    font-size: 1em;
}

.btn-lg .btn-icon {
    font-size: 1.2em;
}

/* ============ LOADING SPINNER ============ */
.btn-loading {
    pointer-events: none;
}

.btn-spinner {
    display: flex;
    align-items: center;
    gap: 4px;
}

.spinner-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: currentColor;
    animation: bounce 1.4s ease-in-out infinite both;
}

.spinner-dot:nth-child(1) {
    animation-delay: -0.32s;
}

.spinner-dot:nth-child(2) {
    animation-delay: -0.16s;
}

.spinner-dot:nth-child(3) {
    animation-delay: 0s;
}

@keyframes bounce {
    0%, 80%, 100% {
        transform: scale(0.6);
        opacity: 0.5;
    }
    40% {
        transform: scale(1);
        opacity: 1;
    }
}

/* ============ RIPPLE EFFECT ============ */
.btn-custom::after {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(circle at center, rgba(255, 255, 255, 0.3) 0%, transparent 70%);
    opacity: 0;
    transition: opacity 0.3s ease;
}

.btn-custom:active::after {
    opacity: 1;
    transition: opacity 0s;
}

/* ============ RESPONSIVE ============ */
@media (max-width: 768px) {
    .btn-lg {
        padding: 0.7rem 1.25rem;
        font-size: 0.88rem;
    }
    
    .btn-md {
        padding: 0.55rem 1.1rem;
        font-size: 0.85rem;
    }
}
</style>