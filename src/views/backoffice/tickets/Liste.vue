<script setup>
// @ts-nocheck
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import BaseLayout from '../../../layouts/BaseLayout.vue'
import BaseTable from '../../../components/base/BaseTable.vue'
import BaseButton from '../../../components/base/BaseButton.vue'
import BaseCard from '../../../components/base/BaseCard.vue'
import BaseModal from '../../../components/base/BaseModal.vue'
import { getAllTickets } from '../../../utils/TicketManager.js'

const tickets = ref([])
const loading = ref(false)
const searchQuery = ref('')
const selectedStatus = ref('all')
const selectedPriority = ref('all')
const showCreateModal = ref(false)

// ----- Colonnes du tableau -----
const columns = [
    { 
        key: 'externalid', 
        label: 'ID',
        align: 'center',
        class: 'fw-bold text-nowrap'
    },
    { 
        key: 'name', 
        label: 'Titre',
        class: 'fw-semibold'
    },
    {
        key: 'statusLabel',
        label: 'Statut',
        align: 'center',
        badge: true,
        badgeVariant: (value) => {
            const statusMap = {
                'Nouveau': 'primary',
                'En cours (Attribué)': 'info',
                'En cours (Planifié)': 'warning',
                'En attente': 'secondary',
                'Résolu': 'success',
                'Clos': 'default'
            }
            return statusMap[value] || 'default'
        }
    },
    { 
        key: 'date', 
        label: 'Ouverture',
        formatter: (value) => {
            if (!value) return '—'
            return new Date(value).toLocaleDateString('fr-FR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            })
        }
    },
    { 
        key: 'date_mod', 
        label: 'Dernière MAJ',
        formatter: (value) => {
            if (!value) return '—'
            return new Date(value).toLocaleDateString('fr-FR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            })
        }
    },
    {
        key: 'priorityLabel',
        label: 'Priorité',
        align: 'center',
        badge: true,
        badgeVariant: (value) => {
            const priorityMap = {
                'Très faible': 'default',
                'Faible': 'success',
                'Moyenne': 'primary',
                'Élevée': 'warning',
                'Très élevée': 'danger',
                'Majeur': 'danger'
            }
            return priorityMap[value] || 'default'
        }
    },
    { 
        key: 'recipientLabel', 
        label: 'Demandeur'
    }
]

// ----- Statistiques -----
const ticketStats = computed(() => {
    const total = tickets.value.length
    const open = tickets.value.filter(t => 
        t.statusLabel === 'Nouveau' || t.statusLabel?.includes('En cours')
    ).length
    const resolved = tickets.value.filter(t => t.statusLabel === 'Résolu').length
    const closed = tickets.value.filter(t => t.statusLabel === 'Clos').length
    
    return { total, open, resolved, closed }
})

// ----- Tickets filtrés -----
const filteredTickets = computed(() => {
    let result = tickets.value
    
    if (selectedStatus.value !== 'all') {
        result = result.filter(t => t.statusLabel === selectedStatus.value)
    }
    
    if (selectedPriority.value !== 'all') {
        result = result.filter(t => t.priorityLabel === selectedPriority.value)
    }
    
    return result
})

// ----- Statuts uniques pour le filtre -----
const uniqueStatuses = computed(() => {
    const statuses = new Set(tickets.value.map(t => t.statusLabel).filter(Boolean))
    return Array.from(statuses).sort()
})

const uniquePriorities = computed(() => {
    const priorities = new Set(tickets.value.map(t => t.priorityLabel).filter(Boolean))
    return Array.from(priorities).sort()
})

// ----- Actions -----
const router = useRouter()

const loadTickets = async () => {
    loading.value = true

    try {
        const data = await getAllTickets()
        tickets.value = data.map(ticket => ({
            ...ticket,
            statusLabel: ticket.statusObject?.name ?? '',
            priorityLabel: ticket.priorityObject?.name ?? '',
            recipientLabel:
                ticket.recipientObject?.displayName || 
                ticket.recipientObject?.name || 
                ticket.recipientObject?.realname || ''
        }))
    } catch (error) {
        console.error('Erreur lors du chargement des tickets :', error)
        tickets.value = []
    } finally {
        loading.value = false
    }
}

const viewTicket = (ticket) => {
    router.push({ name: 'backofficeTicketFiche', params: { id: ticket.id } })
}

const createTicket = () => {
    showCreateModal.value = false
    router.push({ name: 'backofficeTicketCreate' })
}

const refreshTickets = () => {
    loadTickets()
}

onMounted(loadTickets)
</script>

<template>
    <BaseLayout>
        <!-- Page Header -->
        <div class="page-header mb-4">
            <div class="d-flex justify-content-between align-items-start flex-wrap gap-3">
                <div>
                    <span class="eyebrow">Tickets</span>
                    <h1 class="page-title">Liste des tickets</h1>
                    <p class="page-subtitle">
                        Gérez l'ensemble de vos tickets — {{ ticketStats.total }} au total
                    </p>
                </div>
                
                <div class="d-flex gap-2">
                    <BaseButton 
                        icon="bi bi-arrow-repeat" 
                        variant="ghost" 
                        size="sm" 
                        @click="refreshTickets"
                        title="Rafraîchir"
                    />
                    <BaseButton 
                        icon="bi bi-plus-lg" 
                        variant="primary" 
                        label="Nouveau ticket"
                        @click="showCreateModal = true"
                    />
                </div>
            </div>
        </div>

        <!-- Cartes de statistiques -->
        <div class="row g-3 mb-4">
            <div class="col-6 col-md-3">
                <div class="stat-card" :class="{ 'stat-card-loading': loading }">
                    <div class="stat-card-icon bg-primary-subtle">
                        <i class="bi bi-ticket-detailed"></i>
                    </div>
                    <div class="stat-card-content">
                        <span class="stat-card-value">{{ loading ? '—' : ticketStats.total }}</span>
                        <span class="stat-card-label">Total</span>
                    </div>
                </div>
            </div>
            
            <div class="col-6 col-md-3">
                <div class="stat-card" :class="{ 'stat-card-loading': loading }">
                    <div class="stat-card-icon bg-warning-subtle">
                        <i class="bi bi-hourglass-split"></i>
                    </div>
                    <div class="stat-card-content">
                        <span class="stat-card-value text-warning">{{ loading ? '—' : ticketStats.open }}</span>
                        <span class="stat-card-label">En cours</span>
                    </div>
                </div>
            </div>
            
            <div class="col-6 col-md-3">
                <div class="stat-card" :class="{ 'stat-card-loading': loading }">
                    <div class="stat-card-icon bg-success-subtle">
                        <i class="bi bi-check-circle"></i>
                    </div>
                    <div class="stat-card-content">
                        <span class="stat-card-value text-success">{{ loading ? '—' : ticketStats.resolved }}</span>
                        <span class="stat-card-label">Résolus</span>
                    </div>
                </div>
            </div>
            
            <div class="col-6 col-md-3">
                <div class="stat-card" :class="{ 'stat-card-loading': loading }">
                    <div class="stat-card-icon bg-secondary-subtle">
                        <i class="bi bi-archive"></i>
                    </div>
                    <div class="stat-card-content">
                        <span class="stat-card-value text-secondary">{{ loading ? '—' : ticketStats.closed }}</span>
                        <span class="stat-card-label">Clos</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- Filtres -->
        <div class="card-custom mb-4">
            <div class="d-flex flex-wrap gap-3 align-items-center">
                <div class="filter-group">
                    <label class="filter-label">
                        <i class="bi bi-funnel"></i> Statut
                    </label>
                    <select v-model="selectedStatus" class="filter-select">
                        <option value="all">Tous les statuts</option>
                        <option v-for="status in uniqueStatuses" :key="status" :value="status">
                            {{ status }}
                        </option>
                    </select>
                </div>
                
                <div class="filter-group">
                    <label class="filter-label">
                        <i class="bi bi-flag"></i> Priorité
                    </label>
                    <select v-model="selectedPriority" class="filter-select">
                        <option value="all">Toutes les priorités</option>
                        <option v-for="priority in uniquePriorities" :key="priority" :value="priority">
                            {{ priority }}
                        </option>
                    </select>
                </div>
                
                <button 
                    v-if="selectedStatus !== 'all' || selectedPriority !== 'all'"
                    class="filter-clear-btn"
                    @click="selectedStatus = 'all'; selectedPriority = 'all'"
                >
                    <i class="bi bi-x-lg"></i> Réinitialiser les filtres
                </button>
                
                <span class="ms-auto text-muted-custom small">
                    {{ filteredTickets.length }} ticket(s) trouvé(s)
                </span>
            </div>
        </div>

        <!-- Tableau des tickets -->
        <div class="card-custom">
            <BaseTable 
                :items="filteredTickets" 
                :loading="loading" 
                :columns="columns" 
                searchable 
                sortable
                :pageSize="10"
                empty-message="Aucun ticket trouvé"
            >
                <template #cell-actions="{ item }">
                    <BaseButton
                        icon="bi bi-eye"
                        variant="ghost"
                        size="sm"
                        @click="viewTicket(item)"
                        title="Voir le détail"
                    />
                </template>
            </BaseTable>
        </div>

        <!-- Modal de création rapide -->
        <BaseModal v-model="showCreateModal" title="Créer un nouveau ticket" size="md">
            <p class="text-muted-custom mb-0">
                Vous allez être redirigé vers le formulaire de création d'un nouveau ticket.
            </p>
            <template #footer>
                <BaseButton label="Annuler" variant="outline-secondary" @click="showCreateModal = false" />
                <BaseButton label="Continuer" variant="primary" icon="bi bi-arrow-right" @click="createTicket" />
            </template>
        </BaseModal>
    </BaseLayout>
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
}

.stat-card:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
}

