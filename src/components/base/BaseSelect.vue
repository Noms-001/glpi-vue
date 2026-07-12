<script setup>
// @ts-nocheck
import { computed, ref, watch, onMounted, onBeforeUnmount } from 'vue'

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
        default: 'Sélectionner...'
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
    helper: {
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
    },
    clearable: {
        type: Boolean,
        default: false
    },
    searchable: {
        type: Boolean,
        default: false
    }
})

const emit = defineEmits(['update:modelValue', 'change', 'search'])

// ----- État interne -----
const searchText = ref('')
const showDropdown = ref(false)
const highlightedIndex = ref(-1)
const isFocused = ref(false)
const inputRef = ref(null)
const dropdownRef = ref(null)
const selectRef = ref(null)

// ----- Fonctions utilitaires -----
const getOptionLabel = (option) => {
    if (props.optionFormatter) {
        return props.optionFormatter(option)
    }
    if (typeof option === 'object' && option !== null) {
        return option[props.optionLabel]
    }
    return String(option)
}

const getOptionValue = (option) => {
    if (typeof option === 'object' && option !== null) {
        return option[props.optionValue]
    }
    return option
}

// ----- Option sélectionnée -----
const selectedOption = computed(() => {
    if (props.modelValue === null || props.modelValue === undefined || props.modelValue === '') {
        return null
    }
    return props.options.find(opt => getOptionValue(opt) === props.modelValue) || null
})

// ----- Options filtrées -----
const filteredOptions = computed(() => {
    if (!searchText.value.trim() || !props.autocomplete) {
        return props.options
    }
    const lowerSearch = searchText.value.toLowerCase()
    return props.options.filter(opt => {
        const label = getOptionLabel(opt).toLowerCase()
        return label.includes(lowerSearch)
    })
})

// ----- Mise à jour du texte de recherche -----
const updateSearchTextFromValue = () => {
    if (selectedOption.value) {
        searchText.value = getOptionLabel(selectedOption.value)
    } else if (props.autocomplete && props.allowCustom && typeof props.modelValue === 'string') {
        searchText.value = props.modelValue
    } else {
        searchText.value = ''
    }
}

// ----- Gestion des événements -----
const handleNativeChange = (event) => {
    const target = /** @type {HTMLSelectElement} */ (event.target)
    let value = target.value
    
    // Tentative de conversion en nombre
    if (value !== '' && !isNaN(value) && value.trim() !== '') {
        value = Number(value)
    } else if (value === '') {
        value = null
    }
    
    emit('update:modelValue', value)
    emit('change', value)
}

const handleInput = (event) => {
    const target = /** @type {HTMLInputElement} */ (event.target)
    searchText.value = target.value
    showDropdown.value = true
    highlightedIndex.value = -1

    emit('search', target.value)

    if (props.autocomplete && props.allowCustom) {
        const trimmedValue = target.value.trim()
        const matchingOption = props.options.some(
            opt => getOptionLabel(opt).toLowerCase() === trimmedValue.toLowerCase()
        )
        if (trimmedValue !== '' && !matchingOption) {
            emit('update:modelValue', trimmedValue)
        }
    }
}

const selectOption = (option) => {
    if (props.disabled) return
    const value = getOptionValue(option)
    emit('update:modelValue', value)
    emit('change', value)
    searchText.value = getOptionLabel(option)
    showDropdown.value = false
    highlightedIndex.value = -1
}

const clearSelection = () => {
    if (props.disabled) return
    emit('update:modelValue', null)
    emit('change', null)
    searchText.value = ''
    showDropdown.value = false
    highlightedIndex.value = -1
    inputRef.value?.focus()
}

const toggleDropdown = () => {
    if (props.disabled) return
    showDropdown.value = !showDropdown.value
    if (showDropdown.value) {
        highlightedIndex.value = -1
    }
}

const canAcceptCustomValue = () => {
    return props.autocomplete && props.allowCustom && searchText.value.trim() !== ''
}

const submitCustomValue = () => {
    if (!canAcceptCustomValue()) return
    const value = searchText.value.trim()
    emit('update:modelValue', value)
    emit('change', value)
    showDropdown.value = false
    highlightedIndex.value = -1
}

