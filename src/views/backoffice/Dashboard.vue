<script setup>
// @ts-nocheck
import { ref, onMounted, computed } from 'vue'
import BaseLayout from '../../layouts/BaseLayout.vue'
import BaseCard from '../../components/base/BaseCard.vue'
import BaseTable from '../../components/base/BaseTable.vue'
import BaseButton from '../../components/base/BaseButton.vue'

import {
    getItemsStats,
    getTicketStats
} from '../../utils/DashboardManager.js'

const totalElements = ref(0)
const totalTickets = ref(0)

/** @type {import('vue').Ref<{name:string,count:number}[]>} */
const elementDetails = ref([])

/** @type {import('vue').Ref<{name:string,count:number}[]>} */
const ticketDetails = ref([])

const loading = ref(false)
const selectedPeriod = ref('week')

const elementColumns = [
    { 
        key: 'name', 
        label: 'Type d\'élément',
        class: 'fw-semibold'
    },
    { 
        key: 'count', 
        label: 'Nombre',
        align: 'right'
    },
    {
        key: 'percentage',
        label: '%',
        align: 'right',
        formatter: (value, item) => {
            const percent = totalElements.value > 0 
                ? ((item.count / totalElements.value) * 100).toFixed(1) 
                : 0
            return `${percent}%`
        }
    },
    {
        key: 'trend',
        label: 'Évolution',
        align: 'right',
        badge: true,
        badgeVariant: (value) => value > 0 ? 'success' : value < 0 ? 'danger' : 'default',
        formatter: (value) => value > 0 ? `+${value}%` : value < 0 ? `${value}%` : 'Stable'
    }
]

const ticketColumns = [
    { 
        key: 'name', 
        label: 'Type de ticket',
        class: 'fw-semibold'
    },
    { 
        key: 'count', 
        label: 'Nombre',
        align: 'right'
    },
    {
        key: 'percentage',
        label: '%',
        align: 'right',
        formatter: (value, item) => {
            const percent = totalTickets.value > 0 
                ? ((item.count / totalTickets.value) * 100).toFixed(1) 
                : 0
            return `${percent}%`
        }
    },
    {
        key: 'status',
        label: 'Statut',
        align: 'center',
        badge: true,
        badgeVariant: (value) => {
            const variants = {
                'critical': 'danger',
                'high': 'warning',
                'medium': 'primary',
                'low': 'success'
            }
            return variants[value] || 'default'
        },
        formatter: (value) => {
            const labels = {
                'critical': 'Critique',
                'high': 'Élevé',
                'medium': 'Moyen',
                'low': 'Faible'
            }
            return labels[value] || value
        }
    }
]

// Statistiques calculées
const elementWithMostCount = computed(() => {
    if (elementDetails.value.length === 0) return null
    return elementDetails.value.reduce((max, item) => 
        item.count > max.count ? item : max
    )
})

const ticketWithMostCount = computed(() => {
    if (ticketDetails.value.length === 0) return null
    return ticketDetails.value.reduce((max, item) => 
        item.count > max.count ? item : max
    )
})

const totalItems = computed(() => totalElements.value + totalTickets.value)

const periodLabel = computed(() => {
    const labels = {
        'today': 'Aujourd\'hui',
        'week': 'Cette semaine',
        'month': 'Ce mois',
        'year': 'Cette année'
    }
    return labels[selectedPeriod.value] || 'Cette semaine'
})

async function loadStats() {
    loading.value = true

    try {
        const [itemsStats, ticketsStats] = await Promise.all([
            getItemsStats(),
            getTicketStats()
        ])

        totalElements.value = itemsStats.total
        totalTickets.value = ticketsStats.total

        // Ajouter des données de tendance simulées (à remplacer par des vraies données)
        elementDetails.value = itemsStats.items.map(item => ({
            ...item,
            trend: Math.floor(Math.random() * 30) - 10 // Simulé
        }))

        console.log(elementDetails.value)
        
        ticketDetails.value = ticketsStats.items.map(item => ({
            ...item,
            status: ['critical', 'high', 'medium', 'low'][Math.floor(Math.random() * 4)] // Simulé
        }))
    } catch (error) {
        console.error('Erreur lors du chargement des statistiques:', error)
    } finally {
        loading.value = false
    }
}

