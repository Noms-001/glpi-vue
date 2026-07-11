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
    }
})

const normalizedColumns = computed(() => {
    return /** @type {Array<any>} */ (props.columns).map((column, index) => {
        if (typeof column === 'string') {
            return {
                key: index,
                label: column
            }
        }
        return column
    })
})

// Émettre les changements de sélection
const emit = defineEmits(['update:selectedItems'])

// Vérifier si un item est sélectionné
const isItemSelected = (item) => {
    return props.selectedItems.some(selected => {
        if (typeof item === 'object' && typeof selected === 'object') {
            return JSON.stringify(item) === JSON.stringify(selected)
        }
        return item === selected
    })
}

// Basculer la sélection d'un item
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

// Sélectionner/désélectionner tous les items visibles
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
            // Désélectionner
            updated.splice(index, 1)
        } else if (!allSelected && index === -1) {
            // Sélectionner
            updated.push(item)
        }
    })
    emit('update:selectedItems', updated)
}

// Vérifier si tous les items visibles sont sélectionnés
const allItemsSelected = computed(() => {
    if (paginatedItems.value.length === 0) return false
    return paginatedItems.value.every(item => isItemSelected(item))
})

// Colonnes avec la colonne de sélection si multiSelect est activé
const columnsWithSelection = computed(() => {
    if (!props.multiSelect) {
        return normalizedColumns.value
    }
    return [
        {
            key: '__select__',
            label: 'Sélectionner',
            class: 'text-center'
        },
        ...normalizedColumns.value
    ]
})

const search = ref('')
const currentPage = ref(1)
const sortKey = ref('')
const sortDirection = ref('asc')

const filteredItems = computed(() => {
    if (!search.value) {
        return props.items
    }
    return props.items.filter(item =>
        JSON.stringify(item).toLowerCase().includes(search.value.toLowerCase())
    )
})

const sortedItems = computed(() => {
    if (!sortKey.value) {
        return filteredItems.value
    }
    return [...filteredItems.value].sort((a, b) => {
        const valueA = getValue(a, sortKey.value)
        const valueB = getValue(b, sortKey.value)
        if (valueA < valueB) {
            return sortDirection.value === 'asc' ? -1 : 1
        }
        if (valueA > valueB) {
            return sortDirection.value === 'asc' ? 1 : -1
        }
        return 0
    })
})

const totalPages = computed(() => Math.ceil(sortedItems.value.length / props.pageSize))

const paginatedItems = computed(() => {
    const items = sortedItems.value || []

    const start = (currentPage.value - 1) * props.pageSize
    const end = start + props.pageSize

    return items.slice(start, Math.min(end, items.length))
})

/** @param {any} key */
const sort = (key) => {
    if (!props.sortable) return
    if (sortKey.value === key) {
        sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
        return
    }
    sortKey.value = key
    sortDirection.value = 'asc'
}

/** @param {any} columnKey */
const getTotal = (columnKey) => {
    const total = filteredItems.value.reduce((sum, item) => {
        const value = Number(item?.[columnKey]) || 0
        return sum + value
    }, 0)

    return formatNumber(total)
}

/**
 * @param {any} item
 * @param {any} key
 */
const getValue = (item, key) => {
    const value = item?.[key]

    if (value === null || value === undefined) {
        return '_'
    }

    if (typeof value === 'number' && isFinite(value)) {
        return formatNumber(value)
    }

    if (typeof value === 'string' && value.trim() !== '' && !isNaN(value)) {
        const num = Number(value)
        return isFinite(num)
            ? formatNumber(num)
            : value
    }

    return value
}

const formatNumber = (num) => {
    return Number(parseFloat(num).toFixed(5))
}

const resolveBadgeVariant = (column, item) => {
    if (!column.badge) return null
    const value = getValue(item, column.key)
    if (typeof column.badgeVariant === 'function') {
        return column.badgeVariant(value, item)
    }
    if (typeof column.badgeVariant === 'string') {
        return column.badgeVariant
    }
    if (typeof column.badge === 'string') {
        return column.badge
    }
    return 'secondary'
}

const getBadgeClass = (column, item) => {
    const variant = resolveBadgeVariant(column, item)
    return variant ? ['badge', `bg-${variant}`] : ['badge', 'bg-secondary']
}

