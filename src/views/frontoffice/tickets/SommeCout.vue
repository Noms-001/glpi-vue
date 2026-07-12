<script setup>
// @ts-nocheck
import { onMounted, ref, computed } from 'vue'
import { getDetailsByItemType, getSumCost } from '../../../utils/TicketManager'
import FrontLayout from '../../../layouts/FrontLayout.vue'
import BaseTable from '../../../components/base/BaseTable.vue'
import { useToast } from '../../../composables/useToast'
import BaseModal from '../../../components/base/BaseModal.vue'
import BaseButton from '../../../components/base/BaseButton.vue'

const sum = ref([])
const details = ref([])
const loading = ref(false)
const loadingDetails = ref(false)
const showModal = ref(false)
const selectedType = ref('')
const { showError, showInfo } = useToast()

// Colonnes pour le tableau principal
const mainColumns = [
    { 
        key: 'type', 
        label: 'Type d\'élément',
        class: 'fw-semibold'
    },
    { 
        key: 'cost', 
        label: 'Coût standard',
        align: 'right',
        formatter: (value) => formatCurrency(value)
    },
    { 
        key: 'superCost', 
        label: 'Super Cost',
        align: 'right',
        formatter: (value) => formatCurrency(value)
    },
    { 
        key: 'openCost', 
        label: 'Coût réouverture',
        align: 'right',
        formatter: (value) => formatCurrency(value)
    },
    { 
        key: 'total', 
        label: 'Total',
        align: 'right',
        class: 'fw-bold',
        formatter: (value) => formatCurrency(value)
    }
]

// Colonnes pour le tableau de détails
const detailColumns = [
    { 
        key: 'name', 
        label: 'Élément',
        class: 'fw-semibold'
    },
    { 
        key: 'cost', 
        label: 'Coût standard',
        align: 'right',
        formatter: (value) => formatCurrency(value)
    },
    { 
        key: 'superCost', 
        label: 'Super Cost',
        align: 'right',
        formatter: (value) => formatCurrency(value)
    },
    { 
        key: 'openCost', 
        label: 'Coût réouverture',
        align: 'right',
        formatter: (value) => formatCurrency(value)
    },
    { 
        key: 'total', 
        label: 'Total',
        align: 'right',
        class: 'fw-bold',
        formatter: (value) => formatCurrency(value)
    }
]

// Statistiques globales
const globalStats = computed(() => {
    if (!sum.value.length) return { total: 0, count: 0 }
    
    const total = sum.value.reduce((acc, item) => acc + (Number(item.total) || 0), 0)
    return {
        total,
        count: sum.value.length
    }
})

// Détail des stats
const detailStats = computed(() => {
    if (!details.value.length) return { total: 0, count: 0 }
    
    const total = details.value.reduce((acc, item) => acc + (Number(item.total) || 0), 0)
    return {
        total,
        count: details.value.length
    }
})

function formatCurrency(value) {
    if (value === null || value === undefined) return '—'
    const num = Number(value)
    if (isNaN(num)) return '—'
    return `${num.toFixed(2)} €`
}

onMounted(async () => {
    loading.value = true
    try {
        sum.value = await getSumCost()
    } catch (error) {
        console.log(error)
        showError('Erreur lors du chargement des données')
    } finally {
        loading.value = false
    }
})

const showDetails = async (item) => {
    selectedType.value = item.type
    showModal.value = true
    loadingDetails.value = true
    try {
        details.value = await getDetailsByItemType(item.type)
    } catch (error) {
        console.log(error)
        showError('Erreur lors du chargement des détails')
    } finally {
        loadingDetails.value = false
    }
}
</script>