function refreshData() {
    loadStats()
}

function exportData() {
    // Logique d'export
    console.log('Export des données...')
}

onMounted(loadStats)
</script>

<template>
    <BaseLayout>
        <!-- Page Header -->
        <div class="page-header mb-4">
            <div class="header-top">
                <div>
                    <div class="d-flex align-items-center gap-2 mb-2">
                        <span class="eyebrow">Dashboard</span>
                        <span class="live-dot"></span>
                        <span class="live-text">En direct</span>
                    </div>
                    <h1 class="page-title">Vue d'ensemble</h1>
                    <p class="page-subtitle">Suivi des éléments et des tickets par type — {{ periodLabel }}</p>
                </div>
                
                <div class="header-actions">
                    <div class="tab-pills">
                        <button 
                            v-for="period in ['today', 'week', 'month', 'year']" 
                            :key="period"
                            :class="['tab-btn', { active: selectedPeriod === period }]"
                            @click="selectedPeriod = period"
                        >
                            {{ period === 'today' ? 'Auj.' : period === 'week' ? 'Sem.' : period === 'month' ? 'Mois' : 'Année' }}
                        </button>
                    </div>
                    
                    <BaseButton 
                        variant="ghost" 
                        icon="bi bi-arrow-repeat" 
                        @click="refreshData"
                        title="Rafraîchir"
                    />
                    
                    <BaseButton 
                        variant="outline-secondary" 
                        label="Exporter" 
                        icon="bi bi-download"
                        size="sm"
                        @click="exportData"
                    />
                </div>
            </div>
        </div>

        <!-- Cartes de statistiques -->
        <div class="row g-4 mb-4">
            <div class="col-md-6 col-lg-4">
                <BaseCard 
                    icon="bi bi-box-seam" 
                    label="Total Éléments" 
                    :value="totalElements.toLocaleString()" 
                    :loading="loading"
                    :trend="elementWithMostCount ? `+${elementWithMostCount.name}` : ''"
                    trend-type="positive"
                >
                    <p class="card-description mt-2">
                        <strong>{{ elementDetails.length }}</strong> types d'éléments différents
                    </p>
                </BaseCard>
            </div>
            
            <div class="col-md-6 col-lg-4">
                <BaseCard 
                    icon="bi bi-ticket-perforated" 
                    label="Total Tickets" 
                    :value="totalTickets.toLocaleString()" 
                    :loading="loading"
                    :trend="ticketWithMostCount ? `Top: ${ticketWithMostCount.name}` : ''"
                    trend-type="positive"
                >
                    <p class="card-description mt-2">
                        <strong>{{ ticketDetails.length }}</strong> types de tickets différents
                    </p>
                </BaseCard>
            </div>
            
            <div class="col-md-12 col-lg-4">
                <BaseCard 
                    icon="bi bi-graph-up-arrow" 
                    label="Total Global" 
                    :value="totalItems.toLocaleString()" 
                    :loading="loading"
                    variant="primary"
                >
                    <div class="d-flex gap-3 mt-2">
                        <div>
                            <small class="text-muted-custom">Éléments</small>
                            <div class="fw-bold">{{ totalElements.toLocaleString() }}</div>
                        </div>
                        <div class="vr"></div>
                        <div>
                            <small class="text-muted-custom">Tickets</small>
                            <div class="fw-bold">{{ totalTickets.toLocaleString() }}</div>
                        </div>
                    </div>
                </BaseCard>
            </div>
        </div>

        <!-- Tableaux de détails -->
        <div class="row g-4">
            <!-- Détails par type d'élément -->
            <div class="col-12">
                <div class="card-custom">
                    <div class="d-flex justify-content-between align-items-start mb-3">
                        <div>
                            <h2 class="section-title">Détails par type d'élément</h2>
                            <p class="section-subtitle mb-0">Répartition des {{ totalElements }} éléments</p>
                        </div>
                        <div class="stat-icon mb-0">
                            <i class="bi bi-box-seam"></i>
                        </div>
                    </div>
                    
                    <BaseTable 
                        :items="elementDetails" 
                        :loading="loading" 
                        :columns="elementColumns"
                        :pageSize="5"
                        sortable
                        searchable
                        empty-message="Aucun élément trouvé"
                    />
                </div>
            </div>

            <!-- Détails par type de ticket -->
            <div class="col-12">
                <div class="card-custom">
                    <div class="d-flex justify-content-between align-items-start mb-3">
                        <div>
                            <h2 class="section-title">Détails par type de ticket</h2>
                            <p class="section-subtitle mb-0">Répartition des {{ totalTickets }} tickets</p>
                        </div>
                        <div class="stat-icon mb-0">
                            <i class="bi bi-ticket-perforated"></i>
                        </div>
                    </div>
                    
                    <BaseTable 
                        :items="ticketDetails" 
                        :loading="loading" 
                        :columns="ticketColumns"
                        :pageSize="5"
                        sortable
                        searchable
                        empty-message="Aucun ticket trouvé"
                    />
                </div>
            </div>
        </div>
    </BaseLayout>
