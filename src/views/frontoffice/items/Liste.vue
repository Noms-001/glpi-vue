<script setup>
// @ts-nocheck
import { ref, onMounted, computed, watch } from 'vue'
import FrontLayout from '../../../layouts/FrontLayout.vue'
import BaseCard from '../../../components/base/BaseCard.vue'
import BaseInput from '../../../components/base/BaseInput.vue'
import BaseSelect from '../../../components/base/BaseSelect.vue'
import BaseButton from '../../../components/base/BaseButton.vue'
import { getAllItems } from '../../../utils/ItemManager'
import { useToast } from '../../../composables/useToast'
import { getSessionToken } from '../../../api/glpi-client.js'
import axios from 'axios'
import { locationService, stateService, manufacturerService } from '../../../services/BaseService'

const currentPage = ref(1)
const itemsPerPage = ref(9)

const items = ref([])
const loading = ref(true)
const { showError } = useToast()

// --- Filtres multi-critères ---
const searchQuery = ref('')
const filterType = ref('all')
const filterState = ref('all')
const filterLocation = ref('all')
const filterManufacturer = ref('all')

const typeOptions = [
    { value: 'all', label: 'Tous les types' },
    { value: 'Computer', label: 'Ordinateurs' },
    { value: 'Monitor', label: 'Moniteurs' },
    { value: 'Phone', label: 'Téléphones' }
]

const stateOptions = ref([{ value: 'all', label: 'Tous les états' }])
const locationOptions = ref([{ value: 'all', label: 'Tous les emplacements' }])
const manufacturerOptions = ref([{ value: 'all', label: 'Tous les fabricants' }])

// Fonction pour générer une variant de badge
const getBadgeVariant = (stateName) => {
    if (!stateName) return 'default'
    const name = stateName.toLowerCase()
    if (name.includes('neuf') || name.includes('new')) return 'success'
    if (name.includes('cours') || name.includes('progress')) return 'warning'
    if (name.includes('réformé') || name.includes('retired')) return 'danger'
    if (name.includes('stock') || name.includes('inventory')) return 'secondary'
    return 'primary'
}

const updateFilterOptions = () => {
    const states = new Map()
    const locations = new Map()
    for (const it of items.value) {
        const s = it.stateObject?.name || 'Inconnu'
        states.set(s, s)
        const l = it.locationObject?.name || 'Sans emplacement'
        locations.set(l, l)
    }

    stateOptions.value = [
        { value: 'all', label: 'Tous les états' }, 
        ...Array.from(states.values()).map(s => ({ value: s, label: s }))
    ]
    locationOptions.value = [
        { value: 'all', label: 'Tous les emplacements' }, 
        ...Array.from(locations.values()).map(l => ({ value: l, label: l }))
    ]

    const manufacturers = new Map()
    for (const it of items.value) {
        const m = it.manufacturerObject?.name || 'Inconnu'
        manufacturers.set(m, m)
    }
    manufacturerOptions.value = [
        { value: 'all', label: 'Tous les fabricants' }, 
        ...Array.from(manufacturers.values()).map(m => ({ value: m, label: m }))
    ]
}

const filteredItems = computed(() => {
    const q = String(searchQuery.value || '').trim().toLowerCase()
    return items.value.filter(it => {
        if (filterType.value !== 'all' && it.itemtype !== filterType.value) return false
        if (filterState.value !== 'all') {
            const name = it.stateObject?.name || 'Inconnu'
            if (name !== filterState.value) return false
        }
        if (filterLocation.value !== 'all') {
            const lname = it.locationObject?.name || 'Sans emplacement'
            if (lname !== filterLocation.value) return false
        }
        if (filterManufacturer.value !== 'all') {
            const mname = it.manufacturerObject?.name || 'Inconnu'
            if (mname !== filterManufacturer.value) return false
        }
        if (q) {
            const hay = [
                it.name, it.serial, it.otherserial, it.brand, 
                it.model, it.itemtype, it.manufacturerObject?.name
            ].filter(Boolean).join(' ').toLowerCase()
            if (!hay.includes(q)) return false
        }
        return true
    })
})

