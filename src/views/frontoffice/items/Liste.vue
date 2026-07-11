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
    { value: 'all', label: 'Tous' },
    { value: 'Computer', label: 'Ordinateur' },
    { value: 'Monitor', label: 'Moniteur' },
    { value: 'Phone', label: 'Téléphone' }
]

const stateOptions = ref([{ value: 'all', label: 'Tous' }])
const locationOptions = ref([{ value: 'all', label: 'Tous' }])
const manufacturerOptions = ref([{ value: 'all', label: 'Tous' }])

// Fonction pour générer une variant de badge cohérente (basée sur le hash du nom)
const getBadgeVariant = (stateName) => {
    if (!stateName) return 'info'
    const variants = ['primary', 'success', 'danger', 'warning']
    let hash = 0
    for (let i = 0; i < stateName.length; i++) {
        hash = ((hash << 5) - hash) + stateName.charCodeAt(i)
        hash |= 0 // conversion en entier 32 bits
    }
    const index = Math.abs(hash) % variants.length
    return variants[index]
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

    stateOptions.value = [{ value: 'all', label: 'Tous' }, ...Array.from(states.values()).map(s => ({ value: s, label: s }))]
    locationOptions.value = [{ value: 'all', label: 'Tous' }, ...Array.from(locations.values()).map(l => ({ value: l, label: l }))]

    const manufacturers = new Map()
    for (const it of items.value) {
        const m = it.manufacturerObject?.name || 'Inconnu'
        manufacturers.set(m, m)
    }
    manufacturerOptions.value = [{ value: 'all', label: 'Tous' }, ...Array.from(manufacturers.values()).map(m => ({ value: m, label: m }))]
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
            const hay = [it.name, it.serial, it.otherserial, it.brand, it.model, it.itemtype, it.manufacturerObject?.name].filter(Boolean).join(' ').toLowerCase()
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

const SESSION_TOKEN = getSessionToken()
const GLPI_API_URL = import.meta.env.VITE_GLPI_URL
const APP_TOKEN = import.meta.env.VITE_GLPI_APP_TOKEN

const getItemImage = async (item) => {
    if (!item.documents?.length) {
        return 'https://placehold.co/600x400?text=No+Image'
    }

    try {
        const response = await axios.get(`${GLPI_API_URL}/Document/${item.documents[0].id}?app_token=${APP_TOKEN}&alt=media`, {
            headers: {
                'Accept': 'application/json',
                'Session-Token': SESSION_TOKEN
            },
            responseType: 'blob'
        });

        const imageBlob = await response.data;
        return URL.createObjectURL(imageBlob);
    } catch (error) {
        console.error('Erreur lors de la récupération de l\'image GLPI :', error);
        return 'https://placehold.co/600x400?text=No+Image'
    }
}

// --- Pagination calculée ---
const totalPages = computed(() => Math.ceil(filteredItems.value.length / itemsPerPage.value))
const paginatedItems = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage.value
    const end = start + itemsPerPage.value
    return filteredItems.value.slice(start, end)
})

// --- Réinitialisation de la page à chaque changement de filtre ---
watch([searchQuery, filterType, filterState, filterLocation, filterManufacturer], () => {
    currentPage.value = 1
})

// --- Ajuste la page si elle dépasse le nombre total (ex: après filtrage) ---
watch([currentPage, totalPages], () => {
    if (currentPage.value > totalPages.value && totalPages.value > 0) {
        currentPage.value = totalPages.value
    }
})