// ----- Gestion clavier -----
const handleKeydown = (e) => {
    if (!showDropdown.value || filteredOptions.value.length === 0) {
        if (e.key === 'Enter' && canAcceptCustomValue()) {
            e.preventDefault()
            submitCustomValue()
        }
        return
    }
    
    if (e.key === 'ArrowDown') {
        e.preventDefault()
        highlightedIndex.value = (highlightedIndex.value + 1) % filteredOptions.value.length
    } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        highlightedIndex.value = highlightedIndex.value <= 0 
            ? filteredOptions.value.length - 1 
            : highlightedIndex.value - 1
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

// ----- Clic extérieur -----
const handleClickOutside = (event) => {
    const target = event.target
    if (
        inputRef.value && !inputRef.value.contains(target) &&
        dropdownRef.value && !dropdownRef.value.contains(target) &&
        selectRef.value && !selectRef.value.contains(target)
    ) {
        showDropdown.value = false
        
        if (props.autocomplete) {
            if (props.allowCustom && searchText.value.trim() !== '') {
                emit('update:modelValue', searchText.value.trim())
            }
            updateSearchTextFromValue()
        }
    }
}

// ----- Watchers -----
watch(() => props.modelValue, (newValue) => {
    if (!props.autocomplete) return

    if (newValue === null || newValue === undefined || newValue === '') {
        searchText.value = ''
        showDropdown.value = false
        highlightedIndex.value = -1
        return
    }

    updateSearchTextFromValue()
}, { immediate: true })

// ----- Lifecycle -----
onMounted(() => {
    if (props.autocomplete) {
        updateSearchTextFromValue()
    }
    document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
    document.removeEventListener('click', handleClickOutside)
})
</script>

<template>
    <div :class="['select-container', customClass]">
        <!-- Label -->
        <label v-if="label" class="select-label">
            {{ label }}
            <span v-if="required" class="required-mark">*</span>
        </label>

        <!-- Mode Select Natif -->
        <div v-if="!autocomplete" class="select-native-wrapper" ref="selectRef">
            <select 
                :value="modelValue" 
                :disabled="disabled"
                :class="[
                    'select-native',
                    `select-${size}`,
                    { 'select-error': error }
                ]" 
                @change="handleNativeChange"
                @focus="isFocused = true"
                @blur="isFocused = false"
            >
                <option value="" disabled>{{ placeholder }}</option>
                <option 
                    v-for="option in options" 
                    :key="getOptionValue(option)" 
                    :value="getOptionValue(option)"
                >
                    {{ getOptionLabel(option) }}
                </option>
            </select>
            
            <!-- Icône chevron -->
            <i class="bi bi-chevron-down select-chevron"></i>
            
            <!-- Bouton clear -->
            <button 
                v-if="clearable && modelValue !== null && modelValue !== ''" 
                type="button" 
                class="select-clear-btn"
                @click.stop="clearSelection"
                aria-label="Effacer la sélection"
            >
                <i class="bi bi-x-lg"></i>
            </button>
        </div>

        <!-- Mode Autocomplete -->
        <div v-else class="autocomplete-wrapper" ref="selectRef">
            <div class="input-wrapper" :class="{ 'input-focused': isFocused, 'input-error': error }">
                <!-- Icône recherche -->
                <i class="bi bi-search input-icon left" v-if="searchable"></i>
                
                <input 
                    ref="inputRef" 
                    type="text" 
                    v-model="searchText" 
                    :placeholder="placeholder" 
                    :disabled="disabled"
                    :class="[
                        'input-field',
                        `input-${size}`,
                        { 
                            'has-icon-left': searchable,
                            'has-icon-right': clearable && modelValue
                        }
                    ]" 
                    @focus="isFocused = true; showDropdown = true" 
                    @blur="isFocused = false"
                    @keydown="handleKeydown"
                    @input="handleInput"
                    autocomplete="off"
                />
                
                <!-- Bouton clear -->
                <button 
                    v-if="clearable && modelValue !== null && modelValue !== ''" 
                    type="button" 
                    class="input-clear-btn"
                    @click.stop="clearSelection"
                    aria-label="Effacer la sélection"
                >
                    <i class="bi bi-x-lg"></i>
                </button>
                
                <!-- Icône dropdown -->
                <button 
                    type="button" 
                    class="input-dropdown-btn"
                    @click.stop="toggleDropdown"
                    :aria-label="showDropdown ? 'Fermer la liste' : 'Ouvrir la liste'"
                >
                    <i :class="showDropdown ? 'bi bi-chevron-up' : 'bi bi-chevron-down'"></i>
                </button>
            </div>

            <!-- Dropdown -->
            <Transition name="dropdown">
                <ul 
                    v-if="showDropdown && filteredOptions.length > 0" 
                    ref="dropdownRef"
                    class="dropdown-menu"
                >
                    <li 
                        v-for="(option, idx) in filteredOptions" 
                        :key="getOptionValue(option)"
                        :class="[
                            'dropdown-item',
                            { 
                                'dropdown-item-active': idx === highlightedIndex,
                                'dropdown-item-selected': modelValue === getOptionValue(option)
                            }
                        ]" 
                        @click="selectOption(option)"
                        @mouseenter="highlightedIndex = idx"
                    >
                        <span class="dropdown-item-label">{{ getOptionLabel(option) }}</span>
                        <i 
                            v-if="modelValue === getOptionValue(option)" 
                            class="bi bi-check-lg dropdown-item-check"
                        ></i>
                    </li>
                </ul>
            </Transition>
            
            <!-- Message "aucun résultat" -->
            <div 
                v-if="showDropdown && searchText && filteredOptions.length === 0 && !allowCustom" 
                class="dropdown-empty"
            >
                <i class="bi bi-search"></i>
                <span>Aucun résultat pour "{{ searchText }}"</span>
            </div>
            
            <!-- Option personnalisée -->
            <div 
                v-if="showDropdown && searchText && filteredOptions.length === 0 && allowCustom" 
                class="dropdown-custom"
                @click="submitCustomValue"
            >
                <i class="bi bi-plus-circle"></i>
                <span>Créer "{{ searchText }}"</span>
            </div>
        </div>

        <!-- Messages -->
        <small v-if="error" class="error-message">
            <i class="bi bi-exclamation-circle"></i> {{ error }}
        </small>
        <small v-if="helper && !error" class="helper-text">{{ helper }}</small>
    </div>
