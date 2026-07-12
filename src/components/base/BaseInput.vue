<script setup>
// @ts-nocheck
import { ref, computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: [String, Number, Boolean, Object, Array],
    default: null
  },
  value: {
    type: [Boolean, String, Number],
    default: ''
  },
  label: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: ''
  },
  type: {
    type: String,
    default: 'text'
  },
  name: {
    type: String,
    default: ''
  },
  required: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  },
  readonly: {
    type: Boolean,
    default: false
  },
  icon: {
    type: String,
    default: ''
  },
  iconRight: {
    type: String,
    default: ''
  },
  error: {
    type: String,
    default: ''
  },
  customClass: {
    type: [String, Array, Object],
    default: ''
  },
  multiple: {
    type: Boolean,
    default: false
  },
  accept: {
    type: String,
    default: ''
  },
  helper: {
    type: String,
    default: ''
  },
  size: {
    type: String,
    default: 'md',
    validator: (value) => typeof value === 'string' && ['sm', 'md', 'lg'].includes(value)
  }
})

const sizeClass = computed(() => `input-${props.size}`)

const emit = defineEmits([
  'update:modelValue',
  'blur',
  'focus'
])

const showPassword = ref(false)
const isDragging = ref(false)
const isFocused = ref(false)
/** @type {import('vue').Ref<HTMLInputElement | null>} */
const fileInput = ref(null)

const inputType = computed(() => {
  if (props.type !== 'password') return props.type
  return showPassword.value ? 'text' : 'password'
})

const isCheckable = computed(() => ['checkbox', 'radio'].includes(props.type))

const files = computed(() => {
  if (props.type !== 'file') return []
  if (!props.modelValue) return []
  return Array.isArray(props.modelValue) ? props.modelValue : [props.modelValue]
})

const fileCountLabel = computed(() => {
  if (!files.value.length) {
    return props.placeholder || 'Glissez-déposez un fichier ou cliquez ici'
  }
  return `${files.value.length} fichier(s) sélectionné(s)`
})

/** @param {Event} event */
const updateValue = (event) => {
  if (props.type === 'file') {
    const target = /** @type {HTMLInputElement} */ (event.target)
    const dropped = target.files
    const value = props.multiple ? Array.from(dropped) : dropped?.[0] ?? null
    emit('update:modelValue', value)
    return
  }

  const target = /** @type {HTMLInputElement} */ (event.target)
  emit('update:modelValue', target.value)
}

/** @param {Event} event */
const handleCheckableChange = (event) => {
  const target = /** @type {HTMLInputElement} */ (event.target)
  
  if (props.type === 'radio') {
    emit('update:modelValue', props.value)
    return
  }

  // Mode checkbox avec tableau (multi-select)
  if (props.type === 'checkbox' && Array.isArray(props.modelValue)) {
    const updatedArray = [...props.modelValue]
    const itemToToggle = props.value
    const index = updatedArray.findIndex(item => {
      if (typeof itemToToggle === 'object' && typeof item === 'object') {
        return JSON.stringify(item) === JSON.stringify(itemToToggle)
      }
      return item === itemToToggle
    })

    if (index > -1) {
      updatedArray.splice(index, 1)
    } else {
      updatedArray.push(itemToToggle)
    }
    emit('update:modelValue', updatedArray)
    return
  }

  // Mode checkbox standard (booléen)
  emit('update:modelValue', target.checked)
}

// Vérifier si un élément est coché dans le tableau
const isItemChecked = computed(() => {
  if (!Array.isArray(props.modelValue)) return false
  return props.modelValue.some(item => {
    if (typeof props.value === 'object' && typeof item === 'object') {
      return JSON.stringify(item) === JSON.stringify(props.value)
    }
    return item === props.value
  })
})

const triggerFileSelect = () => {
  fileInput.value?.click()
}

