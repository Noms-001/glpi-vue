<script setup>
// @ts-nocheck
import { computed, ref, watch } from 'vue'
import BaseButton from './BaseButton.vue'

const props = defineProps({
    items: {
        type: Array,
        default: () => []
    },
    columns: {
        type: Array,
        default: () => []
    },
    pageSize: {
        type: Number,
        default: 10
    },
    searchable: {
        type: Boolean,
        default: false
    },
    sortable: {
        type: Boolean,
        default: false
    },
    loading: {
        type: Boolean,
        default: false
    },
    customClass: {
        type: [String, Array, Object],
        default: ''
    },
    onRowClick: {
        type: Function,
        default: null
    },
    multiSelect: {
        type: Boolean,
        default: false
    },
    selectedItems: {
        type: Array,
        default: () => []
    },
    showPagination: {
        type: Boolean,
        default: true
    },
    emptyMessage: {
        type: String,
        default: 'Aucune donnée disponible'
    }
})

const emit = defineEmits(['update:selectedItems', 'page-change', 'sort-change'])

// ----- Normalisation des colonnes -----
const normalizedColumns = computed(() => {
    return props.columns.map((column, index) => {
        if (typeof column === 'string') {
            return {
                key: index,
                label: column
            }
        }
        return column
    })
})

// ----- État local -----
const search = ref('')
const currentPage = ref(1)
const sortKey = ref('')
const sortDirection = ref('asc')

// ----- Filtrage -----
const filteredItems = computed(() => {
    if (!search.value.trim()) {
        return props.items
    }
    const lowerSearch = search.value.toLowerCase()
    return props.items.filter(item =>
        JSON.stringify(item).toLowerCase().includes(lowerSearch)
    )
})

// ----- Tri -----
const sortedItems = computed(() => {
    if (!sortKey.value) {
        return filteredItems.value
    }
    return [...filteredItems.value].sort((a, b) => {
        const valueA = getValue(a, sortKey.value)
        const valueB = getValue(b, sortKey.value)
        
        if (valueA == null && valueB == null) return 0
        if (valueA == null) return 1
        if (valueB == null) return -1
        
        if (typeof valueA === 'number' && typeof valueB === 'number') {
            return sortDirection.value === 'asc' ? valueA - valueB : valueB - valueA
        }
        
        const strA = String(valueA).toLowerCase()
        const strB = String(valueB).toLowerCase()
        
        if (strA < strB) return sortDirection.value === 'asc' ? -1 : 1
        if (strA > strB) return sortDirection.value === 'asc' ? 1 : -1
        return 0
    })
})

// ----- Pagination -----
const totalPages = computed(() => Math.max(1, Math.ceil(sortedItems.value.length / props.pageSize)))

const paginatedItems = computed(() => {
    const start = (currentPage.value - 1) * props.pageSize
    return sortedItems.value.slice(start, start + props.pageSize)
})

// ----- Utilitaires -----
const getValue = (item, key) => {
    if (!item) return null
    return item[key]
}

const formatValue = (value) => {
    if (value === null || value === undefined) return '—'
    if (typeof value === 'number') {
        return new Intl.NumberFormat('fr-FR').format(value)
    }
    return value
}

const getRowKey = (item, index) => {
    return item?.id ?? item?.key ?? index
}

// ----- Sélection -----
const isItemSelected = (item) => {
    return props.selectedItems.some(selected => {
        if (typeof item === 'object' && typeof selected === 'object') {
            return JSON.stringify(item) === JSON.stringify(selected)
        }
        return item === selected
    })
}

const toggleItemSelection = (item) => {
    const updated = [...props.selectedItems]
    const index = updated.findIndex(selected => {
        if (typeof item === 'object' && typeof selected === 'object') {
            return JSON.stringify(item) === JSON.stringify(selected)
        }
        return item === selected
    })

    if (index > -1) {
        updated.splice(index, 1)
    } else {
        updated.push(item)
    }
    emit('update:selectedItems', updated)
}

