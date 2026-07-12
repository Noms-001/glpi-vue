<script setup>
//@ts-nocheck
import { onMounted, ref, computed } from 'vue'
import FrontLayout from '../../../layouts/FrontLayout.vue'
import { get, post } from '../../../api/backend-client.js'
import BaseTable from '../../../components/base/BaseTable.vue'
import BaseInput from '../../../components/base/BaseInput.vue'
import BaseModal from '../../../components/base/BaseModal.vue'
import BaseSelect from '../../../components/base/BaseSelect.vue'
import BaseButton from '../../../components/base/BaseButton.vue'
import { useToast } from '../../../composables/useToast'

const ticketCosts = ref([])
const ticketCancelCosts = ref([])
const showModal = ref(false)
const showRestoreModal = ref(false)
const showPlafondModal = ref(false)
const loading = ref(false)
const valeur = ref(null)
const plafond = ref(null)
const mode = ref(null)
const ticket = ref(null)
const restoreItem = ref(null)
const activeTab = ref('active')
const { showError, showInfo, showSuccess } = useToast()

// Colonnes pour les coûts actifs
const activeCostColumns = [
    { key: 'ticketId', label: 'Ticket', class: 'fw-semibold' },
    { key: 'groupId', label: 'Groupe', align: 'center' },
    { 
        key: 'costTypeId', 
        label: 'Type',
        badge: true,
        badgeVariant: (value) => {
            if (value === 1) return 'warning'
            if (value === 2) return 'primary'
            return 'default'
        },
        formatter: (value) => {
            const types = { 1: 'Ouverture', 2: 'Fermeture' }
            return types[value] || `Type ${value}`
        }
    },
    { key: 'cost', label: 'Coût', align: 'right', formatter: (v) => v ? `${Number(v).toFixed(2)} €` : '—' },
    { key: 'mode', label: 'Mode', align: 'center', formatter: (v) => v ? `Mode ${v}` : '—' },
    { key: 'value', label: 'Valeur', align: 'right' }
]

// Colonnes pour les coûts annulés
const cancelledCostColumns = [
    { key: 'ticketId', label: 'Ticket', class: 'fw-semibold' },
    { key: 'groupId', label: 'Groupe', align: 'center' },
    { 
        key: 'costTypeId', 
        label: 'Type',
        badge: true,
        badgeVariant: 'secondary',
        formatter: (value) => {
            const types = { 1: 'Ouverture', 2: 'Fermeture' }
            return types[value] || `Type ${value}`
        }
    },
    { key: 'cost', label: 'Coût', align: 'right', formatter: (v) => v ? `${Number(v).toFixed(2)} €` : '—' },
    { key: 'mode', label: 'Mode', align: 'center' },
    { key: 'value', label: 'Valeur', align: 'right' }
]

// Statistiques
const activeStats = computed(() => {
    const total = ticketCosts.value.length
    const totalCost = ticketCosts.value.reduce((sum, item) => sum + (Number(item.cost) || 0), 0)
    const openCount = ticketCosts.value.filter(item => item.costTypeId === 1).length
    const closeCount = ticketCosts.value.filter(item => item.costTypeId === 2).length
    return { total, totalCost, openCount, closeCount }
})

const cancelledStats = computed(() => {
    return {
        total: ticketCancelCosts.value.length,
        totalCost: ticketCancelCosts.value.reduce((sum, item) => sum + (Number(item.cost) || 0), 0)
    }
})

onMounted(async () => {
    await loadData()
})

async function loadData() {
    loading.value = true
    try {
        const [activeResponse, cancelledResponse] = await Promise.all([
            get('/item-cost/ticket-cost'),
            get('/item-cost/ticket-cancel-cost')
        ])
        
        if (activeResponse.success) {
            ticketCosts.value = activeResponse.data
        } else {
            throw new Error(activeResponse.error)
        }
        
        if (cancelledResponse.success) {
            ticketCancelCosts.value = cancelledResponse.data
        } else {
            throw new Error(cancelledResponse.error)
        }
    } catch (error) {
        console.error(error)
        showError('Erreur lors du chargement des données')
    } finally {
        loading.value = false
    }
}

