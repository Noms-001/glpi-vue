<script setup>
// @ts-nocheck
import { computed } from 'vue'
import BaseButton from './BaseButton.vue'

const props = defineProps({
    variant: {
        type: String,
        default: 'default'
    },
    size: {
        type: String,
        default: 'md'
    },
    image: {
        type: String,
        default: ''
    },
    title: {
        type: String,
        default: ''
    },
    subtitle: {
        type: String,
        default: ''
    },
    description: {
        type: String,
        default: ''
    },
    price: {
        type: String,
        default: ''
    },
    oldPrice: {
        type: String,
        default: ''
    },
    value: {
        type: [String, Number],
        default: ''
    },
    label: {
        type: String,
        default: ''
    },
    icon: {
        type: String,
        default: ''
    },
    trend: {
        type: String,
        default: ''
    },
    trendType: {
        type: String,
        default: 'neutral'
    },
    badges: {
        type: Array,
        default: () => []
    },
    actionLabel: {
        type: String,
        default: ''
    },
    actionVariant: {
        type: String,
        default: 'primary'
    },
    disabled: {
        type: Boolean,
        default: false
    },
    loading: {
        type: Boolean,
        default: false
    },
    clickable: {
        type: Boolean,
        default: false
    },
    customClass: {
        type: [String, Array, Object],
        default: ''
    }
})

const emit = defineEmits(['click', 'actionClick'])

const handleActionClick = (event) => {
    emit('actionClick')
    event.stopPropagation()
}

const badgeItems = computed(() => {
    return props.badges.map((badge) => {
        if (typeof badge === 'string') {
            return { label: badge, variant: 'default' }
        }
        return {
            label: badge.label || '',
            variant: badge.variant || 'default',
            icon: badge.icon || ''
        }
    })
})

const variantClasses = computed(() => {
    const variants = {
        primary: 'card-accent-primary',
        success: 'card-accent-success',
        danger: 'card-accent-danger',
        warning: 'card-accent-warning',
        default: ''
    }
    return variants[props.variant] || ''
})

const trendVariantClasses = computed(() => {
    const variants = {
        positive: 'trend-positive',
        negative: 'trend-negative',
        neutral: 'trend-neutral'
    }
    return variants[props.trendType] || variants.neutral
})

const hasValue = computed(() => props.value !== '' && props.value !== null && props.value !== undefined)

const hasPrice = computed(() => props.price !== '' && props.price !== null && props.price !== undefined)

const showValueSection = computed(() => hasValue.value || props.label || props.icon)

const showPriceSection = computed(() => props.price || props.oldPrice)

const handleClick = () => {
    if (props.clickable && !props.disabled && !props.loading) {
        emit('click')
    }
}
</script>