</template>

<style scoped>
/* ============ CONTAINER ============ */
.select-container {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

/* ============ LABEL ============ */
.select-label {
    font-size: 0.88rem;
    font-weight: 600;
    color: var(--text-main);
    letter-spacing: -0.01em;
}

.required-mark {
    color: var(--danger-color);
    margin-left: 0.15rem;
}

/* ============ SELECT NATIF ============ */
.select-native-wrapper {
    position: relative;
    display: flex;
    align-items: center;
}

.select-native {
    width: 100%;
    background: var(--card-bg);
    border: 1.5px solid var(--border-color);
    color: var(--text-main);
    border-radius: 10px;
    transition: all 0.2s ease;
    font-family: var(--font-family);
    cursor: pointer;
    appearance: none;
    -webkit-appearance: none;
    -moz-appearance: none;
    padding-right: 2.5rem;
}

.select-native:focus {
    outline: none;
    border-color: var(--brand-green);
    box-shadow: 0 0 0 3px rgba(14, 59, 54, 0.1);
}

.select-native.select-error {
    border-color: var(--danger-color);
}

.select-native:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    background: var(--bg);
}

/* Tailles */
.select-sm {
    padding: 0.45rem 0.85rem;
    font-size: 0.85rem;
    min-height: 38px;
}

.select-md {
    padding: 0.6rem 1rem;
    font-size: 0.9rem;
    min-height: 46px;
}

.select-lg {
    padding: 0.75rem 1.1rem;
    font-size: 0.95rem;
    min-height: 54px;
}

/* Chevron */
.select-chevron {
    position: absolute;
    right: 0.85rem;
    top: 50%;
    transform: translateY(-50%);
    color: var(--text-muted);
    font-size: 0.8rem;
    pointer-events: none;
    transition: transform 0.2s ease;
}

.select-native:focus + .select-chevron {
    transform: translateY(-50%) rotate(180deg);
}

/* Clear button */
.select-clear-btn {
    position: absolute;
    right: 2.2rem;
    top: 50%;
    transform: translateY(-50%);
    background: var(--pill-bg);
    border: none;
    color: var(--text-muted);
    width: 22px;
    height: 22px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    font-size: 0.65rem;
    transition: all 0.2s ease;
    z-index: 2;
}

.select-clear-btn:hover {
    background: rgba(239, 68, 68, 0.12);
    color: var(--danger-color);
}

/* ============ AUTOCOMPLETE ============ */
.autocomplete-wrapper {
    position: relative;
}

.input-wrapper {
    position: relative;
    display: flex;
    align-items: center;
}

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
}

