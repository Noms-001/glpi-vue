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

const sizeClass = computed(() => `base-input-${props.size}`)

const emit = defineEmits([
  'update:modelValue',
  'blur',
  'focus'
])

const showPassword = ref(false)
const isDragging = ref(false)
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
      // Comparer les objets par référence ou par leur sérialisation JSON
      if (typeof itemToToggle === 'object' && typeof item === 'object') {
        return JSON.stringify(item) === JSON.stringify(itemToToggle)
      }
      return item === itemToToggle
    })

    if (index > -1) {
      // L'élément existe, le retirer
      updatedArray.splice(index, 1)
    } else {
      // L'élément n'existe pas, l'ajouter
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
</script>

<template>
  <div :class="['base-input-container', customClass]">
    <label v-if="isCheckable" class="checkable-wrapper">
      <input :checked="type === 'checkbox' && Array.isArray(modelValue) ? isItemChecked : (modelValue == value)" :type="type" :disabled="disabled" :required="required"
        @change="handleCheckableChange" />
      <span>{{ label }}</span>
    </label>

    <template v-else>
      <label v-if="label" class="base-input-label">
        {{ label }}
        <span v-if="required" class="required">*</span>
      </label>

      <div class="input-wrapper">
        <i v-if="icon" :class="['input-icon-left', icon]" />

        <template v-if="type === 'textarea'">
          <textarea :value="modelValue" :name="name" :placeholder="placeholder" :disabled="disabled"
            :readonly="readonly" :required="required"
            :class="[sizeClass, 'base-input', 'base-textarea', { 'base-input-error': error }]"
            @input="updateValue($event)" @blur="$emit('blur')" @focus="$emit('focus')" />
        </template>

        <template v-else-if="type === 'file'">
          <div class="file-dropzone" :class="{ 'file-dragging': isDragging }" @click="triggerFileSelect"
            @dragover.prevent="handleDragOver" @dragenter.prevent="handleDragOver" @dragleave.prevent="handleDragLeave"
            @drop.prevent="handleDrop">
            <div class="drop-icon">
              <i class="bi bi-cloud-arrow-up-fill"></i>
            </div>
            <div class="drop-content">
              <strong>{{ fileCountLabel }}</strong>
            </div>
          </div>
          <input ref="fileInput" class="file-input" :type="type" :name="name" :disabled="disabled" :multiple="multiple"
            :accept="accept" :readonly="readonly" :required="required" @change="updateValue" />
        </template>

        <template v-else>
          <input :value="modelValue" :type="inputType" :name="name" :placeholder="placeholder" :disabled="disabled"
            :required="required"
            :class="['base-input', sizeClass, { 'has-left-icon': icon, 'has-right-icon': iconRight, 'base-input-error': error }]"
            @input="updateValue($event)" @blur="$emit('blur')" @focus="$emit('focus')" />
        </template>

        <i v-if="iconRight" :class="['input-icon-right', iconRight]" />

        <button v-if="type === 'password'" type="button" class="input-icon-right eye-icon"
          @click="showPassword = !showPassword"
          :aria-label="showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'">
          <i :class="showPassword ? 'bi bi-eye-slash' : 'bi bi-eye'" />
        </button>
      </div>

      <div v-if="type === 'file' && files.length" class="file-preview">
        <div v-for="(file, index) in files" :key="index" class="file-item">
          <div class="file-meta-wrap">
            <i class="bi bi-file-earmark-fill"></i>
            <div>
              <strong>{{ file.name }}</strong>
              <span>{{ (file.size / 1024).toFixed(1) }} KB</span>
            </div>
          </div>
          <button type="button" class="remove-file" @click="removeFile(index)" aria-label="Supprimer le fichier">
            <i class="bi bi-x-lg"></i>
          </button>
        </div>
      </div>
    </template>

    <small v-if="error" class="error-message">{{ error }}</small>
    <small v-if="helper && !error" class="helper-text mb-3">{{ helper }}</small>
  </div>
</template>

<style scoped>
.base-input-container {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.base-input-label {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--text-color);
}

.required {
  color: var(--danger-color);
  margin-left: 0.2rem;
}

.input-wrapper {
  position: relative;
}

.base-input,
.base-textarea {
  width: 100%;
  min-height: 48px;
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-color);
  background: var(--surface-color);
  color: var(--text-color);
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast), background var(--transition-fast);
}