<template>
    <FrontLayout>
        <!-- Page Header -->
        <div class="page-header mb-4">
            <span class="eyebrow">Coûts</span>
            <h1 class="page-title">Somme des coûts</h1>
            <p class="page-subtitle">
                Vue d'ensemble des coûts par type d'élément — {{ globalStats.count }} type(s)
            </p>
        </div>

        <!-- Cartes de statistiques -->
        <div class="row g-3 mb-4">
            <div class="col-6 col-md-4">
                <div class="stat-card">
                    <div class="stat-card-icon">
                        <i class="bi bi-collection"></i>
                    </div>
                    <div class="stat-card-content">
                        <span class="stat-card-value">{{ globalStats.count }}</span>
                        <span class="stat-card-label">Types d'éléments</span>
                    </div>
                </div>
            </div>
            <div class="col-6 col-md-4">
                <div class="stat-card">
                    <div class="stat-card-icon text-success">
                        <i class="bi bi-cash-stack"></i>
                    </div>
                    <div class="stat-card-content">
                        <span class="stat-card-value">{{ formatCurrency(globalStats.total) }}</span>
                        <span class="stat-card-label">Coût total global</span>
                    </div>
                </div>
            </div>
            <div class="col-12 col-md-4">
                <div class="stat-card">
                    <div class="stat-card-icon text-warning">
                        <i class="bi bi-info-circle"></i>
                    </div>
                    <div class="stat-card-content">
                        <span class="stat-card-value text-muted">Cliquez</span>
                        <span class="stat-card-label">Sur une ligne pour voir le détail</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- Tableau principal -->
        <div class="card-custom">
            <div class="d-flex align-items-center gap-3 mb-4">
                <div class="stat-icon mb-0">
                    <i class="bi bi-bar-chart"></i>
                </div>
                <div>
                    <h2 class="section-title mb-0">Résumé par type</h2>
                    <p class="text-muted-custom small mb-0">
                        Coûts consolidés par type d'équipement
                    </p>
                </div>
            </div>

            <BaseTable 
                :items="sum" 
                :loading="loading" 
                :columns="mainColumns"
                :onRowClick="showDetails"
                sortable
                :pageSize="10"
                empty-message="Aucune donnée disponible"
            />
        </div>

        <!-- Modal Détails -->
        <BaseModal v-model="showModal" :title="`Détails — ${selectedType}`" size="lg">
            <!-- Stats du détail -->
            <div class="row g-3 mb-4">
                <div class="col-6">
                    <div class="detail-stat">
                        <span class="detail-stat-label">Éléments</span>
                        <span class="detail-stat-value">{{ detailStats.count }}</span>
                    </div>
                </div>
                <div class="col-6">
                    <div class="detail-stat">
                        <span class="detail-stat-label">Total</span>
                        <span class="detail-stat-value text-success">{{ formatCurrency(detailStats.total) }}</span>
                    </div>
                </div>
            </div>

            <BaseTable 
                :items="details" 
                :loading="loadingDetails" 
                :columns="detailColumns"
                :pageSize="5"
                searchable
                sortable
                empty-message="Aucun détail disponible"
            />
        </BaseModal>
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
    box-shadow: var(--shadow-sm);
    height: 100%;
}

.stat-card:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
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
    min-width: 0;
}

.stat-card-value {
    font-size: 1.5rem;
    font-weight: 800;
    color: var(--text-main);
    line-height: 1.1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.stat-card-label {
    font-size: 0.78rem;
    font-weight: 500;
    color: var(--text-muted);
}

/* ============ CARD ============ */
.card-custom {
    background: var(--card-bg);
    border: 1px solid var(--border-color);
    border-radius: 16px;
    box-shadow: var(--shadow-card);
    padding: 24px;
}

.section-title {
    font-size: 1.25rem;
    font-weight: 800;
    color: var(--text-main);
    letter-spacing: -0.01em;
    margin: 0;
}

.stat-icon {
    width: 46px;
    height: 46px;
    border-radius: 50%;
    background: var(--pill-bg);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.15rem;
    color: var(--brand-green);
    flex-shrink: 0;
}

/* ============ DETAIL STATS ============ */
.detail-stat {
    background: var(--bg);
    border: 1px solid var(--border-color);
    border-radius: 12px;
    padding: 0.85rem 1rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.detail-stat-label {
    font-size: 0.8rem;
    font-weight: 600;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.04em;
}

.detail-stat-value {
    font-size: 1.2rem;
    font-weight: 700;
    color: var(--text-main);
}

/* ============ RESPONSIVE ============ */
@media (max-width: 768px) {
    .page-title {
        font-size: 1.5rem;
    }
    
    .card-custom {
        padding: 18px;
    }
    
    .stat-card-value {
        font-size: 1.2rem;
    }
}
</style>