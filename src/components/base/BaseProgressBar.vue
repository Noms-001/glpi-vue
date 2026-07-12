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
    default: 'primary',
    validator: (value) => ['primary', 'success', 'danger', 'warning'].includes(value)
  },
  logs: {
    type: Array,
    default: () => []
  },
  showLogs: {
    type: Boolean,
    default: true
  },
  showPercentage: {
    type: Boolean,
    default: true
  },
  max: {
    type: Number,
    default: 100
  },
  animated: {
    type: Boolean,
    default: true
  },
  striped: {
    type: Boolean,
    default: false
  },
  height: {
    type: String,
    default: '8px'
  }
})

const percent = computed(() => {
  const value = Number(props.value)
  if (Number.isNaN(value)) {
    return 0
  }
  return Math.min(props.max, Math.max(0, Math.round(value)))
})

const isComplete = computed(() => percent.value >= props.max)

const variantClasses = computed(() => {
  const variants = {
    primary: 'progress-fill-primary',
    success: 'progress-fill-success',
    danger: 'progress-fill-danger',
    warning: 'progress-fill-warning'
  }
  return variants[props.variant] || variants.primary
})

const statusText = computed(() => {
  if (isComplete.value) return 'Terminé ✓'
  if (percent.value === 0) return 'En attente...'
  if (percent.value < 30) return 'Démarrage...'
  if (percent.value < 70) return 'En cours...'
  if (percent.value < 100) return 'Finalisation...'
  return 'Presque terminé...'
})

const statusClass = computed(() => {
  if (isComplete.value) return 'status-complete'
  if (percent.value === 0) return 'status-idle'
  return 'status-active'
})
</script>

<template>
  <div class="progress-container">
    <!-- Header avec label et pourcentage -->
    <div v-if="label || showPercentage" class="progress-header">
      <div class="progress-label-wrapper">
        <i v-if="isComplete" class="bi bi-check-circle-fill progress-check-icon"></i>
        <span v-if="label" class="progress-label">{{ label }}</span>
      </div>
      <span v-if="showPercentage" class="progress-percent" :class="{ 'percent-complete': isComplete }">
        {{ percent }}%
      </span>
    </div>

    <!-- Barre de progression -->
    <div 
      class="progress-track" 
      role="progressbar" 
      :aria-valuenow="percent" 
      aria-valuemin="0" 
      :aria-valuemax="max"
      :aria-label="label || 'Barre de progression'"
      :style="{ height: height }"
    >
      <div 
        class="progress-fill" 
        :class="[
          variantClasses,
          {
            'progress-animated': animated,
            'progress-striped': striped,
            'progress-complete': isComplete
          }
        ]" 
        :style="{ width: percent + '%' }"
      >
        <!-- Micro-étincelles à la fin -->
        <div v-if="isComplete" class="progress-sparkle"></div>
      </div>
    </div>

    <!-- Statut -->
    <div class="progress-status" :class="statusClass">
      <span class="status-dot"></span>
      <span class="status-text">{{ statusText }}</span>
    </div>

    <!-- Logs -->
    <div v-if="showLogs && logs.length" class="progress-logs">
      <div class="logs-header">
        <i class="bi bi-terminal"></i>
        <span>Console</span>
        <span class="logs-count">{{ logs.length }}</span>
      </div>
      <div class="logs-container">
        <div 
          v-for="(log, index) in logs" 
          :key="index" 
          class="log-entry"
          :class="{
            'log-error': log.includes('❌') || log.includes('Erreur'),
            'log-success': log.includes('✅') || log.includes('réussi'),
            'log-warning': log.includes('⚠️'),
            'log-info': log.includes('🚀') || log.includes('📊') || log.includes('📄')
          }"
        >
          <span class="log-timestamp">{{ index + 1 }}</span>
          <span class="log-message">{{ log }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* ============ CONTAINER ============ */
.progress-container {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

/* ============ HEADER ============ */
.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.progress-label-wrapper {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.progress-check-icon {
  color: var(--success-color);
  font-size: 1.1rem;
  animation: scaleIn 0.3s ease;
}

.progress-label {
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--text-main);
  letter-spacing: -0.01em;
}

.progress-percent {
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--text-muted);
  background: var(--pill-bg);
  padding: 0.25rem 0.65rem;
  border-radius: 999px;
  min-width: 48px;
  text-align: center;
  transition: all 0.3s ease;
}

.percent-complete {
  background: rgba(16, 185, 129, 0.12);
  color: var(--success-color);
}

/* ============ TRACK ============ */
.progress-track {
  width: 100%;
  border-radius: 999px;
  background: var(--pill-bg);
  overflow: hidden;
  position: relative;
}

/* ============ FILL ============ */
.progress-fill {
  height: 100%;
  border-radius: 999px;
  transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  min-width: 0;
}

/* Variants */
.progress-fill-primary {
  background: linear-gradient(90deg, var(--brand-green), #1a5c53);
  box-shadow: 0 0 12px rgba(14, 59, 54, 0.3);
}

.progress-fill-success {
  background: linear-gradient(90deg, #10b981, #059669);
  box-shadow: 0 0 12px rgba(16, 185, 129, 0.3);
}

.progress-fill-danger {
  background: linear-gradient(90deg, #ef4444, #dc2626);
  box-shadow: 0 0 12px rgba(239, 68, 68, 0.3);
}

.progress-fill-warning {
  background: linear-gradient(90deg, var(--accent-orange), #e09630);
  box-shadow: 0 0 12px rgba(244, 169, 80, 0.3);
}

/* Animations */
.progress-animated {
  position: relative;
  overflow: hidden;
}

.progress-animated::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(255, 255, 255, 0.15) 50%,
    transparent 100%
  );
  animation: progress-shine 2s ease-in-out infinite;
}

.progress-striped {
  background-size: 20px 20px;
  background-image: linear-gradient(
    45deg,
    rgba(255, 255, 255, 0.1) 25%,
    transparent 25%,
    transparent 50%,
    rgba(255, 255, 255, 0.1) 50%,
    rgba(255, 255, 255, 0.1) 75%,
    transparent 75%,
    transparent
  );
  animation: progress-stripes 1s linear infinite;
}

.progress-complete {
  animation: progress-complete-pulse 2s ease-in-out infinite;
}

/* Étincelles */
.progress-sparkle {
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 8px;
  height: 8px;
  background: white;
  border-radius: 50%;
  box-shadow: 0 0 8px 2px rgba(255, 255, 255, 0.8);
  animation: sparkle 1.5s ease-in-out infinite;
}

/* ============ STATUS ============ */
.progress-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.82rem;
  font-weight: 500;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--text-muted);
  flex-shrink: 0;
}

.status-active .status-dot {
  background: var(--brand-green);
  animation: pulse-dot 1.5s ease-in-out infinite;
}

.status-complete .status-dot {
  background: var(--success-color);
}

.status-idle .status-dot {
  background: var(--text-muted);
}

.status-text {
  color: var(--text-muted);
}

.status-complete .status-text {
  color: var(--success-color);
  font-weight: 600;
}

/* ============ LOGS ============ */
.progress-logs {
  border: 1px solid var(--border-color);
  border-radius: 12px;
  overflow: hidden;
  background: var(--bg);
}

.logs-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.65rem 1rem;
  background: var(--card-bg);
  border-bottom: 1px solid var(--border-color);
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text-muted);
}

