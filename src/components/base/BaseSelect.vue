<script setup>
// @ts-nocheck
import { computed, ref, watch, onMounted } from 'vue'

const props = defineProps({
    modelValue: {
        type: [String, Number, Object],
        default: null
    },
    label: {
        type: String,
        default: ''
    },
    placeholder: {
        type: String,
        default: 'Sélectionner'
    },
    options: {
        type: Array,
        default: () => []
    },
    optionLabel: {
        type: String,
        default: 'label'
    },
    optionValue: {
        type: String,
        default: 'value'
    },
    optionFormatter: {
        type: Function,
        default: null
    },
    required: {
        type: Boolean,
        default: false
    },
    disabled: {
        type: Boolean,
        default: false
    },
    error: {
        type: String,
        default: ''
    },
    customClass: {
        type: [String, Array, Object],
        default: ''
    },
    size: {
        type: String,
        default: 'md',
        validator: (value) => ['sm', 'md', 'lg'].includes(value)
    },
    autocomplete: {
        type: Boolean,
        default: false
    },
    allowCustom: {
        type: Boolean,
        default: false
    }
})

const emit = defineEmits(['update:modelValue'])

// ----- mode natif (select) -----
const updateValue = (event) => {
    const target = /** @type {HTMLSelectElement} */ (event.target)
    let value = target.value
    if (value !== '' && !isNaN(value)) {
        value = Number(value)
    }
    emit('update:modelValue', value)
}

// ----- mode autocomplete -----
const searchText = ref('')
const showDropdown = ref(false)
const highlightedIndex = ref(-1)
const inputRef = ref(null)
const dropdownRef = ref(null)

// Fonctions utilitaires sur les options
const getOptionLabel = (option) => {
    if (props.optionFormatter) {
        return props.optionFormatter(option)
    }
    if (typeof option === 'object') {
        return option[props.optionLabel]
    }
    return option
}

const getOptionValue = (option) => {
    if (typeof option === 'object') {
        return option[props.optionValue]
    }
    return option
}

// Récupérer l’option correspondant à la valeur courante (modelValue)
const selectedOption = computed(() => {
    if (props.modelValue === null || props.modelValue === undefined || props.modelValue === '') {
        return null
    }
    return props.options.find(opt => getOptionValue(opt) === props.modelValue) || null
})

// Mettre à jour searchText d’après la sélection
const updateSearchTextFromValue = () => {
    if (selectedOption.value) {
        searchText.value = getOptionLabel(selectedOption.value)
    } else if (props.autocomplete && props.allowCustom && typeof props.modelValue === 'string') {
        searchText.value = props.modelValue
    } else {
        searchText.value = ''
    }
}

const handleInput = (event) => {
    const target = /** @type {HTMLInputElement} */ (event.target)
    searchText.value = target.value
    showDropdown.value = true
    highlightedIndex.value = -1

    if (props.autocomplete && props.allowCustom) {
        const trimmedValue = target.value.trim()
        const matchingOption = props.options.some(opt => getOptionLabel(opt).toLowerCase() === trimmedValue.toLowerCase())
        if (trimmedValue !== '' && !matchingOption) {
            emit('update:modelValue', trimmedValue)
        }
    }
}

// Filtrer les options selon la recherche
const filteredOptions = computed(() => {
    if (!searchText.value.trim()) {
        return props.options
    }
    const lowerSearch = searchText.value.toLowerCase()
    return props.options.filter(opt => {
        const label = getOptionLabel(opt).toLowerCase()
        return label.includes(lowerSearch)
    })
})

// Sélectionner une option
const selectOption = (option) => {
    if (props.disabled) return
    const value = getOptionValue(option)
    emit('update:modelValue', value)
    searchText.value = getOptionLabel(option)
    showDropdown.value = false
    highlightedIndex.value = -1
}

const canAcceptCustomValue = () => {
    return props.autocomplete && props.allowCustom && searchText.value.trim() !== ''
}

const submitCustomValue = () => {
    if (!canAcceptCustomValue()) return
    emit('update:modelValue', searchText.value.trim())
    showDropdown.value = false
    highlightedIndex.value = -1
}

// Gestion clavier
const handleKeydown = (e) => {
    if (!showDropdown.value || filteredOptions.value.length === 0) return
    if (e.key === 'ArrowDown') {
        e.preventDefault()
        highlightedIndex.value = (highlightedIndex.value + 1) % filteredOptions.value.length
    } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        highlightedIndex.value = highlightedIndex.value <= 0 ? filteredOptions.value.length - 1 : highlightedIndex.value - 1
    } else if (e.key === 'Enter') {
        e.preventDefault()
        if (highlightedIndex.value >= 0) {
            selectOption(filteredOptions.value[highlightedIndex.value])
        } else if (canAcceptCustomValue()) {
            submitCustomValue()
        }
    } else if (e.key === 'Escape') {
        showDropdown.value = false
        highlightedIndex.value = -1
    }
}