// --- Méthodes de navigation ---
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

            locationOptions.value = [{ value: 'all', label: 'Tous' }, ...locs.map(l => ({ value: l.name, label: l.name }))]
            stateOptions.value = [{ value: 'all', label: 'Tous' }, ...states.map(s => ({ value: s.name, label: s.name }))]
            manufacturerOptions.value = [{ value: 'all', label: 'Tous' }, ...manufacturers.map(m => ({ value: m.name, label: m.name }))]
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
        <div class="container">
            <section class="section">
                <header class="page-header">
                    <span class="eyebrow">Actifs</span>
                    <h1 class="page-title">Liste des équipements</h1>
                    <p class="page-subtitle">Consultez tous les équipements disponibles</p>
                </header>

                <div class="demo-block row mb-3">
                    <BaseInput v-model="searchQuery" label="Recherche"
                        placeholder="Rechercher par nom, marque, modèle, serial ou overserial..."
                        custom-class="col-md-6 mb-3" />
                    <BaseSelect v-model="filterType" :options="typeOptions" optionLabel="label" optionValue="value"
                        label="Type" custom-class="col-md-4" />
                    <BaseButton variant="secondary" @click="clearFilters" label="Effacer"
                        custom-class="reset col-md-2 mb-3" />
                    <BaseSelect v-model="filterState" :options="stateOptions" optionLabel="label" optionValue="value"
                        label="État" custom-class="col-md-4" />
                    <BaseSelect v-model="filterLocation" :options="locationOptions" optionLabel="label"
                        optionValue="value" label="Emplacement" custom-class="col-md-4" />
                    <BaseSelect v-model="filterManufacturer" :options="manufacturerOptions" optionLabel="label"
                        optionValue="value" label="Fabricant" custom-class="col-md-4" />
                </div>

                <div class="section-panel mt-4 mb-4">
                    <p class="text-muted-custom">
                        Vous disposez de <strong>{{ items.length }}</strong> équipement(s).
                    </p>
                    <div class="row g-3 mt-3">
                        <div class="col-12 col-sm-6 col-md-4">
                            <div class="p-3 border rounded bg-body-secondary">
                                <p class="text-muted-custom mb-1 small">Ordinateurs</p>
                                <p class="h5 mb-0">{{items.filter(i => i.itemtype === 'Computer').length}}</p>
                            </div>
                        </div>
                        <div class="col-12 col-sm-6 col-md-4">
                            <div class="p-3 border rounded bg-body-secondary">
                                <p class="text-muted-custom mb-1 small">Moniteurs</p>
                                <p class="h5 mb-0">{{items.filter(i => i.itemtype === 'Monitor').length}}</p>
                            </div>
                        </div>
                        <div class="col-12 col-sm-6 col-md-4">
                            <div class="p-3 border rounded bg-body-secondary">
                                <p class="text-muted-custom mb-1 small">Téléphones</p>
                                <p class="h5 mb-0">{{items.filter(i => i.itemtype === 'Phone').length}}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div v-if="loading" class="py-5 text-center">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Chargement...</span>
                    </div>
                    <p class="mt-3 text-muted-custom">Chargement des équipements...</p>
                </div>

                <div v-else-if="items.length === 0" class="empty-state">
                    <i class="bi bi-inbox text-muted-custom"
                        style="font-size: 3rem; display: block; margin-bottom: 1rem;"></i>
                    <p class="text-muted-custom">Aucun équipement disponible</p>
                </div>

                <div v-else class="row g-4">
                    <div v-for="item in paginatedItems" :key="`${item.itemtype}-${item.id}`"
                        class="col-12 col-sm-6 col-lg-4">
                        <BaseCard :title="item.name" :subtitle="item.itemtype" variant="danger" :image="item.image"
                            :badges="[
                                {
                                    label: item.stateObject?.name || 'Inconnu',
                                    variant: getBadgeVariant(item.stateObject?.name)
                                }
                            ]">
                            <template #footer>
                                <div class="d-flex flex-column gap-3 small text-muted-custom">
                                    <div class="d-flex align-items-center gap-2">
                                        <i class="bi bi-geo-alt"></i>
                                        <span>{{ item.locationObject?.name || '—' }}</span>
                                    </div>
                                    <div class="d-flex align-items-center gap-2">
                                        <i class="bi bi-hash"></i>
                                        <span>{{ item.otherserial || item.serial || '—' }}</span>
                                    </div>
                                    <div class="d-flex align-items-center gap-2">
                                        <i class="bi bi-person"></i>
                                        <span>{{ item.userObject?.name || '—' }}</span>
                                    </div>
                                    <div class="d-flex align-items-center gap-2">
                                        <i class="bi bi-building"></i>
                                        <span>{{ item.manufacturerObject?.name || '—' }}</span>
                                    </div>
                                </div>
                            </template>
                        </BaseCard>
                    </div>
                </div>

                <!-- Composant pagination (affiché seulement si nécessaire) -->
                <div v-if="!loading && filteredItems.length > 0 && totalPages > 1" class="pagination-container mt-4">
                    <nav aria-label="Navigation des pages">
                        <ul class="pagination justify-content-center">
                            <li class="page-item" :class="{ disabled: currentPage === 1 }">
                                <a class="page-link" href="#" @click.prevent="prevPage">Précédent</a>
                            </li>
                            <li v-for="page in totalPages" :key="page" class="page-item"
                                :class="{ active: currentPage === page }">
                                <a class="page-link" href="#" @click.prevent="goToPage(page)">{{ page }}</a>
                            </li>
                            <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                                <a class="page-link" href="#" @click.prevent="nextPage">Suivant</a>
                            </li>
                        </ul>
                    </nav>
                </div>
            </section>
        </div>
    </FrontLayout>
</template>

<style scoped>
.reset {
    margin-top: auto;
    height: 50px;
}

.bg-body-secondary {
    background-color: var(--bg-color) !important;
    border-color: var(--border-color) !important;
}
</style>