function clearFilters() {
    searchQuery.value = ''
    filterType.value = 'all'
    filterState.value = 'all'
    filterLocation.value = 'all'
    filterManufacturer.value = 'all'
}

const hasActiveFilters = computed(() => {
    return filterType.value !== 'all' || 
           filterState.value !== 'all' || 
           filterLocation.value !== 'all' || 
           filterManufacturer.value !== 'all' ||
           searchQuery.value.trim() !== ''
})

const SESSION_TOKEN = getSessionToken()
const GLPI_API_URL = import.meta.env.VITE_GLPI_URL
const APP_TOKEN = import.meta.env.VITE_GLPI_APP_TOKEN

const getItemImage = async (item) => {
    if (!item.documents?.length) {
        return 'https://placehold.co/600x400?text=No+Image'
    }

    try {
        const response = await axios.get(
            `${GLPI_API_URL}/Document/${item.documents[0].id}?app_token=${APP_TOKEN}&alt=media`, 
            {
                headers: {
                    'Accept': 'application/json',
                    'Session-Token': SESSION_TOKEN
                },
                responseType: 'blob'
            }
        )
        const imageBlob = await response.data
        return URL.createObjectURL(imageBlob)
    } catch (error) {
        console.error('Erreur lors de la récupération de l\'image GLPI :', error)
        return 'https://placehold.co/600x400?text=No+Image'
    }
}

// --- Pagination ---
const totalPages = computed(() => Math.ceil(filteredItems.value.length / itemsPerPage.value))
const paginatedItems = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage.value
    const end = start + itemsPerPage.value
    return filteredItems.value.slice(start, end)
})

// Compteurs par type
const computerCount = computed(() => items.value.filter(i => i.itemtype === 'Computer').length)
const monitorCount = computed(() => items.value.filter(i => i.itemtype === 'Monitor').length)
const phoneCount = computed(() => items.value.filter(i => i.itemtype === 'Phone').length)

// --- Réinitialisation de la page à chaque changement de filtre ---
watch([searchQuery, filterType, filterState, filterLocation, filterManufacturer], () => {
    currentPage.value = 1
})

watch([currentPage, totalPages], () => {
    if (currentPage.value > totalPages.value && totalPages.value > 0) {
        currentPage.value = totalPages.value
    }
})

// --- Navigation pagination ---
function nextPage() {
    if (currentPage.value < totalPages.value) currentPage.value++
}
function prevPage() {
    if (currentPage.value > 1) currentPage.value--
}
function goToPage(page) {
    currentPage.value = Math.min(Math.max(1, page), totalPages.value)
}

onMounted(async () => {
    try {
        try {
            const [locs, states, manufacturers] = await Promise.all([
                locationService.getAll(),
                stateService.getAll(),
                manufacturerService.getAll()
            ])

            locationOptions.value = [
                { value: 'all', label: 'Tous les emplacements' }, 
                ...locs.map(l => ({ value: l.name, label: l.name }))
            ]
            stateOptions.value = [
                { value: 'all', label: 'Tous les états' }, 
                ...states.map(s => ({ value: s.name, label: s.name }))
            ]
            manufacturerOptions.value = [
                { value: 'all', label: 'Tous les fabricants' }, 
                ...manufacturers.map(m => ({ value: m.name, label: m.name }))
            ]
        } catch (e) {
            console.warn('Impossible de charger les listes de référence:', e)
        }

        const data = await getAllItems()
        items.value = await Promise.all(
            data.map(async item => ({
                ...item,
                image: await getItemImage(item)
            }))
        )
        updateFilterOptions()
    } catch (error) {
        console.error('Erreur lors du chargement des items:', error)
        showError('Impossible de charger les actifs')
    } finally {
        loading.value = false
    }
})
</script>