const getBadgeStyle = (column, item) => {
    if (!column.badgeColor) return null
    return {
        backgroundColor: column.badgeColor,
        color: column.badgeTextColor || '#fff'
    }
}

/** @param {any} item
 *  @param {number} index
 */
const getRowKey = (item, index) => {
    if (Array.isArray(item)) {
        return index
    }
    return item.id ?? index
}

/** @param {Event} event
 *  @param {any} item
 */
const handleRowClick = (event, item) => {
    if (!props.onRowClick) return
    const ignored = event.target.closest('button, input, select, textarea, a, .no-row-click')
    if (ignored) return
    props.onRowClick(item, event)
}

/** @param {any} align */
const normalizeAlignment = (align) => {
    if (!align) return null
    if (typeof align !== 'string') return null
    const normalized = align.trim().toLowerCase()
    if (normalized.startsWith('text-')) {
        return normalized
    }
    if (normalized === 'left' || normalized === 'start') {
        return 'text-start'
    }
    if (normalized === 'right' || normalized === 'end') {
        return 'text-end'
    }
    if (normalized === 'center') {
        return 'text-center'
    }
    return null
}

/** @param {any} value */
const isNumericValue = (value) => {
    if (typeof value === 'number' && isFinite(value)) {
        return true
    }
    if (typeof value !== 'string') {
        return false
    }
    const trimmed = value.trim()
    return trimmed !== '' && /^-?\d+(?:[\.,]\d+)?$/.test(trimmed)
}

/** @param {any} value */
const isDateValue = (value) => {
    if (value instanceof Date) {
        return !Number.isNaN(value.getTime())
    }
    if (typeof value !== 'string') {
        return false
    }
    const trimmed = value.trim()
    return /^\d{4}[-\/]\d{2}[-\/]\d{2}/.test(trimmed) || /^\d{2}[-\/]\d{2}[-\/]\d{4}/.test(trimmed)
}

/** @param {any} column
 *  @param {any} item
 */
const getCellAlignment = (column, item) => {
    const alignClass = normalizeAlignment(column.align)
    if (alignClass) return alignClass

    const rawValue = getValue(item, column.key)
    if (column.total || isNumericValue(rawValue) || isDateValue(rawValue)) {
        return 'text-end'
    }
    return 'text-start'
}

/** @param {any} column */
const getFooterCellAlignment = (column) => {
    const alignClass = normalizeAlignment(column.align)
    if (alignClass) return alignClass
    if (column.total) return 'text-end'
    if (isNumericValue(column.footer)) return 'text-end'
    return 'text-start'
}

const getHeadAlignment = (column, items) => {
    if (items.length === 0) return ''

    return getCellAlignment(column, items[0])
}

/** @param {any} column
 *  @param {any} item
 *  @param {Event} event
 */
const handleColumnClick = (column, item, event) => {
    if (column.onClick) {
        column.onClick(getValue(item, column.key), item, event)
        event.stopPropagation()
    }
}

const getPageTotal = (columnKey) => {
    return paginatedItems.value.reduce((sum, item) => {
        const value = Number(item?.[columnKey]) || 0;
        return sum + value;
    }, 0);
};

watch(search, () => {
    currentPage.value = 1
})

watch(() => props.items, () => {
    currentPage.value = 1
})
</script>