</template>

<style scoped>
/* ============ PAGE HEADER ============ */
.page-header {
    margin-bottom: 2rem;
}

.header-top {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 1.5rem;
    flex-wrap: wrap;
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
}

.live-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--success-color);
    animation: live-pulse 2s ease-in-out infinite;
}

.live-text {
    font-size: 0.78rem;
    font-weight: 600;
    color: var(--success-color);
    text-transform: uppercase;
    letter-spacing: 0.05em;
}

.page-title {
    font-size: 2rem;
    font-weight: 800;
    color: var(--text-main);
    margin: 0 0 0.35rem 0;
    letter-spacing: -0.02em;
}

.page-subtitle {
    color: var(--text-muted);
    font-size: 0.95rem;
    font-weight: 500;
    margin: 0;
}

/* ============ HEADER ACTIONS ============ */
.header-actions {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    flex-wrap: wrap;
}

/* Tab pills */
.tab-pills {
    background: var(--pill-bg);
    border-radius: 999px;
    padding: 3px;
    display: inline-flex;
    gap: 2px;
}

.tab-pills .tab-btn {
    border: none;
    background: transparent;
    padding: 6px 14px;
    border-radius: 999px;
    font-weight: 600;
    font-size: 0.8rem;
    color: var(--text-muted);
    cursor: pointer;
    transition: all 0.2s ease;
    font-family: var(--font-family);
    white-space: nowrap;
}

.tab-pills .tab-btn.active {
    background: var(--card-bg);
    color: var(--text-main);
    box-shadow: 0 1px 3px rgba(0,0,0,0.08);
}

.tab-pills .tab-btn:hover:not(.active) {
    color: var(--text-main);
}

/* ============ CARDS ============ */
.card-custom {
    background: var(--card-bg);
    border: 1px solid var(--border-color);
    border-radius: 16px;
    box-shadow: var(--shadow-card);
    padding: 24px;
    height: 100%;
}

.card-description {
    color: var(--text-muted);
    font-size: 0.85rem;
    margin: 0;
}

.section-title {
    font-size: 1.35rem;
    font-weight: 800;
    margin-bottom: 2px;
    color: var(--text-main);
    letter-spacing: -0.01em;
}

.section-subtitle {
    color: var(--text-muted);
    font-size: 0.88rem;
    font-weight: 500;
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

/* Séparateur vertical */
.vr {
    width: 1px;
    background: var(--border-color);
    align-self: stretch;
}

/* ============ RESPONSIVE ============ */
@media (max-width: 991px) {
    .header-top {
        flex-direction: column;
    }
    
    .header-actions {
        width: 100%;
        justify-content: flex-start;
    }
    
    .page-title {
        font-size: 1.6rem;
    }
}

@media (max-width: 768px) {
    .card-custom {
        padding: 18px;
    }
    
    .section-title {
        font-size: 1.2rem;
    }
    
    .page-title {
        font-size: 1.4rem;
    }
    
    .header-actions {
        flex-direction: column;
        align-items: stretch;
    }
    
    .tab-pills {
        justify-content: center;
    }
}

/* ============ ANIMATIONS ============ */
@keyframes live-pulse {
    0%, 100% {
        opacity: 1;
        box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4);
    }
    50% {
        opacity: 0.6;
        box-shadow: 0 0 0 6px rgba(16, 185, 129, 0);
    }
}
</style>