.stat-card-loading {
    opacity: 0.6;
    pointer-events: none;
}

.stat-card-icon {
    width: 44px;
    height: 44px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.1rem;
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
    letter-spacing: -0.02em;
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

/* ============ FILTERS ============ */
.filter-group {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.filter-label {
    font-size: 0.82rem;
    font-weight: 600;
    color: var(--text-muted);
    display: flex;
    align-items: center;
    gap: 0.35rem;
    white-space: nowrap;
}

.filter-select {
    padding: 0.5rem 2rem 0.5rem 0.75rem;
    border: 1px solid var(--border-color);
    border-radius: 8px;
    background: var(--bg);
    color: var(--text-main);
    font-size: 0.85rem;
    font-weight: 500;
    cursor: pointer;
    appearance: none;
    -webkit-appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%238B96A0' d='M6 8L1 3h10z'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 0.6rem center;
    transition: all 0.2s ease;
    font-family: var(--font-family);
}

.filter-select:focus {
    outline: none;
    border-color: var(--brand-green);
    box-shadow: 0 0 0 3px rgba(14, 59, 54, 0.1);
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

/* ============ RESPONSIVE ============ */
@media (max-width: 768px) {
    .page-title {
        font-size: 1.5rem;
    }
    
    .stat-card {
        padding: 0.75rem;
    }
    
    .stat-card-value {
        font-size: 1.25rem;
    }
    
    .stat-card-icon {
        width: 36px;
        height: 36px;
        font-size: 0.95rem;
    }
    
    .card-custom {
        padding: 16px;
    }
    
    .filter-group {
        flex-direction: column;
        align-items: flex-start;
        width: 100%;
    }
    
    .filter-select {
        width: 100%;
    }
}
</style>