<template>
    <article 
        :class="[
            'card-custom',
            variantClasses,
            {
                'card-clickable': clickable,
                'card-disabled': disabled,
                'card-loading': loading
            },
            customClass
        ]" 
        @click="handleClick" 
        role="article"
        :aria-disabled="disabled || loading"
    >
        <!-- Image en haut -->
        <div v-if="$slots.image || image" class="card-image-wrapper">
            <slot name="image">
                <img :src="image" class="card-image" alt="" loading="lazy" />
            </slot>
        </div>

        <!-- Contenu -->
        <template v-if="!loading">
            <div class="card-body">
                <!-- Section Valeur / Icône / Label -->
                <div v-if="showValueSection" class="card-header-section">
                    <div class="card-header-left">
                        <!-- Icône -->
                        <div v-if="icon" class="card-icon">
                            <i :class="icon"></i>
                        </div>

                        <div class="card-header-text">
                            <!-- Label -->
                            <slot name="label">
                                <span v-if="label" class="card-label">{{ label }}</span>
                            </slot>

                            <!-- Valeur -->
                            <slot name="value">
                                <span v-if="hasValue" class="card-value">{{ value }}</span>
                            </slot>
                        </div>
                    </div>

                    <!-- Trend -->
                    <slot name="trend">
                        <span v-if="trend" :class="['card-trend', trendVariantClasses]">
                            <i v-if="trendType === 'positive'" class="bi bi-arrow-up-right"></i>
                            <i v-else-if="trendType === 'negative'" class="bi bi-arrow-down-right"></i>
                            {{ trend }}
                        </span>
                    </slot>
                </div>

                <!-- Badges -->
                <div v-if="badgeItems.length && !$slots.badges" class="card-badges">
                    <span 
                        v-for="(badge, index) in badgeItems" 
                        :key="index"
                        :class="['badge-custom', `badge-${badge.variant}`]"
                    >
                        <i v-if="badge.icon" :class="badge.icon"></i>
                        {{ badge.label }}
                    </span>
                </div>

                <slot name="badges"></slot>

                <!-- Contenu principal -->
                <div class="card-content">
                    <!-- Titre -->
                    <slot name="title">
                        <h3 v-if="title" class="card-title">{{ title }}</h3>
                    </slot>

                    <!-- Sous-titre -->
                    <slot name="subtitle">
                        <p v-if="subtitle" class="card-subtitle">{{ subtitle }}</p>
                    </slot>

                    <!-- Description -->
                    <slot name="description">
                        <p v-if="description" class="card-description">{{ description }}</p>
                    </slot>

                    <!-- Prix -->
                    <div v-if="showPriceSection" class="card-pricing">
                        <span v-if="price" class="card-price">{{ price }}</span>
                        <span v-if="oldPrice" class="card-old-price">{{ oldPrice }}</span>
                    </div>

                    <!-- Slot par défaut -->
                    <slot />
                </div>

                <!-- Actions -->
                <div v-if="$slots.actions || actionLabel" class="card-actions">
                    <slot name="actions">
                        <BaseButton 
                            v-if="actionLabel" 
                            :label="actionLabel" 
                            :variant="actionVariant" 
                            :disabled="disabled"
                            size="sm"
                            @click="handleActionClick" 
                        />
                    </slot>
                </div>

                <!-- Footer -->
                <div v-if="$slots.footer" class="card-footer">
                    <slot name="footer" />
                </div>
            </div>
        </template>

        <!-- État de chargement -->
        <template v-else>
            <div class="card-body card-skeleton">
                <div class="skeleton skeleton-label"></div>
                <div class="skeleton skeleton-value"></div>
                <div class="skeleton skeleton-line"></div>
                <div class="skeleton skeleton-line short"></div>
                <div class="skeleton skeleton-line"></div>
            </div>
        </template>
    </article>
</template>

<style scoped>
/* ============ BASE CARD ============ */
.card-custom {
    background: var(--card-bg);
    border: 1px solid var(--border-color);
    border-radius: 16px;
    box-shadow: var(--shadow-card);
    overflow: hidden;
    transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
    height: 100%;
    display: flex;
    flex-direction: column;
}

/* ============ VARIANTS ============ */
.card-accent-primary {
    border-left: 3px solid var(--brand-green);
}

.card-accent-success {
    border-left: 3px solid var(--success-color);
}

.card-accent-danger {
    border-left: 3px solid var(--danger-color);
}

.card-accent-warning {
    border-left: 3px solid var(--accent-orange);
}

/* ============ STATES ============ */
.card-clickable {
    cursor: pointer;
}

.card-clickable:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
    border-color: var(--brand-green);
}

.card-disabled {
    opacity: 0.6;
    pointer-events: none;
}

.card-loading {
    pointer-events: none;
}

/* ============ IMAGE ============ */
.card-image-wrapper {
    aspect-ratio: 16 / 9;
    overflow: hidden;
    border-bottom: 1px solid var(--border-color);
}

.card-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.4s ease;
}

.card-custom:hover .card-image {
    transform: scale(1.05);
}

/* ============ BODY ============ */
.card-body {
    padding: 24px;
    display: flex;
    flex-direction: column;
    gap: 16px;
    flex: 1;
}