<template>
    <FrontLayout :show-back-button="false">
        <!-- Page Header -->
        <div class="page-header mb-4">
            <span class="eyebrow">Actifs</span>
            <h1 class="page-title">Liste des équipements</h1>
            <p class="page-subtitle">
                Consultez tous les équipements disponibles — {{ items.length }} au total
            </p>
        </div>

        <!-- Cartes de statistiques -->
        <div class="row g-3 mb-4">
            <div class="col-6 col-md-3">
                <div class="stat-card">
                    <div class="stat-card-icon">
                        <i class="bi bi-pc-display"></i>
                    </div>
                    <div class="stat-card-content">
                        <span class="stat-card-value">{{ loading ? '—' : computerCount }}</span>
                        <span class="stat-card-label">Ordinateurs</span>
                    </div>
                </div>
            </div>
            <div class="col-6 col-md-3">
                <div class="stat-card">
                    <div class="stat-card-icon">
                        <i class="bi bi-display"></i>
                    </div>
                    <div class="stat-card-content">
                        <span class="stat-card-value">{{ loading ? '—' : monitorCount }}</span>
                        <span class="stat-card-label">Moniteurs</span>
                    </div>
                </div>
            </div>
            <div class="col-6 col-md-3">
                <div class="stat-card">
                    <div class="stat-card-icon">
                        <i class="bi bi-phone"></i>
                    </div>
                    <div class="stat-card-content">
                        <span class="stat-card-value">{{ loading ? '—' : phoneCount }}</span>
                        <span class="stat-card-label">Téléphones</span>
                    </div>
                </div>
            </div>
            <div class="col-6 col-md-3">
                <div class="stat-card">
                    <div class="stat-card-icon">
                        <i class="bi bi-box-seam"></i>
                    </div>
                    <div class="stat-card-content">
                        <span class="stat-card-value">{{ loading ? '—' : items.length }}</span>
                        <span class="stat-card-label">Total</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- Filtres -->
        <div class="card-custom mb-4">
            <div class="row g-3">
                <!-- Recherche -->
                <div class="col-12">
                    <BaseInput 
                        v-model="searchQuery" 
                        placeholder="Rechercher par nom, marque, modèle, numéro de série..."
                        icon="bi bi-search"
                    />
                </div>
                
                <!-- Filtres -->
                <div class="col-md-3">
                    <BaseSelect 
                        v-model="filterType" 
                        :options="typeOptions" 
                        optionLabel="label" 
                        optionValue="value"
                        label="Type"
                    />
                </div>
                <div class="col-md-3">
                    <BaseSelect 
                        v-model="filterState" 
                        :options="stateOptions" 
                        optionLabel="label" 
                        optionValue="value"
                        label="État"
                    />
                </div>
                <div class="col-md-3">
                    <BaseSelect 
                        v-model="filterLocation" 
                        :options="locationOptions" 
                        optionLabel="label" 
                        optionValue="value"
                        label="Emplacement"
                    />
                </div>
                <div class="col-md-3">
                    <BaseSelect 
                        v-model="filterManufacturer" 
                        :options="manufacturerOptions" 
                        optionLabel="label" 
                        optionValue="value"
                        label="Fabricant"
                    />
                </div>
                
                <!-- Bouton reset -->
                <div v-if="hasActiveFilters" class="col-12">
                    <button class="filter-clear-btn" @click="clearFilters">
                        <i class="bi bi-x-lg"></i> Réinitialiser tous les filtres
                    </button>
                </div>
            </div>
        </div>

        <!-- Résultats -->
        <div class="d-flex justify-content-between align-items-center mb-3">
            <p class="text-muted-custom mb-0">
                <strong>{{ filteredItems.length }}</strong> équipement(s) trouvé(s)
            </p>
        </div>

        <!-- Loading -->
        <div v-if="loading" class="text-center py-5">
            <div class="skeleton-grid">
                <div v-for="i in 6" :key="i" class="card-custom">
                    <div class="skeleton skeleton-image"></div>
                    <div class="p-3">
                        <div class="skeleton skeleton-line mb-2" style="width: 70%;"></div>
                        <div class="skeleton skeleton-line mb-2" style="width: 50%;"></div>
                        <div class="skeleton skeleton-line" style="width: 30%;"></div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Vide -->
        <div v-else-if="items.length === 0" class="empty-state-large">
            <i class="bi bi-inbox"></i>
            <h3>Aucun équipement</h3>
            <p>Aucun équipement n'est disponible pour le moment.</p>
        </div>

        <!-- Résultats vides après filtre -->
        <div v-else-if="filteredItems.length === 0" class="empty-state-large">
            <i class="bi bi-funnel"></i>
            <h3>Aucun résultat</h3>
            <p>Aucun équipement ne correspond à vos critères de recherche.</p>
            <BaseButton label="Réinitialiser les filtres" variant="outline-secondary" @click="clearFilters" />
        </div>

        <!-- Grille d'items -->
        <div v-else class="row g-4">
            <div v-for="item in paginatedItems" :key="`${item.itemtype}-${item.id}`" class="col-12 col-sm-6 col-lg-4">
                <BaseCard 
                    :title="item.name || 'Sans nom'" 
                    :subtitle="item.itemtype" 
                    :image="item.image"
                    :badges="[
                        {
                            label: item.stateObject?.name || 'Inconnu',
                            variant: getBadgeVariant(item.stateObject?.name)
                        }
                    ]"
                >
                    <template #footer>
                        <div class="item-details">
                            <div class="item-detail-row">
                                <i class="bi bi-geo-alt"></i>
                                <span>{{ item.locationObject?.name || '—' }}</span>
                            </div>
                            <div class="item-detail-row">
                                <i class="bi bi-upc-scan"></i>
                                <span>{{ item.otherserial || item.serial || '—' }}</span>
                            </div>
                            <div class="item-detail-row">
                                <i class="bi bi-person"></i>
                                <span>{{ item.userObject?.name || 'Non assigné' }}</span>
                            </div>
                            <div class="item-detail-row">
                                <i class="bi bi-building"></i>
                                <span>{{ item.manufacturerObject?.name || '—' }}</span>
                            </div>
                        </div>
                    </template>
                </BaseCard>
            </div>
        </div>

        <!-- Pagination -->
        <div v-if="!loading && filteredItems.length > 0 && totalPages > 1" class="pagination-wrapper mt-4">
            <div class="pagination-info">
                <span>{{ (currentPage - 1) * itemsPerPage + 1 }}-{{ Math.min(currentPage * itemsPerPage, filteredItems.length) }} sur {{ filteredItems.length }}</span>
            </div>
            
            <div class="pagination-controls">
                <button 
                    class="pagination-btn" 
                    :disabled="currentPage === 1"
                    @click="prevPage"
                    aria-label="Page précédente"
                >
                    <i class="bi bi-chevron-left"></i>
                </button>
                
                <button 
                    v-for="page in totalPages" 
                    :key="page"
                    :class="['pagination-btn', { 'pagination-btn-active': currentPage === page }]"
                    @click="goToPage(page)"
                >
                    {{ page }}
                </button>
                
                <button 
                    class="pagination-btn" 
                    :disabled="currentPage === totalPages"
                    @click="nextPage"
                    aria-label="Page suivante"
                >
                    <i class="bi bi-chevron-right"></i>
                </button>
            </div>
        </div>
    </FrontLayout>