const showEdit = (item) => {
    ticket.value = item
    valeur.value = item.value || null
    mode.value = item.mode || null
    showModal.value = true
}

const confirmChange = async () => {
    try {
        const payload = {
            ticketId: ticket.value.ticketId,
            groupId: ticket.value.groupId,
            costTypeId: ticket.value.costTypeId,
            cost: ticket.value.cost,
            value: valeur.value,
            mode: mode.value
        }
        const response = await post('/item-cost/update', payload)
        if (response.success) {
            showSuccess(response.data || 'Coût modifié avec succès')
            showModal.value = false
            await loadData()
        } else {
            throw new Error(response.error)
        }
    } catch (error) {
        console.error(error)
        showError('Erreur lors de la modification du coût')
    }
}

const confirmRestore = (item) => {
    restoreItem.value = item
    showRestoreModal.value = true
}

const retablir = async () => {
    if (!restoreItem.value) return
    try {
        const response = await post(
            `/item-cost/retablir?ticketId=${restoreItem.value.ticketId}&groupId=${restoreItem.value.groupId}`
        )
        if (response.success) {
            showSuccess(response.data || 'Coût rétabli avec succès')
            showRestoreModal.value = false
            restoreItem.value = null
            await loadData()
        } else {
            showError(response.error)
        }
    } catch (error) {
        console.error(error)
        showError('Erreur lors du rétablissement')
    }
}

const validePlafond = async () => {
    if (!plafond.value) {
        showError('Veuillez saisir un montant')
        return
    }
    try {
        const response = await post(`/item-cost/plafond?plafond=${plafond.value}`)
        if (response.success) {
            showSuccess(response.data || 'Plafond enregistré avec succès')
            showPlafondModal.value = false
            plafond.value = null
        } else {
            showError(response.error)
        }
    } catch (error) {
        console.error(error)
        showError('Erreur lors de l\'enregistrement du plafond')
    }
}

function formatCurrency(value) {
    if (!value) return '0,00 €'
    return `${Number(value).toFixed(2)} €`
}
</script>