// Fermer au clic extérieur
const handleClickOutside = (event) => {
    if (inputRef.value && !inputRef.value.contains(event.target) &&
        dropdownRef.value && !dropdownRef.value.contains(event.target)) {
        showDropdown.value = false
        // Restaurer le texte d’après la valeur sélectionnée si la recherche ne correspond à rien
        if (!selectedOption.value || searchText.value !== getOptionLabel(selectedOption.value)) {
            if (props.autocomplete && props.allowCustom && searchText.value.trim() !== '') {
                emit('update:modelValue', searchText.value.trim())
            }
            updateSearchTextFromValue()
        }
    }
}

watch(
  () => props.modelValue,
  (newValue) => {
    if (!props.autocomplete) return

    if (newValue === null || newValue === undefined || newValue === '') {
      searchText.value = ''
      showDropdown.value = false
      highlightedIndex.value = -1
      return
    }

    updateSearchTextFromValue()
  },
  { immediate: true }
)

// Démarrer l’écoute des clics extérieurs
onMounted(() => {
    if (props.autocomplete) {
        updateSearchTextFromValue()
        document.addEventListener('click', handleClickOutside)
    }
})

// Nettoyage (optionnel, mais bonne pratique)
// Dans Vue 3, on peut utiliser onBeforeUnmount
import { onBeforeUnmount } from 'vue'
onBeforeUnmount(() => {
    document.removeEventListener('click', handleClickOutside)
})
</script>

<template>
    <div :class="['base-select-container', customClass]">
        <label v-if="label" class="base-select-label">
            {{ label }}
            <span v-if="required" class="required">*</span>
        </label>

        <!-- Mode select natif -->
        <select v-if="!autocomplete" :value="modelValue" :disabled="disabled"
            :class="['base-select', `base-select-${size}`, { 'base-select-error': error }]" @change="updateValue">
            <option value="">{{ placeholder }}</option>
            <option v-for="option in options" :key="getOptionValue(option)" :value="getOptionValue(option)">
                {{ getOptionLabel(option) }}
            </option>
        </select>

        <!-- Mode autocomplete (combobox) avec Bootstrap -->
        <div v-else class="autocomplete-wrapper position-relative w-100">
            <input ref="inputRef" type="text" v-model="searchText" :placeholder="placeholder" :disabled="disabled"
                :class="[
                    `input-${size}`,
                    'form-control',
                    `form-control-${size}`,
                    { 'is-invalid': error }
                ]" @focus="showDropdown = true" @keydown="handleKeydown"
                @input="handleInput" />
            <ul v-if="showDropdown && filteredOptions.length > 0" ref="dropdownRef"
                class="dropdown-menu show w-100 autocomplete-dropdown"
                style="max-height: 250px; overflow-y: auto; position: absolute; z-index: 1000;">
                <li v-for="(option, idx) in filteredOptions" :key="getOptionValue(option)"
                    :class="['dropdown-item', { active: idx === highlightedIndex }]" @click="selectOption(option)"
                    @mouseenter="highlightedIndex = idx">
                    {{ getOptionLabel(option) }}
                </li>
            </ul>
            <small v-if="error" class="error-message text-danger mt-1">{{ error }}</small>
        </div>

        <!-- Affichage erreur pour le mode natif -->
        <small v-if="error && !autocomplete" class="error-message">{{ error }}</small>
    </div>
</template>

<style scoped>
/* Styles existants (gardés pour le mode natif) */
.base-select-container {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}

.base-select-label {
    font-weight: 600;
    color: var(--text-color);
}

input {
  background: var(--surface-color);
  color: var(--text-color);
  border-color: var(--border-color);
}

input::placeholder {
    color: var(--text-muted-custom);
}

.base-select {
    width: 100%;
    padding: 0.95rem 1rem;
    border-radius: var(--radius-lg);
    border: 1px solid var(--border-color);
    background: var(--surface-color);
    color: var(--text-color);
    transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
}

.required {
    color: var(--danger-color);
    margin-left: 0.2rem;
}

.base-select:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.08);
}

.base-select-error {
    border-color: var(--danger-color);
}

.error-message {
    color: var(--danger-color);
    font-size: 0.85rem;
}

.base-select-sm {
    padding: 0.5rem 0.95rem;
    font-size: 0.92rem;
}

.base-select-md {
    padding: 0.75rem 1rem;
    font-size: 0.95rem;
}

.base-select-lg {
    padding: 1.15rem 1.1rem;
    font-size: 1rem;
}

.input-sm {
  padding: 0.5rem 0.95rem;
  font-size: 0.92rem;
}

.input-md {
  padding: 0.7rem 1rem;
  font-size: 0.95rem;
}

.input-lg {
  padding: 1.15rem 1.1rem;
  font-size: 1rem;
}

/* Ajustements pour le dropdown autocomplete */
.autocomplete-dropdown {
    margin-top: 4px;
    background: white;
    border: 1px solid #ced4da;
    border-radius: 0.375rem;
    box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
}

.dropdown-item {
    cursor: pointer;
}

.dropdown-item.active,
.dropdown-item:active {
    background-color: var(--primary-color, #0d6efd);
    color: white;
}
</style>