/** @param {DragEvent} event */
const handleDragOver = (event) => {
  event.preventDefault()
  isDragging.value = true
}

const handleDragLeave = () => {
  isDragging.value = false
}

/** @param {DragEvent} event */
const handleDrop = (event) => {
  event.preventDefault()
  isDragging.value = false
  const dropped = Array.from(event.dataTransfer.files)
  if (!dropped.length) return
  const value = props.multiple ? dropped : dropped[0]
  emit('update:modelValue', value)
}

const removeFile = (index) => {
  const currentFiles = Array.isArray(files.value) ? [...files.value] : [...files.value]
  currentFiles.splice(index, 1)
  const value = props.multiple ? currentFiles : currentFiles[0] || null
  emit('update:modelValue', value)
}

const handleFocus = () => {
  isFocused.value = true
  emit('focus')
}

const handleBlur = () => {
  isFocused.value = false
  emit('blur')
}
</script>

<template>
  <div :class="['input-container', customClass]">
    <!-- Checkbox / Radio -->
    <label v-if="isCheckable" class="checkable-label">
      <input 
        :checked="type === 'checkbox' && Array.isArray(modelValue) ? isItemChecked : (modelValue == value)" 
        :type="type" 
        :disabled="disabled" 
        :required="required"
        class="checkable-input"
        @change="handleCheckableChange" 
      />
      <span class="checkable-indicator">
        <i v-if="type === 'checkbox'" class="bi bi-check-lg"></i>
        <i v-else class="checkable-dot"></i>
      </span>
      <span class="checkable-text">{{ label }}</span>
    </label>

    <!-- Inputs standards -->
    <template v-else>
      <label v-if="label" class="input-label">
        {{ label }}
        <span v-if="required" class="required-mark">*</span>
      </label>

      <div :class="['input-wrapper', { 'input-focused': isFocused, 'input-error': error }]">
        <!-- Icône gauche -->
        <i v-if="icon" :class="['input-icon left', icon]" />

        <!-- Textarea -->
        <template v-if="type === 'textarea'">
          <textarea 
            :value="modelValue" 
            :name="name" 
            :placeholder="placeholder" 
            :disabled="disabled"
            :readonly="readonly" 
            :required="required"
            :class="['input-field', 'textarea-field', sizeClass]"
            @input="updateValue($event)" 
            @blur="handleBlur" 
            @focus="handleFocus" 
          />
        </template>

        <!-- File Upload -->
        <template v-else-if="type === 'file'">
          <div 
            class="file-dropzone" 
            :class="{ 'file-dragging': isDragging }" 
            @click="triggerFileSelect"
            @dragover.prevent="handleDragOver" 
            @dragenter.prevent="handleDragOver" 
            @dragleave.prevent="handleDragLeave"
            @drop.prevent="handleDrop"
          >
            <div class="drop-icon">
              <i class="bi bi-cloud-arrow-up-fill"></i>
            </div>
            <div class="drop-text">
              <strong>{{ fileCountLabel }}</strong>
              <small v-if="accept">Formats acceptés : {{ accept }}</small>
            </div>
          </div>
          <input 
            ref="fileInput" 
            class="file-input-hidden" 
            :type="type" 
            :name="name" 
            :disabled="disabled" 
            :multiple="multiple"
            :accept="accept" 
            :readonly="readonly" 
            :required="required" 
            @change="updateValue" 
          />
        </template>

        <!-- Input standard -->
        <template v-else>
          <input 
            :value="modelValue" 
            :type="inputType" 
            :name="name" 
            :placeholder="placeholder" 
            :disabled="disabled"
            :required="required"
            :class="['input-field', sizeClass, { 
              'has-icon-left': icon, 
              'has-icon-right': iconRight || type === 'password'
            }]"
            @input="updateValue($event)" 
            @blur="handleBlur" 
            @focus="handleFocus" 
          />
        </template>

        <!-- Icône droite -->
        <i v-if="iconRight && type !== 'password'" :class="['input-icon right', iconRight]" />

        <!-- Toggle password -->
        <button 
          v-if="type === 'password'" 
          type="button" 
          class="password-toggle"
          @click="showPassword = !showPassword"
          :aria-label="showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'"
        >
          <i :class="showPassword ? 'bi bi-eye-slash' : 'bi bi-eye'" />
        </button>
      </div>

      <!-- File preview -->
      <div v-if="type === 'file' && files.length" class="file-preview">
        <div v-for="(file, index) in files" :key="index" class="file-item">
          <div class="file-info">
            <i class="bi bi-file-earmark-fill"></i>
            <div class="file-meta">
              <strong>{{ file.name }}</strong>
              <span>{{ (file.size / 1024).toFixed(1) }} KB</span>
            </div>
          </div>
          <button type="button" class="file-remove" @click="removeFile(index)" aria-label="Supprimer le fichier">
            <i class="bi bi-x-lg"></i>
          </button>
        </div>
      </div>
    </template>

    <!-- Messages -->
    <small v-if="error" class="error-message">
      <i class="bi bi-exclamation-circle"></i> {{ error }}
    </small>
    <small v-if="helper && !error" class="helper-text">{{ helper }}</small>
  </div>