const toggleAllSelection = () => {
    if (paginatedItems.value.length === 0) return

    const allSelected = paginatedItems.value.every(item => isItemSelected(item))
    const updated = [...props.selectedItems]

    paginatedItems.value.forEach(item => {
        const index = updated.findIndex(selected => {
            if (typeof item === 'object' && typeof selected === 'object') {
                return JSON.stringify(item) === JSON.stringify(selected)
            }
            return item === selected
        })

        if (allSelected && index > -1) {
            updated.splice(index, 1)
        } else if (!allSelected && index === -1) {
            updated.push(item)
        }
    })
    emit('update:selectedItems', updated)
}

const allItemsSelected = computed(() => {
    if (paginatedItems.value.length === 0) return false
    return paginatedItems.value.every(item => isItemSelected(item))
})

// ----- Tri -----
const sort = (key) => {
    if (!props.sortable) return
    if (sortKey.value === key) {
        sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
    } else {
        sortKey.value = key
        sortDirection.value = 'asc'
    }
    emit('sort-change', { key: sortKey.value, direction: sortDirection.value })
}

// ----- Pagination -----
const goToPage = (page) => {
    if (page < 1 || page > totalPages.value) return
    currentPage.value = page
    emit('page-change', page)
}

const goToPreviousPage = () => goToPage(currentPage.value - 1)
const goToNextPage = () => goToPage(currentPage.value + 1)

// ----- Interactions -----
const handleRowClick = (event, item) => {
    if (!props.onRowClick) return
    const ignored = event.target.closest('button, input, select, textarea, a, .no-row-click')
    if (ignored) return
    props.onRowClick(item, event)
}

const handleColumnClick = (column, item, event) => {
    if (column.onClick) {
        column.onClick(getValue(item, column.key), item, event)
        event.stopPropagation()
    }
}

// ----- Watchers -----
watch(search, () => {
    currentPage.value = 1
})

watch(() => props.items, () => {
    currentPage.value = 1
})

// ----- Pages visibles pour la pagination -----
const visiblePages = computed(() => {
    const pages = []
    const maxVisible = 5
    let start = Math.max(1, currentPage.value - Math.floor(maxVisible / 2))
    let end = Math.min(totalPages.value, start + maxVisible - 1)
    
    if (end - start < maxVisible - 1) {
        start = Math.max(1, end - maxVisible + 1)
    }
    
    for (let i = start; i <= end; i++) {
        pages.push(i)
    }
    return pages
})
</script>

