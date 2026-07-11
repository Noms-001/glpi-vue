<script setup>
// @ts-nocheck
import { computed } from 'vue'

const props = defineProps({
  value: {
    type: Number,
    default: 0
  },
  label: {
    type: String,
    default: ''
  },
  variant: {
    type: String,
    default: 'primary'
  },
  logs: {
    type: Array,
    default: () => []
  },
  showLogs: {
    type: Boolean,
    default: true
  },
  max: {
    type: Number,
    default: 100
  }
})

const percent = computed(() => {
  const value = Number(props.value)
  if (Number.isNaN(value)) {
    return 0
  }
  return Math.min(props.max, Math.max(0, value))
})

const variantClasses = computed(() => {
  const variants = {
    primary: 'progress-fill--primary',
    success: 'progress-fill--success',
    danger: 'progress-fill--danger',
    warning: 'progress-fill--warning',
    secondary: 'progress-fill--secondary'
  }
  return variants[props.variant] || variants.primary
})
</script>

<template>
  <div class="base-progress">
    <div class="progress-header">
      <div class="progress-label" v-if="label">{{ label }}</div>
      <div class="progress-percent">{{ percent }}%</div>
    </div>

    <div class="progress-track" role="progressbar" :aria-valuenow="percent" aria-valuemin="0" aria-valuemax="max">
      <div class="progress-fill" :class="variantClasses" :style="{ width: percent + '%' }"></div>
    </div>

    <div class="progress-meta">
      <span class="progress-status">{{ percent < max ? 'Chargement en cours...' : 'Terminé' }}</span>
    </div>

    <div v-if="showLogs && logs.length" class="progress-logs">
      <div v-for="(log, index) in logs" :key="index" class="progress-log">{{ log }}</div>
    </div>
  </div>
</template>

<style scoped>
.base-progress {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.progress-label {
  font-weight: 700;
  color: var(--text-color);
}

.progress-percent {
  font-size: 0.95rem;
  color: var(--text-muted-custom);
}

.progress-track {
  width: 100%;
  height: 16px;
  border-radius: 999px;
  background: var(--border-color);
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: 999px;
  transition: width 0.35s ease;
}

.progress-fill--primary {
  background: var(--primary-color);
}

.progress-fill--success {
  background: var(--success-color);
}

.progress-fill--danger {
  background: var(--danger-color);
}

.progress-fill--warning {
  background: var(--warning-color);
}

.progress-fill--secondary {
  background: var(--secondary-color);
}

.progress-meta {
  display: flex;
  justify-content: flex-start;
}

.progress-status {
  color: var(--text-muted-custom);
  font-size: 0.95rem;
}

.progress-logs {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
  max-height: 160px;
  overflow-y: auto;
  padding: 0.85rem 1rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  background: var(--surface-color);
}

.progress-log {
  color: var(--text-color);
  font-size: 0.9rem;
  line-height: 1.4;
}
</style>