</template>

<style scoped>
/* ============ CONTAINER ============ */
.input-container {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

/* ============ LABEL ============ */
.input-label {
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--text-main);
  letter-spacing: -0.01em;
}

.required-mark {
  color: var(--danger-color);
  margin-left: 0.15rem;
}

/* ============ WRAPPER ============ */
.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

/* ============ INPUT FIELD ============ */
.input-field {
  width: 100%;
  background: var(--card-bg);
  border: 1.5px solid var(--border-color);
  color: var(--text-main);
  border-radius: 10px;
  transition: all 0.2s ease;
  font-family: var(--font-family);
}

.input-field::placeholder {
  color: var(--text-muted);
  opacity: 0.7;
}

.input-field:focus {
  outline: none;
  border-color: var(--brand-green);
  box-shadow: 0 0 0 3px rgba(14, 59, 54, 0.1);
}

.input-wrapper.input-focused {
  /* État focus du wrapper */
}

.input-wrapper.input-error .input-field {
  border-color: var(--danger-color);
}

.input-wrapper.input-error .input-field:focus {
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}

/* Sizes */
.input-sm {
  padding: 0.5rem 0.85rem;
  font-size: 0.85rem;
  min-height: 38px;
}

.input-md {
  padding: 0.65rem 1rem;
  font-size: 0.9rem;
  min-height: 46px;
}

.input-lg {
  padding: 0.8rem 1.1rem;
  font-size: 0.95rem;
  min-height: 54px;
}

/* Icon spacing */
.has-icon-left {
  padding-left: 2.75rem;
}

.has-icon-right {
  padding-right: 2.75rem;
}

/* ============ TEXTAREA ============ */
.textarea-field {
  min-height: 140px;
  resize: vertical;
  line-height: 1.6;
}

/* ============ ICONS ============ */
.input-icon {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-muted);
  font-size: 1rem;
  z-index: 2;
  pointer-events: none;
  transition: color 0.2s ease;
}

.input-icon.left {
  left: 0.9rem;
}

.input-icon.right {
  right: 0.9rem;
}

.input-wrapper:focus-within .input-icon {
  color: var(--brand-green);
}

/* ============ PASSWORD TOGGLE ============ */
.password-toggle {
  position: absolute;
  right: 0.65rem;
  top: 50%;
  transform: translateY(-50%);
  background: transparent;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: 0.35rem;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  z-index: 2;
}

.password-toggle:hover {
  color: var(--brand-green);
  background: var(--pill-bg);
}

/* ============ CHECKABLE (Checkbox / Radio) ============ */
.checkable-label {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  cursor: pointer;
  color: var(--text-main);
  font-size: 0.9rem;
  font-weight: 500;
}