<template>
    <div :class="['table-container', customClass]">
        <!-- Barre de recherche -->
        <div v-if="searchable" class="table-toolbar">
            <div class="search-wrapper">
                <i class="bi bi-search search-icon"></i>
                <input 
                    v-model="search" 
                    type="text" 
                    class="search-input"
                    placeholder="Rechercher..." 
                />
                <button 
                    v-if="search" 
                    class="search-clear" 
                    @click="search = ''"
                    aria-label="Effacer la recherche"
                >
                    <i class="bi bi-x-lg"></i>
                </button>
            </div>
            
            <div class="toolbar-info">
                <span class="results-count">{{ filteredItems.length }} résultat(s)</span>
            </div>
        </div>

        <!-- Table -->
        <div class="table-wrapper">
            <table class="table-custom">
                <thead>
                    <tr>
                        <!-- Colonne de sélection -->
                        <th v-if="multiSelect" class="th-checkbox">
                            <label class="checkbox-wrapper">
                                <input 
                                    type="checkbox" 
                                    :checked="allItemsSelected" 
                                    @change="toggleAllSelection"
                                    :aria-label="allItemsSelected ? 'Tout désélectionner' : 'Tout sélectionner'"
                                />
                                <span class="checkbox-indicator">
                                    <i v-if="allItemsSelected" class="bi bi-check-lg"></i>
                                    <i v-else class="bi bi-dash"></i>
                                </span>
                            </label>
                        </th>
                        
                        <!-- Colonnes de données -->
                        <th 
                            v-for="column in normalizedColumns" 
                            :key="column.key"
                            :class="[
                                'th-sortable',
                                column.class,
                                {
                                    'th-sorted': sortKey === column.key,
                                    'th-asc': sortKey === column.key && sortDirection === 'asc',
                                    'th-desc': sortKey === column.key && sortDirection === 'desc'
                                }
                            ]"
                            @click="sort(column.key)"
                            :style="{ textAlign: column.align || 'left' }"
                        >
                            <div class="th-content">
                                <span>{{ column.label }}</span>
                                <span v-if="sortable" class="sort-indicator">
                                    <i 
                                        :class="{
                                            'bi bi-chevron-expand': sortKey !== column.key,
                                            'bi bi-chevron-up': sortKey === column.key && sortDirection === 'asc',
                                            'bi bi-chevron-down': sortKey === column.key && sortDirection === 'desc'
                                        }"
                                    ></i>
                                </span>
                            </div>
                        </th>
                    </tr>
                </thead>
                
                <tbody>
                    <!-- État de chargement -->
                    <template v-if="loading">
                        <tr v-for="rowIndex in 4" :key="`skeleton-${rowIndex}`">
                            <td v-if="multiSelect" class="td-checkbox">
                                <div class="skeleton skeleton-circle"></div>
                            </td>
                            <td v-for="column in normalizedColumns" :key="column.key">
                                <div class="skeleton skeleton-line"></div>
                            </td>
                        </tr>
                    </template>
                    
                    <!-- État vide -->
                    <tr v-else-if="paginatedItems.length === 0">
                        <td 
                            :colspan="multiSelect ? normalizedColumns.length + 1 : normalizedColumns.length" 
                        >
                            <div class="empty-content">
                                <i class="bi bi-inbox empty-icon"></i>
                                <p class="empty-text">{{ emptyMessage }}</p>
                            </div>
                        </td>
                    </tr>
                    
                    <!-- Données -->
                    <tr 
                        v-else 
                        v-for="(item, index) in paginatedItems" 
                        :key="getRowKey(item, index)"
                        :class="{ 'row-clickable': onRowClick, 'row-selected': multiSelect && isItemSelected(item) }"
                        @click="handleRowClick($event, item)"
                    >
                        <td v-if="multiSelect" class="td-checkbox no-row-click">
                            <label class="checkbox-wrapper">
                                <input 
                                    type="checkbox" 
                                    :checked="isItemSelected(item)" 
                                    @change="toggleItemSelection(item)"
                                    :aria-label="`Sélectionner la ligne ${index + 1}`"
                                />
                                <span class="checkbox-indicator">
                                    <i v-if="isItemSelected(item)" class="bi bi-check-lg"></i>
                                </span>
                            </label>
                        </td>
                        
                        <td 
                            v-for="column in normalizedColumns" 
                            :key="column.key"
                            :class="column.class"
                            :style="{ textAlign: column.align || 'left' }"
                            @click="handleColumnClick(column, item, $event)"
                        >
                            <slot 
                                :name="`cell-${column.key}`" 
                                :item="item" 
                                :value="getValue(item, column.key)"
                                :column="column"
                            >
                                <!-- Badge -->
                                <span 
                                    v-if="column.badge"
                                    class="badge-custom"
                                    :class="`badge-${column.badgeVariant || 'default'}`"
                                    :style="column.badgeColor ? { 
                                        backgroundColor: column.badgeColor, 
                                        color: column.badgeTextColor || '#fff' 
                                    } : {}"
                                >
                                    {{ column.formatter ? column.formatter(getValue(item, column.key), item) : formatValue(getValue(item, column.key)) }}
                                </span>
                                
                                <!-- Texte simple -->
                                <span v-else class="cell-value">
                                    {{ column.formatter ? column.formatter(getValue(item, column.key), item) : formatValue(getValue(item, column.key)) }}
                                </span>
                            </slot>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- Pagination -->
        <div v-if="showPagination && totalPages > 1" class="table-pagination">
            <div class="pagination-info">
                <span>{{ (currentPage - 1) * pageSize + 1 }}-{{ Math.min(currentPage * pageSize, sortedItems.length) }} sur {{ sortedItems.length }}</span>
            </div>
            
            <div class="pagination-controls">
                <button 
                    class="pagination-btn" 
                    :disabled="currentPage === 1"
                    @click="goToPreviousPage"
                    aria-label="Page précédente"
                >
                    <i class="bi bi-chevron-left"></i>
                </button>
                
                <button 
                    v-for="page in visiblePages" 
                    :key="page"
                    :class="['pagination-btn', { 'pagination-btn-active': page === currentPage }]"
                    @click="goToPage(page)"
                >
                    {{ page }}
                </button>
                
                <button 
                    class="pagination-btn" 
                    :disabled="currentPage === totalPages"
                    @click="goToNextPage"
                    aria-label="Page suivante"
                >
                    <i class="bi bi-chevron-right"></i>
                </button>
            </div>
        </div>
    </div>