</template>

<style scoped>
/* ============ PAGE HEADER ============ */
.page-header {
    margin-bottom: 1.5rem;
}

.eyebrow {
    display: inline-flex;
    align-items: center;
    padding: 0.35rem 0.85rem;
    border-radius: 999px;
    background: var(--brand-green-light);
    color: var(--brand-green);
    font-size: 0.78rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: 0.5rem;
}

.page-title {
    font-size: 2rem;
    font-weight: 800;
    color: var(--text-main);
    margin: 0 0 0.25rem 0;
    letter-spacing: -0.02em;
}

.page-subtitle {
    color: var(--text-muted);
    font-size: 0.95rem;
    font-weight: 500;
    margin: 0;
}

/* ============ STAT CARDS ============ */
.stat-card {
    background: var(--card-bg);
    border: 1px solid var(--border-color);
    border-radius: 14px;
    padding: 1rem;
    display: flex;
    align-items: center;
    gap: 0.85rem;
    transition: all 0.2s ease;
    box-shadow: var(--shadow-card);
}

.stat-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
}

.stat-card-icon {
    width: 44px;
    height: 44px;
    border-radius: 12px;
    background: var(--pill-bg);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.1rem;
    color: var(--brand-green);
    flex-shrink: 0;
}

.stat-card-content {
    display: flex;
    flex-direction: column;
    gap: 0.15rem;
}