.input-wrapper.input-focused .input-field {
    border-color: var(--brand-green);
    box-shadow: 0 0 0 3px rgba(14, 59, 54, 0.1);
}

.input-wrapper.input-error .input-field {
    border-color: var(--danger-color);
}

/* Tailles */
.input-sm {
    padding: 0.45rem 0.85rem;
    font-size: 0.85rem;
    min-height: 38px;
}

.input-md {
    padding: 0.6rem 1rem;
    font-size: 0.9rem;
    min-height: 46px;
}

.input-lg {
    padding: 0.75rem 1.1rem;
    font-size: 0.95rem;
    min-height: 54px;
}

/* Icon spacing */
.has-icon-left {
    padding-left: 2.5rem;
}

.has-icon-right {
    padding-right: 4.5rem;
}

/* Icônes */
.input-icon {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    color: var(--text-muted);
    font-size: 0.95rem;
    pointer-events: none;
}

.input-icon.left {
    left: 0.85rem;
}

/* Boutons dans l'input */
.input-clear-btn,
.input-dropdown-btn {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    background: transparent;
    border: none;
    color: var(--text-muted);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
    z-index: 2;
}

.input-clear-btn {
    right: 2.2rem;
    width: 22px;
    height: 22px;
    border-radius: 50%;
    font-size: 0.65rem;
}

.input-clear-btn:hover {
    background: rgba(239, 68, 68, 0.12);
    color: var(--danger-color);
}

.input-dropdown-btn {
    right: 0.5rem;
    width: 32px;
    height: 32px;
    border-radius: 8px;
    font-size: 0.8rem;
}

.input-dropdown-btn:hover {
    background: var(--pill-bg);
    color: var(--brand-green);
}

/* ============ DROPDOWN ============ */
.dropdown-menu {
    position: absolute;
    top: calc(100% + 4px);
    left: 0;
    right: 0;
    max-height: 240px;
    overflow-y: auto;
    background: var(--card-bg);
    border: 1px solid var(--border-color);
    border-radius: 12px;
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
    z-index: 1000;
    list-style: none;
    margin: 0;
    padding: 0.35rem;
}

.dropdown-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.6rem 0.85rem;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.15s ease;
    font-size: 0.88rem;
    color: var(--text-main);
    gap: 0.75rem;
}

.dropdown-item:hover {
    background: var(--pill-bg);
}

.dropdown-item-active {
    background: var(--brand-green-light);
    color: var(--brand-green);
}

.dropdown-item-selected {
    font-weight: 600;
}

.dropdown-item-label {
    flex: 1;
}

.dropdown-item-check {
    color: var(--brand-green);
    font-size: 0.9rem;
    flex-shrink: 0;
}

/* Messages dropdown */
.dropdown-empty,
.dropdown-custom {
    position: absolute;
    top: calc(100% + 4px);
    left: 0;
    right: 0;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1rem;
    background: var(--card-bg);
    border: 1px solid var(--border-color);
    border-radius: 12px;
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
    font-size: 0.85rem;
    color: var(--text-muted);
    z-index: 1000;
}

.dropdown-custom {
    cursor: pointer;
    color: var(--brand-green);
    font-weight: 500;
    transition: all 0.15s ease;
}

.dropdown-custom:hover {
    background: var(--brand-green-light);
}

.dropdown-custom i {
    font-size: 1rem;
}

/* Scrollbar dropdown */
.dropdown-menu::-webkit-scrollbar {
    width: 5px;
}

.dropdown-menu::-webkit-scrollbar-track {
    background: transparent;
}

.dropdown-menu::-webkit-scrollbar-thumb {
    background: var(--border-color);
    border-radius: 999px;
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

.helper-text {
    color: var(--text-muted);
    font-size: 0.8rem;
}

/* ============ TRANSITIONS ============ */
.dropdown-enter-active {
    transition: all 0.2s ease-out;
}

.dropdown-leave-active {
    transition: all 0.15s ease-in;
}

.dropdown-enter-from {
    opacity: 0;
    transform: translateY(-8px);
}

.dropdown-leave-to {
    opacity: 0;
    transform: translateY(-4px);
}

/* ============ RESPONSIVE ============ */
@media (max-width: 768px) {
    .dropdown-menu {
        max-height: 200px;
    }
    
    .select-lg,
    .input-lg {
        min-height: 48px;
    }
}
</style>