</template>

<style scoped>
/* ============ CONTAINER ============ */
.table-container {
    width: 100%;
    background: var(--card-bg);
    border: 1px solid var(--border-color);
    border-radius: 16px;
    overflow: hidden;
    box-shadow: var(--shadow-card);
}

/* ============ TOOLBAR ============ */
.table-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem 1.25rem;
    border-bottom: 1px solid var(--border-color);
    gap: 1rem;
    flex-wrap: wrap;
}

.search-wrapper {
    position: relative;
    flex: 1;
    max-width: 360px;
}

.search-icon {
    position: absolute;
    left: 0.85rem;
    top: 50%;
    transform: translateY(-50%);
    color: var(--text-muted);
    font-size: 0.9rem;
    pointer-events: none;
}

.search-input {
    width: 100%;
    height: 40px;
    padding: 0 2.5rem;
    border: 1px solid var(--border-color);
    border-radius: 10px;
    background: var(--bg);
    color: var(--text-main);
    font-family: var(--font-family);
    font-size: 0.88rem;
    transition: all 0.2s ease;
}

.search-input::placeholder {
    color: var(--text-muted);
}

.search-input:focus {
    outline: none;
    border-color: var(--brand-green);
    box-shadow: 0 0 0 3px rgba(14, 59, 54, 0.1);
}

.search-clear {
    position: absolute;
    right: 0.5rem;
    top: 50%;
    transform: translateY(-50%);
    background: var(--pill-bg);
    border: none;
    color: var(--text-muted);
    width: 24px;
    height: 24px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    font-size: 0.65rem;
    transition: all 0.2s ease;
}

.search-clear:hover {
    background: rgba(239, 68, 68, 0.12);
    color: var(--danger-color);
}

.toolbar-info {
    flex-shrink: 0;
}

.results-count {
    font-size: 0.82rem;
    font-weight: 500;
    color: var(--text-muted);
    background: var(--pill-bg);
    padding: 0.3rem 0.75rem;
    border-radius: 999px;
}

/* ============ TABLE WRAPPER ============ */
.table-wrapper {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
}

.table-custom {
    width: 100%;
    border-collapse: collapse;
    min-width: 700px;
}

/* ============ HEADER ============ */
thead {
    background: var(--bg);
}

thead th {
    padding: 0.85rem 1rem;
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--text-muted);
    border-bottom: 2px solid var(--border-color);
    white-space: nowrap;
    user-select: none;
}

.th-sortable {
    cursor: pointer;
    transition: color 0.2s ease;
}

.th-sortable:hover {
    color: var(--brand-green);
}

.th-content {
    display: flex;
    align-items: center;
    gap: 0.35rem;
}

.th-checkbox {
    width: 48px;
    text-align: center;
}

.sort-indicator {
    display: inline-flex;
    align-items: center;
    font-size: 0.7rem;
    color: var(--text-muted);
    transition: color 0.2s ease;
}