.stat-card-value {
    font-size: 1.5rem;
    font-weight: 800;
    color: var(--text-main);
    line-height: 1.1;
}

.stat-card-label {
    font-size: 0.78rem;
    font-weight: 500;
    color: var(--text-muted);
}

/* ============ FILTER CARD ============ */
.card-custom {
    background: var(--card-bg);
    border: 1px solid var(--border-color);
    border-radius: 16px;
    box-shadow: var(--shadow-card);
    padding: 24px;
}

.filter-clear-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    padding: 0.4rem 0.85rem;
    border: none;
    border-radius: 8px;
    background: rgba(239, 68, 68, 0.08);
    color: var(--danger-color);
    font-size: 0.8rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    font-family: var(--font-family);
}

.filter-clear-btn:hover {
    background: rgba(239, 68, 68, 0.15);
}

/* ============ ITEM DETAILS ============ */
.item-details {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    font-size: 0.82rem;
    color: var(--text-muted);
}

.item-detail-row {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.item-detail-row i {
    width: 18px;
    text-align: center;
    color: var(--brand-green);
    font-size: 0.85rem;
    flex-shrink: 0;
}

.item-detail-row span {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

/* ============ PAGINATION ============ */
.pagination-wrapper {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem 0;
    gap: 1rem;
    flex-wrap: wrap;
}

.pagination-info {
    font-size: 0.85rem;
    color: var(--text-muted);
    font-weight: 500;
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

/* ============ EMPTY STATE ============ */
.empty-state-large {
    text-align: center;
    padding: 4rem 2rem;
    color: var(--text-muted);
}

.empty-state-large i {
    font-size: 3rem;
    display: block;
    margin-bottom: 1rem;
    opacity: 0.5;
}

.empty-state-large h3 {
    font-size: 1.2rem;
    color: var(--text-main);
    margin-bottom: 0.5rem;
}

.empty-state-large p {
    font-size: 0.9rem;
    margin-bottom: 1rem;
}

/* ============ SKELETON ============ */
.skeleton-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1.5rem;
}

.skeleton {
    background: var(--skeleton-bg);
    border-radius: 6px;
    position: relative;
    overflow: hidden;
}

.skeleton::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(90deg, transparent, var(--skeleton-highlight), transparent);
    transform: translateX(-100%);
    animation: shimmer 1.4s infinite;
}

.skeleton-image {
    width: 100%;
    height: 180px;
    border-radius: 16px 16px 0 0;
}

.skeleton-line {
    height: 14px;
    border-radius: 6px;
}

@keyframes shimmer {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
}

/* ============ RESPONSIVE ============ */
@media (max-width: 991px) {
    .skeleton-grid {
        grid-template-columns: repeat(2, 1fr);
    }
}

@media (max-width: 768px) {
    .page-title {
        font-size: 1.5rem;
    }
    
    .skeleton-grid {
        grid-template-columns: 1fr;
    }
    
    .pagination-wrapper {
        flex-direction: column;
        align-items: center;
    }
    
    .stat-card {
        padding: 0.75rem;
    }
    
    .stat-card-value {
        font-size: 1.2rem;
    }
}
</style>