<template>
    <div :class="['base-table-container', customClass]">
        <div v-if="searchable" class="table-search">
            <div class="search-box">
                <span class="search-icon"><i class="bi bi-search"></i></span>

                <input v-model="search" type="text" placeholder="Rechercher..." />
            </div>
        </div>

        <div class="table-scroll">
            <table class="table table-modern align-middle no-total">
                <thead>
                    <tr>
                        <th v-if="multiSelect" class="text-center">
                            <input type="checkbox" :checked="allItemsSelected" @change="toggleAllSelection"
                                aria-label="Sélectionner tous" />
                        </th>
                        <th v-for="(column) in normalizedColumns" :key="column.key" @click="sort(column.key)"
                            :class="getHeadAlignment(column, paginatedItems)">
                            {{ column.label }}
                            <span v-if="sortKey === column.key">
                                {{ sortDirection === 'asc' ? '▲' : '▼' }}
                            </span>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <template v-if="loading">
                        <tr v-for="rowIndex in 4" :key="`skeleton-${rowIndex}`">
                            <td v-if="multiSelect" class="text-center">
                                <div class="skeleton skeleton-checkbox"></div>
                            </td>
                            <td v-for="column in normalizedColumns" :key="column.key"
                                :class="getFooterCellAlignment(column)">
                                <div class="skeleton skeleton-text"></div>
                            </td>
                        </tr>
                    </template>
                    <tr v-else-if="paginatedItems.length === 0">
                        <td :colspan="multiSelect ? normalizedColumns.length + 1 : normalizedColumns.length"
                            class="text-center py-5">Aucune
                            donnée</td>
                    </tr>
                    <tr v-else v-for="(item, index) in paginatedItems" :key="getRowKey(item, index)"
                        @click="handleRowClick($event, item)" :class="{ clickable: onRowClick }">
                        <td v-if="multiSelect" class="text-center no-row-click">
                            <input type="checkbox" :checked="isItemSelected(item)" @change="toggleItemSelection(item)"
                                :aria-label="`Sélectionner la ligne ${index + 1}`" />
                        </td>
                        <td v-for="column in normalizedColumns" :key="column.key"
                            :class="[column.class, getCellAlignment(column, item)]"
                            @click="handleColumnClick(column, item, $event)">
                            <slot :name="`cell-${column.key}`" :item="item" :value="getValue(item, column.key)"
                                :column="column">
                                <template v-if="column.badge">
                                    <span :class="getBadgeClass(column, item)" :style="getBadgeStyle(column, item)">
                                        {{ column.formatter ? column.formatter(getValue(item, column.key), item) :
                                            getValue(item, column.key) }}
                                    </span>
                                </template>
                                <template v-else>
                                    {{ column.formatter ? column.formatter(getValue(item, column.key), item) :
                                        getValue(item, column.key) }}
                                </template>
                            </slot>
                        </td>
                    </tr>
                </tbody>
                <tfoot v-if="!loading && normalizedColumns.some(col => col.total || col.footer)">
                    <tr>
                        <td v-if="multiSelect"></td>
                        <td v-for="column in normalizedColumns" :key="column.key"
                            :class="[getFooterCellAlignment(column), totalPages > 1 ? 'pad-red' : '' ]">

                            <template v-if="column.total">
                                <span class="grand-total mb-2" title="Total global">
                                    {{ column.totalFormatter ? column.totalFormatter(getTotal(column.key), paginatedItems) : getTotal(column.key) }}
                                </span>
                            </template>

                            <template v-else-if="column.footer">
                                {{ column.footer }}
                            </template>
                        </td>
                    </tr>
                    <tr v-if="totalPages > 1">
                        <td v-if="multiSelect"></td>
                        <td v-for="column in normalizedColumns" :key="column.key"
                            :class="['page-total', column.footer ? 'align-start' : '']">
                            <template v-if="column.total" title="Total page actuelle">
                                Page: {{ formatNumber(getPageTotal(column.key)) }}
                            </template>
                        </td>
                    </tr>
                </tfoot>
            </table>
        </div>

        <div class="table-pagination" v-if="totalPages > 1">
            <BaseButton label="Précédent" @click="currentPage--" :disabled="currentPage === 1" size="sm" />

            <span>
                Page {{ currentPage }} sur {{ totalPages }}
            </span>

            <BaseButton label="Suivant" @click="currentPage++" :disabled="currentPage === totalPages" size="sm" />
        </div>
    </div>
</template>

<style scoped>
.base-table-container {
    width: 100%;
    background: var(--surface-color);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-lg);
    overflow: hidden;
}

/* ===================================
   TOOLBAR
=================================== */

.table-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;

    padding: .75rem 1rem;

    background: var(--surface-color);
    border-bottom: 1px solid var(--border-color);
}

.toolbar-left {
    display: flex;
    align-items: center;
    gap: .5rem;
}

.toolbar-btn {
    display: flex;
    align-items: center;
    gap: .4rem;

    border: none;
    background: transparent;

    color: var(--text-muted-custom);

    padding: .45rem .75rem;

    border-radius: var(--radius-md);

    transition: var(--transition-fast);

    cursor: pointer;
}

.toolbar-btn:hover {
    background: rgba(59, 115, 247, .08);
    color: var(--primary-color);
}

/* ===================================
   SEARCH
=================================== */