.th-sorted .sort-indicator {
    color: var(--brand-green);
}

.th-sorted {
    color: var(--brand-green) !important;
}

/* ============ BODY ============ */
tbody td {
    padding: 0.85rem 1rem;
    font-size: 0.88rem;
    color: var(--text-main);
    border-bottom: 1px solid var(--border-color);
    white-space: nowrap;
    transition: background 0.15s ease;
}

tbody tr {
    transition: background 0.2s ease;
}

tbody tr:hover {
    background: var(--pill-bg);
}

tbody tr:last-child td {
    border-bottom: none;
}

.row-clickable {
    cursor: pointer;
}

.row-selected {
    background: var(--brand-green-light) !important;
}

.td-checkbox {
    width: 48px;
    text-align: center;
}

.cell-value {
    color: var(--text-main);
}

/* ============ CHECKBOX ============ */
.checkbox-wrapper {
    display: inline-flex;
    align-items: center;
    cursor: pointer;
}

.checkbox-wrapper input[type="checkbox"] {
    position: absolute;
    opacity: 0;
    width: 0;
    height: 0;
}

.checkbox-indicator {
    width: 20px;
    height: 20px;
    border: 2px solid var(--border-color);
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
    background: var(--card-bg);
    color: transparent;
}

.checkbox-wrapper input:checked + .checkbox-indicator {
    background: var(--brand-green);
    border-color: var(--brand-green);
    color: #FFFFFF;
}

.checkbox-indicator i {
    font-size: 0.7rem;
    font-weight: bold;
}

/* ============ BADGES ============ */
.badge-custom {
    display: inline-flex;
    align-items: center;
    padding: 0.25rem 0.65rem;
    border-radius: 999px;
    font-size: 0.78rem;
    font-weight: 600;
}

.badge-default {
    background: var(--pill-bg);
    color: var(--text-main);
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

/* ============ EMPTY STATE ============ */

.empty-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 20px;
}

.empty-icon {
    font-size: 2.5rem;
    color: var(--text-muted);
    opacity: 0.5;
}

.empty-text {
    color: var(--text-muted);
    font-size: 0.9rem;
    font-weight: 500;
    margin: 0;
}

/* ============ SKELETON ============ */
.skeleton {
    height: 14px;
    border-radius: 6px;
    background: var(--skeleton-bg);
    position: relative;
    overflow: hidden;
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
    animation: shimmer 1.4s infinite;
}

.skeleton-circle {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    margin: 0 auto;
}

.skeleton-line {
    width: 80%;
}

@keyframes shimmer {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
}

/* ============ PAGINATION ============ */
.table-pagination {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.85rem 1.25rem;
    border-top: 1px solid var(--border-color);
    gap: 1rem;
    flex-wrap: wrap;
}

.pagination-info {
    font-size: 0.82rem;
    color: var(--text-muted);
}

.pagination-controls {
    display: flex;
    align-items: center;
    gap: 0.25rem;
}

.pagination-btn {
    min-width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid var(--border-color);
    border-radius: 8px;
    background: var(--card-bg);
    color: var(--text-main);
    font-size: 0.85rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    padding: 0 0.5rem;
    font-family: var(--font-family);
}

.pagination-btn:hover:not(:disabled) {
    background: var(--pill-bg);
    border-color: var(--brand-green);
    color: var(--brand-green);
}

.pagination-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
}

.pagination-btn-active {
    background: var(--brand-green) !important;
    border-color: var(--brand-green) !important;
    color: #FFFFFF !important;
}

/* ============ RESPONSIVE ============ */
@media (max-width: 768px) {
    .table-toolbar {
        flex-direction: column;
        align-items: stretch;
    }
    
    .search-wrapper {
        max-width: 100%;
    }
    
    .table-custom {
        min-width: 600px;
    }
    
    .table-pagination {
        flex-direction: column;
        align-items: center;
    }
    
    thead th,
    tbody td {
        padding: 0.65rem 0.75rem;
        font-size: 0.82rem;
    }
}
</style>