.checkable-input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.checkable-indicator {
  width: 20px;
  height: 20px;
  border: 2px solid var(--border-color);
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  flex-shrink: 0;
  color: transparent;
  background: var(--card-bg);
}

.checkable-input:checked + .checkable-indicator {
  background: var(--brand-green);
  border-color: var(--brand-green);
  color: #FFFFFF;
}

.checkable-input:focus + .checkable-indicator {
  box-shadow: 0 0 0 3px rgba(14, 59, 54, 0.15);
}

.checkable-indicator i {
  font-size: 0.75rem;
  font-weight: bold;
}

/* Radio specific */
input[type="radio"] + .checkable-indicator {
  border-radius: 50%;
}

input[type="radio"] + .checkable-indicator .checkable-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: transparent;
  transition: background 0.2s ease;
}

input[type="radio"]:checked + .checkable-indicator .checkable-dot {
  background: #FFFFFF;
}

.checkable-text {
  user-select: none;
}

/* ============ FILE DROPZONE ============ */
.file-dropzone {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: 2rem 1.5rem;
  border-radius: 12px;
  background: var(--bg);
  border: 2px dashed var(--border-color);
  color: var(--text-muted);
  cursor: pointer;
  text-align: center;
  transition: all 0.25s ease;
}

.file-dropzone:hover,
.file-dropzone.file-dragging {
  border-color: var(--brand-green);
  background: var(--brand-green-light);
  transform: translateY(-1px);
}

.drop-icon {
  width: 52px;
  height: 52px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 14px;
  background: rgba(14, 59, 54, 0.1);
  color: var(--brand-green);
  font-size: 1.3rem;
}

.drop-text {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.drop-text strong {
  font-size: 0.9rem;
  color: var(--text-main);
}

.drop-text small {
  font-size: 0.78rem;
  color: var(--text-muted);
}

.file-input-hidden {
  display: none;
}

/* ============ FILE PREVIEW ============ */
.file-preview {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.file-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  border-radius: 10px;
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  transition: all 0.2s ease;
}

.file-item:hover {
  border-color: var(--brand-green);
  box-shadow: var(--shadow-sm);
}

.file-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  min-width: 0;
}

.file-info > i {
  font-size: 1.2rem;
  color: var(--brand-green);
  flex-shrink: 0;
}

.file-meta {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  min-width: 0;
}

.file-meta strong {
  font-size: 0.85rem;
  color: var(--text-main);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.file-meta span {
  font-size: 0.78rem;
  color: var(--text-muted);
}

.file-remove {
  border: none;
  background: transparent;
  color: var(--text-muted);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.file-remove:hover {
  background: rgba(239, 68, 68, 0.1);
  color: var(--danger-color);
}

/* ============ MESSAGES ============ */
.error-message {
  color: var(--danger-color);
  font-size: 0.8rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.error-message i {
  font-size: 0.85rem;
}

.helper-text {
  color: var(--text-muted);
  font-size: 0.8rem;
  font-weight: 400;
}

/* ============ COLOR INPUT ============ */
.input-field[type="color"] {
  width: 48px;
  padding: 0.35rem !important;
  cursor: pointer;
}

.input-field[type="color"]::-webkit-color-swatch {
  border: none;
  border-radius: 6px;
}

.input-field[type="color"]::-webkit-color-swatch-wrapper {
  padding: 0;
}

/* ============ DISABLED STATE ============ */
.input-field:disabled,
.textarea-field:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: var(--bg);
}

/* ============ RESPONSIVE ============ */
@media (max-width: 768px) {
  .file-dropzone {
    padding: 1.5rem 1rem;
  }
  
  .drop-icon {
    width: 44px;
    height: 44px;
    font-size: 1.1rem;
  }
  
  .input-lg {
    min-height: 48px;
  }
}
</style>