.logs-header i {
  font-size: 0.85rem;
}

.logs-count {
  margin-left: auto;
  background: var(--pill-bg);
  padding: 0.15rem 0.5rem;
  border-radius: 999px;
  font-size: 0.7rem;
  font-weight: 700;
  color: var(--text-muted);
}

.logs-container {
  max-height: 220px;
  overflow-y: auto;
  padding: 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  font-family: 'SF Mono', 'Fira Code', 'Fira Mono', 'Roboto Mono', monospace;
  font-size: 0.78rem;
  line-height: 1.5;
}

.log-entry {
  display: flex;
  gap: 0.65rem;
  padding: 0.3rem 0.5rem;
  border-radius: 6px;
  transition: background 0.15s ease;
  color: var(--text-main);
}

.log-entry:hover {
  background: var(--pill-bg);
}

.log-timestamp {
  color: var(--text-muted);
  font-weight: 600;
  min-width: 24px;
  text-align: right;
  opacity: 0.6;
  font-size: 0.7rem;
  user-select: none;
}

.log-message {
  word-break: break-word;
  flex: 1;
}

/* Couleurs des logs */
.log-error .log-message {
  color: #ff6b6b;
}

.log-success .log-message {
  color: #51cf66;
}

.log-warning .log-message {
  color: #ffd43b;
}

.log-info .log-message {
  color: #74c0fc;
  font-weight: 500;
}

/* Scrollbar des logs */
.logs-container::-webkit-scrollbar {
  width: 5px;
}

.logs-container::-webkit-scrollbar-track {
  background: transparent;
}

.logs-container::-webkit-scrollbar-thumb {
  background: var(--border-color);
  border-radius: 999px;
}

.logs-container::-webkit-scrollbar-thumb:hover {
  background: var(--text-muted);
}

/* ============ KEYFRAMES ============ */
@keyframes progress-shine {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(200%);
  }
}

@keyframes progress-stripes {
  0% {
    background-position: 0 0;
  }
  100% {
    background-position: 40px 0;
  }
}

@keyframes progress-complete-pulse {
  0%, 100% {
    box-shadow: 0 0 12px rgba(16, 185, 129, 0.3);
  }
  50% {
    box-shadow: 0 0 24px rgba(16, 185, 129, 0.5);
  }
}

@keyframes sparkle {
  0%, 100% {
    opacity: 0.5;
    transform: translateY(-50%) scale(0.8);
  }
  50% {
    opacity: 1;
    transform: translateY(-50%) scale(1.2);
  }
}

@keyframes pulse-dot {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.4;
  }
}

@keyframes scaleIn {
  from {
    transform: scale(0);
  }
  to {
    transform: scale(1);
  }
}

/* ============ RESPONSIVE ============ */
@media (max-width: 768px) {
  .progress-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .progress-percent {
    align-self: flex-end;
  }
  
  .logs-container {
    max-height: 180px;
    font-size: 0.75rem;
  }
}
</style>