.base-input-sm {
  padding: 0.5rem 0.95rem;
  font-size: 0.92rem;
  min-height: 40px;
}

.base-input-md {
  padding: 0.75rem 1rem;
  font-size: 0.95rem;
  min-height: 48px;
}

.base-input-lg {
  padding: 1.15rem 1.1rem;
  font-size: 1rem;
  min-height: 56px;
}

.base-input:focus,
.base-textarea:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.08);
}

.base-input-error {
  border-color: var(--danger-color);
}

.input-icon-left,
.input-icon-right {
  position: absolute;
  inset-block-start: 50%;
  transform: translateY(-50%);
  color: var(--text-muted-custom);
  font-size: 1rem;
}

.input-icon-left {
  inset-inline-start: 1rem;
}

.input-icon-right {
  inset-inline-end: 1rem;
}

.has-left-icon {
  padding-left: 3rem;
}

.has-right-icon {
  padding-right: 3rem;
}

.eye-icon {
  background: transparent;
  border: none;
  color: var(--text-muted-custom);
  position: absolute;
  inset-inline-end: 0.85rem;
  inset-block-start: 50%;
  transform: translateY(-50%);
  cursor: pointer;
}

.base-textarea {
  min-height: 140px;
  resize: vertical;
}

.checkable-wrapper {
  display: flex;
  gap: 0.85rem;
  align-items: center;
  cursor: pointer;
  color: var(--text-color);
}

.checkable-wrapper input {
  width: 18px;
  height: 18px;
}

.file-dropzone {
  display: grid;
  place-items: center;
  gap: 0.65rem;
  padding: 1.5rem 1rem;
  border-radius: var(--radius-xl);
  background: var(--bg-color);
  border: 1px dashed var(--border-color);
  color: var(--text-muted-custom);
  cursor: pointer;
  text-align: center;
  transition: border-color var(--transition-fast), background var(--transition-fast), transform var(--transition-fast);
}

.file-dropzone:hover,
.file-dropzone.file-dragging {
  border-color: var(--primary-color);
  background: rgba(79, 70, 229, 0.05);
  transform: translateY(-1px);
}

.drop-icon {
  width: 52px;
  height: 52px;
  display: grid;
  place-items: center;
  border-radius: 18px;
  background: rgba(79, 70, 229, 0.12);
  color: var(--primary-color);
  font-size: 1.4rem;
}

.file-input {
  display: none;
}

.file-preview {
  display: grid;
  gap: 0.75rem;
  margin-top: 0.9rem;
}

.file-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.95rem 1rem;
  border-radius: var(--radius-xl);
  background: var(--surface-color);
  border: 1px solid var(--border-color);
  box-shadow: var(--shadow-sm);
}

.helper-text {
  color: var(--text-muted-custom);
  font-size: 0.85rem;
}

.file-meta-wrap {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  min-width: 0;
}

.file-meta-wrap i {
  font-size: 1.25rem;
  color: var(--primary-color);
}

.file-meta-wrap strong {
  display: block;
  color: var(--text-color);
}

.file-meta-wrap span {
  display: block;
  color: var(--text-muted-custom);
  font-size: 0.9rem;
}

.remove-file {
  border: none;
  background: transparent;
  color: var(--text-muted-custom);
  cursor: pointer;
  display: grid;
  place-items: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  transition: background var(--transition-fast), color var(--transition-fast);
}

.remove-file:hover {
  background: rgba(239, 68, 68, 0.12);
  color: var(--danger-color);
}

.error-message {
  color: var(--danger-color);
  font-size: 0.85rem;
}

.base-input[type="color"] {
  width: 50px;
  padding: 3px !important;
}

.base-input[type="color"]::-webkit-color-swatch {
    border: none;
    border-radius: var(--radius-md);
}

.base-input[type="color"]::-webkit-color-swatch-wrapper {
    padding: 0;
}

/* Optionnel : aligner la hauteur avec les autres inputs */
.base-input[type="color"].base-input-sm {
  padding: 0.3rem;
  min-height: 40px;
}

.base-input[type="color"].base-input-md {
  padding: 0.5rem;
  min-height: 48px;
}

.base-input[type="color"].base-input-lg {
  padding: 0.7rem;
  min-height: 56px;
}
</style>