.table-search {
    padding: 1rem;
    background: var(--surface-color);
    border-bottom: 1px solid var(--border-color);
}

.search-box {
    position: relative;
    max-width: 360px;
    width: 100%;
}

.search-icon {
    position: absolute;
    left: .9rem;
    top: 50%;
    transform: translateY(-50%);
    color: var(--text-muted-custom);
    font-size: .9rem;
}

.search-box input {
    width: 100%;
    height: 42px;

    padding-left: 2.5rem;
    padding-right: 1rem;

    border: 1px solid var(--border-color);
    border-radius: var(--radius-md);

    background: var(--surface-color);
    color: var(--text-color);

    transition: var(--transition-fast);
}

.search-box input::placeholder {
    color: var(--text-muted-custom);
}

.search-box input:focus {
    outline: none;

    border-color: var(--primary-color);

    box-shadow:
        0 0 0 3px rgba(59, 115, 247, .12);
}

/* ===================================
   TABLE
=================================== */

.table-scroll {
    overflow-x: auto;
}

.table {
    width: 100%;
    min-width: 900px;
    border-collapse: collapse;
}

thead {
    background: var(--text-muted-custom);
}

thead th {
    padding: .95rem .75rem;

    font-size: .82rem;
    font-weight: 600;

    text-transform: uppercase;

    color: var(--w-color);

    border-bottom: 1px solid var(--border-color);

    white-space: nowrap;

    user-select: none;

    transition: var(--transition-fast);

    background: var(--bg-gray);
}

tbody td {
    padding: .9rem .75rem;

    color: var(--text-color);

    border-bottom: 1px solid var(--border-color);

    white-space: nowrap;
    background-color: var(--light-color);
}

tbody tr {
    transition: var(--transition-fast);
}

tbody tr:hover {
    background: rgba(59, 115, 247, .04);
}

tbody tr:last-child td {
    border-bottom: none;
}

tfoot td {
    padding: .9rem .75rem;

    font-weight: 600;
    color: var(--text-color);

    border-top: 1px solid var(--border-color);

    border-bottom: none;

    background: var(--light-color);
}

.page-total {
    font-size: 0.75rem;
    color: var(--text-muted-custom);
    font-weight: normal;
    text-align: end;
    padding-top: 5px;
    border-top-style: dashed;
}

.pad-red {
    padding-bottom: 5px;
}

.align-start {
    text-align: start;
}

.grand-total {
    font-size: 0.9rem;
    color: var(--text-color);
    font-weight: 700;
}

/* ===================================
   ROW CLICK
=================================== */

.clickable {
    cursor: pointer;
}

/* ===================================
   PAGINATION
=================================== */

.table-pagination {
    display: flex;
    justify-content: center;
    align-items: center;

    gap: 1rem;

    padding: 1rem;

    border-top: 1px solid var(--border-color);

    background: var(--surface-color);
}

.table-pagination span {
    color: var(--text-muted-custom);
    font-size: .95rem;
}

/* ===================================
   SKELETON
=================================== */

.skeleton {
    width: 100%;
    height: 16px;

    border-radius: 4px;

    background:
        linear-gradient(90deg,
            var(--skeleton-bg) 25%,
            var(--skeleton-highlight) 50%,
            var(--skeleton-bg) 75%);

    background-size: 200% 100%;

    animation: skeleton-loading 1.5s infinite;
}

.skeleton-checkbox {
    width: 18px;
    height: 18px;
    margin: 0 auto;
}

@keyframes skeleton-loading {
    from {
        background-position: 200% 0;
    }

    to {
        background-position: -200% 0;
    }
}

/* ===================================
   CHECKBOXES
=================================== */

thead th input[type="checkbox"],
tbody td input[type="checkbox"] {
    width: 18px;
    height: 18px;
    cursor: pointer;
    accent-color: var(--primary-color);
}

thead th input[type="checkbox"]:disabled,
tbody td input[type="checkbox"]:disabled {
    cursor: not-allowed;
    opacity: 0.6;
}

/* ===================================
   RESPONSIVE
=================================== */

@media (max-width: 768px) {

    .table-toolbar {
        flex-direction: column;
        align-items: flex-start;
        gap: .75rem;
    }

    .search-box {
        max-width: 100%;
    }

    .table {
        min-width: 700px;
    }
}

.no-total {
    margin-bottom: 0 !important;
}
</style>