<template>
    <FrontLayout>
        <!-- Page Header -->
        <div class="page-header mb-4">
            <div class="d-flex justify-content-between align-items-start flex-wrap gap-3">
                <div>
                    <span class="eyebrow">Coûts</span>
                    <h1 class="page-title">Gestion des coûts</h1>
                    <p class="page-subtitle">
                        Consultez et gérez les coûts associés aux tickets.
                    </p>
                </div>
                <BaseButton 
                    label="Définir le plafond" 
                    variant="outline-secondary" 
                    icon="bi bi-sliders"
                    @click="showPlafondModal = true" 
                />
            </div>
        </div>

        <!-- Cartes de statistiques -->
        <div class="row g-3 mb-4">
            <div class="col-6 col-md-3">
                <div class="stat-card">
                    <div class="stat-card-icon">
                        <i class="bi bi-cash-stack"></i>
                    </div>
                    <div class="stat-card-content">
                        <span class="stat-card-value">{{ activeStats.total }}</span>
                        <span class="stat-card-label">Coûts actifs</span>
                    </div>
                </div>
            </div>
            <div class="col-6 col-md-3">
                <div class="stat-card">
                    <div class="stat-card-icon text-success">
                        <i class="bi bi-check-circle"></i>
                    </div>
                    <div class="stat-card-content">
                        <span class="stat-card-value">{{ activeStats.openCount }}</span>
                        <span class="stat-card-label">Ouvertures</span>
                    </div>
                </div>
            </div>
            <div class="col-6 col-md-3">
                <div class="stat-card">
                    <div class="stat-card-icon text-warning">
                        <i class="bi bi-x-circle"></i>
                    </div>
                    <div class="stat-card-content">
                        <span class="stat-card-value">{{ activeStats.closeCount }}</span>
                        <span class="stat-card-label">Fermetures</span>
                    </div>
                </div>
            </div>
            <div class="col-6 col-md-3">
                <div class="stat-card">
                    <div class="stat-card-icon text-danger">
                        <i class="bi bi-arrow-counterclockwise"></i>
                    </div>
                    <div class="stat-card-content">
                        <span class="stat-card-value">{{ cancelledStats.total }}</span>
                        <span class="stat-card-label">Annulés</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- Onglets -->
        <div class="tab-pills mb-4">
            <button 
                :class="['tab-btn', { active: activeTab === 'active' }]"
                @click="activeTab = 'active'"
            >
                <i class="bi bi-cash me-1"></i> Coûts actifs
                <span class="tab-count">{{ activeStats.total }}</span>
            </button>
            <button 
                :class="['tab-btn', { active: activeTab === 'cancelled' }]"
                @click="activeTab = 'cancelled'"
            >
                <i class="bi bi-archive me-1"></i> Coûts annulés
                <span class="tab-count">{{ cancelledStats.total }}</span>
            </button>
        </div>

        <!-- Tableau Coûts actifs -->
        <div v-if="activeTab === 'active'" class="card-custom">
            <div class="d-flex align-items-center gap-3 mb-4">
                <div class="stat-icon mb-0">
                    <i class="bi bi-cash-coin"></i>
                </div>
                <div>
                    <h2 class="section-title mb-0">Coûts actifs</h2>
                    <p class="text-muted-custom small mb-0">
                        {{ activeStats.total }} coût(s) • Total : {{ formatCurrency(activeStats.totalCost) }}
                    </p>
                </div>
            </div>

            <BaseTable 
                :items="ticketCosts" 
                :loading="loading" 
                :columns="activeCostColumns"
                :onRowClick="showEdit"
                searchable
                sortable
                :pageSize="10"
                empty-message="Aucun coût actif trouvé"
            >
                <template #cell-actions="{ item }">
                    <BaseButton 
                        icon="bi bi-pencil" 
                        variant="ghost" 
                        size="sm" 
                        @click="showEdit(item)"
                        title="Modifier"
                    />
                </template>
            </BaseTable>
        </div>

        <!-- Tableau Coûts annulés -->
        <div v-if="activeTab === 'cancelled'" class="card-custom">
            <div class="d-flex align-items-center gap-3 mb-4">
                <div class="stat-icon mb-0">
                    <i class="bi bi-archive"></i>
                </div>
                <div>
                    <h2 class="section-title mb-0">Coûts annulés</h2>
                    <p class="text-muted-custom small mb-0">
                        {{ cancelledStats.total }} coût(s) annulé(s) • Total : {{ formatCurrency(cancelledStats.totalCost) }}
                    </p>
                </div>
            </div>

            <BaseTable 
                :items="ticketCancelCosts" 
                :loading="loading" 
                :columns="cancelledCostColumns"
                :onRowClick="confirmRestore"
                searchable
                sortable
                :pageSize="10"
                empty-message="Aucun coût annulé trouvé"
            >
                <template #cell-actions="{ item }">
                    <BaseButton 
                        icon="bi bi-arrow-counterclockwise" 
                        variant="ghost" 
                        size="sm" 
                        @click="confirmRestore(item)"
                        title="Rétablir"
                    />
                </template>
            </BaseTable>
        </div>

        <!-- Modal Modification -->
        <BaseModal v-model="showModal" title="Modifier le coût" size="sm">
            <div class="d-flex flex-column gap-3">
                <div v-if="ticket" class="info-banner">
                    <i class="bi bi-info-circle"></i>
                    <span>Ticket #{{ ticket.ticketId }} • Groupe {{ ticket.groupId }}</span>
                </div>
                <BaseInput 
                    v-model="valeur" 
                    type="number" 
                    label="Nouvelle valeur" 
                    placeholder="Saisir la valeur..."
                    icon="bi bi-cash"
                />
                <BaseSelect 
                    v-if="ticket?.costTypeId === 2" 
                    v-model="mode" 
                    label="Mode de calcul" 
                    :options="[
                        { value: 1, label: 'Mode 1 - Standard' },
                        { value: 2, label: 'Mode 2 - Rapide' },
                        { value: 3, label: 'Mode 3 - Avancé' },
                        { value: 4, label: 'Mode 4 - Expert' }
                    ]" 
                />
            </div>
            <template #footer>
                <BaseButton label="Annuler" variant="outline-secondary" @click="showModal = false" />
                <BaseButton label="Enregistrer" variant="primary" @click="confirmChange" icon="bi bi-check-lg" />
            </template>
        </BaseModal>

        <!-- Modal Rétablissement -->
        <BaseModal v-model="showRestoreModal" title="Rétablir le coût" size="sm">
            <div class="text-center py-3">
                <i class="bi bi-arrow-counterclockwise text-warning mb-3" style="font-size: 2.5rem;"></i>
                <p class="mb-2">Confirmer le rétablissement de ce coût ?</p>
                <p class="text-muted-custom small mb-0" v-if="restoreItem">
                    Ticket #{{ restoreItem.ticketId }} • Groupe {{ restoreItem.groupId }}
                </p>
            </div>
            <template #footer>
                <BaseButton label="Annuler" variant="outline-secondary" @click="showRestoreModal = false" />
                <BaseButton label="Rétablir" variant="warning" @click="retablir" icon="bi bi-arrow-counterclockwise" />
            </template>
        </BaseModal>

        <!-- Modal Plafond -->
        <BaseModal v-model="showPlafondModal" title="Définir le plafond" size="sm">
            <div class="d-flex flex-column gap-3">
                <BaseInput 
                    v-model="plafond" 
                    type="number" 
                    label="Montant du plafond" 
                    placeholder="Ex : 10000"
                    icon="bi bi-sliders"
                    helper="Ce plafond s'appliquera à l'ensemble des coûts."
                />
            </div>
            <template #footer>
                <BaseButton label="Annuler" variant="outline-secondary" @click="showPlafondModal = false" />
                <BaseButton label="Enregistrer" variant="primary" @click="validePlafond" icon="bi bi-check-lg" />
            </template>
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