/* ============ HEADER SECTION ============ */
.card-header-section {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 16px;
    flex-wrap: wrap;
}

.card-header-left {
    display: flex;
    align-items: center;
    gap: 14px;
}

.card-icon {
    width: 46px;
    height: 46px;
    border-radius: 50%;
    background: var(--pill-bg);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.15rem;
    color: var(--brand-green);
    flex-shrink: 0;
    position: relative;
}

.card-header-text {
    display: flex;
    flex-direction: column;
    gap: 2px;
}

.card-label {
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--text-muted);
}

.card-value {
    font-size: 2rem;
    font-weight: 800;
    color: var(--text-main);
    line-height: 1.1;
    letter-spacing: -0.02em;
}

/* ============ TREND ============ */
.card-trend {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 6px 12px;
    border-radius: 999px;
    font-size: 0.8rem;
    font-weight: 700;
    white-space: nowrap;
}

.trend-positive {
    background: rgba(16, 185, 129, 0.1);
    color: var(--success-color);
}

.trend-negative {
    background: rgba(239, 68, 68, 0.1);
    color: var(--danger-color);
}

.trend-neutral {
    background: var(--pill-bg);
    color: var(--text-muted);
}

/* ============ BADGES ============ */
.card-badges {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
}

.badge-custom {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 5px 12px;
    border-radius: 999px;
    font-size: 0.78rem;
    font-weight: 600;
    background: var(--pill-bg);
    color: var(--text-main);
    white-space: nowrap;
}

.badge-primary {
    background: rgba(14, 59, 54, 0.1);
    color: var(--brand-green);
}

.badge-success {
    background: rgba(16, 185, 129, 0.1);
    color: var(--success-color);
}

.badge-danger {
    background: rgba(239, 68, 68, 0.1);
    color: var(--danger-color);
}

.badge-warning {
    background: rgba(244, 169, 80, 0.15);
    color: var(--accent-orange);
}

/* ============ CONTENT ============ */
.card-content {
    display: flex;
    flex-direction: column;
    gap: 8px;
    flex: 1;
}

.card-title {
    font-size: 1.1rem;
    font-weight: 800;
    color: var(--text-main);
    margin: 0;
    letter-spacing: -0.01em;
    line-height: 1.3;
}

.card-subtitle {
    font-size: 0.85rem;
    color: var(--text-muted);
    font-weight: 500;
    margin: 0;
}

.card-description {
    font-size: 0.85rem;
    color: var(--text-muted);
    margin: 0;
    line-height: 1.6;
}

/* ============ PRICING ============ */
.card-pricing {
    display: flex;
    align-items: baseline;
    gap: 10px;
    flex-wrap: wrap;
}

.card-price {
    font-size: 1.5rem;
    font-weight: 800;
    color: var(--text-main);
    letter-spacing: -0.02em;
}

.card-old-price {
    font-size: 0.9rem;
    color: var(--text-muted);
    text-decoration: line-through;
}

/* ============ ACTIONS ============ */
.card-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    padding-top: 8px;
}

/* ============ FOOTER ============ */
.card-footer {
    padding-top: 16px;
    margin-top: auto;
    border-top: 1px solid var(--border-color);
}

/* ============ SKELETON LOADING ============ */
.card-skeleton {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 24px;
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

.skeleton-label {
    height: 12px;
    width: 40%;
}

.skeleton-value {
    height: 24px;
    width: 60%;
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

/* ============ RESPONSIVE ============ */
@media (max-width: 768px) {
    .card-body {
        padding: 18px;
        gap: 12px;
    }
    
    .card-value {
        font-size: 1.6rem;
    }
    
    .card-icon {
        width: 40px;
        height: 40px;
        font-size: 1rem;
    }
    
    .card-title {
        font-size: 1rem;
    }
    
    .card-price {
        font-size: 1.3rem;
    }
}
</style>