/* ============ TABS ============ */
.tab-pills {
    background: var(--pill-bg);
    border-radius: 999px;
    padding: 4px;
    display: inline-flex;
    gap: 2px;
}

.tab-btn {
    border: none;
    background: transparent;
    padding: 8px 18px;
    border-radius: 999px;
    font-weight: 600;
    font-size: 0.85rem;
    color: var(--text-muted);
    cursor: pointer;
    transition: all 0.2s ease;
    font-family: var(--font-family);
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.tab-btn.active {
    background: var(--card-bg);
    color: var(--text-main);
    box-shadow: 0 1px 3px rgba(0,0,0,0.08);
}

.tab-btn:hover:not(.active) {
    color: var(--text-main);
}

.tab-count {
    background: var(--brand-green-light);
    color: var(--brand-green);
    padding: 0.15rem 0.5rem;
    border-radius: 999px;
    font-size: 0.7rem;
    font-weight: 700;
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

/* ============ INFO BANNER ============ */
.info-banner {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.65rem 0.85rem;
    background: var(--brand-green-light);
    color: var(--brand-green);
    border-radius: 10px;
    font-size: 0.85rem;
    font-weight: 500;
}

/* ============ RESPONSIVE ============ */
@media (max-width: 768px) {
    .page-title {
        font-size: 1.5rem;
    }
    
    .card-custom {
        padding: 18px;
    }
    
    .tab-pills {
        width: 100%;
    }
    
    .tab-btn {
        flex: 1;
        justify-content: center;
    }
}
</style>