<script setup>
// @ts-nocheck
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import BaseLayout from '../../../layouts/BaseLayout.vue'
import BaseButton from '../../../components/base/BaseButton.vue'
import BaseCard from '../../../components/base/BaseCard.vue'
import BaseTable from '../../../components/base/BaseTable.vue'
import BaseModal from '../../../components/base/BaseModal.vue'
import { getTicketById, getTicketFollowups } from '../../../utils/TicketManager.js'
import TicketStatus from '../../../models/tickets/TicketStatuts.js'

const route = useRoute()
const router = useRouter()
const ticket = ref(null)
const ticketFollowups = ref([])
const loading = ref(false)
const error = ref('')
const showDeleteModal = ref(false)

// ----- Formatage -----
const formatDate = (value) => {
    if (!value) return '—'
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return value
    return date.toLocaleString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    })
}

const formatTime = (cost) => {
    if (!cost) return '—'
    const hours = Math.floor(cost / 3600)
    const minutes = Math.floor((cost % 3600) / 60)
    if (hours > 0) return `${hours}h ${minutes}min`
    return `${minutes} min`
}

const formatPrice = (cost) => {
    if (!cost && cost !== 0) return '—'
    return `${Number(cost).toFixed(2)} €`
}

// ----- Données calculées -----
const requester = computed(() => {
    if (!ticket.value) return '—'
    return ticket.value.recipientObject?.displayName || 
           ticket.value.recipientObject?.name || 
           ticket.value.recipientObject?.realname || '—'
})

const locationName = computed(() => {
    if (!ticket.value) return '—'
    return ticket.value.locationObject?.completename || 
           ticket.value.locationObject?.name || '—'
})

const assigneeName = computed(() => {
    if (!ticket.value) return '—'
    return ticket.value.lastUpdaterObject?.displayName || 
           ticket.value.lastUpdaterObject?.name || 
           ticket.value.lastUpdaterObject?.realname || '—'
})

const statusColor = computed(() => {
    const statusName = ticket.value?.statusObject?.name?.toLowerCase() || ''
    if (statusName.includes('nouveau') || statusName.includes('new')) return 'primary'
    if (statusName.includes('cours') || statusName.includes('progress')) return 'warning'
    if (statusName.includes('résolu') || statusName.includes('resolved') || statusName.includes('clos')) return 'success'
    if (statusName.includes('en attente') || statusName.includes('pending')) return 'secondary'
    return 'default'
})

const priorityColor = computed(() => {
    const priorityName = ticket.value?.priorityObject?.name?.toLowerCase() || ''
    if (priorityName.includes('critique') || priorityName.includes('critical')) return 'danger'
    if (priorityName.includes('haute') || priorityName.includes('high')) return 'warning'
    if (priorityName.includes('moyenne') || priorityName.includes('medium')) return 'primary'
    return 'success'
})

// ----- Actifs liés -----
const ticketItems = computed(() => {
    return ticket.value?.items?.map((link) => ({
        id: link.id,
        actif: link.item?.name || link.item?.completename || link.item?.label || `#${link.items_id}`,
        type: link.itemtype,
        reference: link.items_id
    })) || []
})

// ----- Coûts -----
const ticketCosts = computed(() => {
    return ticket.value?.costs?.map((cost) => {
        const coutHoraire = Number(cost.cost_time || 0)
        const duree = Number(cost.actiontime || 0)
        const coutFixe = Number(cost.cost_fixed || 0)
        const coutMateriel = Number(cost.cost_material || 0)
        return {
            id: cost.id,
            temps: coutHoraire,
            duree: duree,
            fixe: coutFixe,
            materiel: coutMateriel,
            total: (duree / 3600) * coutHoraire + coutFixe + coutMateriel
        }
    }) || []
})

const totalCost = computed(() => {
    return ticketCosts.value.reduce((sum, cost) => sum + cost.total, 0)
})

const totalDuration = computed(() => {
    return ticketCosts.value.reduce((sum, cost) => sum + cost.duree, 0)
})

// ----- Suivis -----
const parseFollowupDateTime = (value) => {
    if (!value) return { date: '—', time: '—' }
    const normalized = String(value).trim().replace('T', ' ')
    const [date, ...rest] = normalized.split(' ')
    return {
        date: date || '—',
        time: rest.join(' ') || '—'
    }
}

const ticketFollowupRows = computed(() => {
    return ticketFollowups.value.map((followup) => {
        const dateValue = followup.date_mod || followup.date_creation || followup.date || ''
        const { date, time } = parseFollowupDateTime(dateValue)
        return {
            id: followup.id || '',
            date,
            time,
            content: followup.content || '—',
            author: followup.users_id || '—'
        }
    })
})

// ----- Colonnes des tableaux -----
const itemsColumns = [
    { key: 'id', label: 'ID', align: 'center' },
    { key: 'actif', label: 'Actif', class: 'fw-semibold' },
    { key: 'type', label: 'Type' },
    { key: 'reference', label: 'Référence', align: 'right' }
]

const costsColumns = [
    { key: 'id', label: 'ID', align: 'center' },
    { key: 'duree', label: 'Durée', align: 'right', formatter: formatTime },
    { key: 'temps', label: 'Coût Horaire', align: 'right', formatter: formatPrice },
    { key: 'fixe', label: 'Coût Fixe', align: 'right', formatter: formatPrice },
    { key: 'materiel', label: 'Coût Matériel', align: 'right', formatter: formatPrice },
    { key: 'total', label: 'Total', align: 'right', formatter: formatPrice, class: 'fw-bold' }
]

const followupColumns = [
    { key: 'id', label: 'ID', align: 'center' },
    { key: 'date', label: 'Date' },
    { key: 'time', label: 'Heure' },
    { key: 'content', label: 'Commentaire' }
]

// ----- Chargement des données -----
const loadTicket = async () => {
    const id = route.params.id
    if (!id) {
        error.value = 'Identifiant de ticket invalide.'
        return
    }

    loading.value = true
    error.value = ''

    try {
        const data = await getTicketById(Number(id))
        if (!data) {
            error.value = 'Ticket introuvable.'
            ticket.value = null
            return
        }
        ticket.value = data
    } catch (e) {
        console.error(e)
        error.value = 'Impossible de charger le ticket.'
    } finally {
        loading.value = false
    }
}

const loadTicketFollowups = async (ticketId) => {
    try {
        ticketFollowups.value = await getTicketFollowups(ticketId)
    } catch (e) {
        console.error('Impossible de charger l\'historique de suivi', e)
        ticketFollowups.value = []
    }
}

const refreshTicket = async () => {
    await loadTicket()
    if (ticket.value?.id) {
        await loadTicketFollowups(ticket.value.id)
    }
}

const goBack = () => {
    router.push({ name: 'backofficeTickets' })
}

const editTicket = () => {
    router.push({ name: 'backofficeTicketEdit', params: { id: ticket.value?.id } })
}

const confirmDelete = () => {
    showDeleteModal.value = true
}

const deleteTicket = async () => {
    // Logique de suppression
    showDeleteModal.value = false
    router.push({ name: 'backofficeTickets' })
}

onMounted(async () => {
    await loadTicket()
    if (ticket.value?.id) {
        await loadTicketFollowups(ticket.value.id)
    }
})
</script>

<template>
    <BaseLayout>
        <!-- Loading State -->
        <div v-if="loading" class="loading-state">
            <div class="text-center py-5">
                <div class="skeleton skeleton-title mx-auto mb-3" style="width: 300px;"></div>
                <div class="skeleton skeleton-line mx-auto mb-2" style="width: 200px;"></div>
                <div class="row g-4 mt-4">
                    <div class="col-md-6" v-for="i in 4" :key="i">
                        <div class="card-custom">
                            <div class="skeleton skeleton-line mb-2" style="width: 60%;"></div>
                            <div class="skeleton skeleton-line" style="width: 80%;"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="error-state">
            <div class="empty-state text-center py-5">
                <i class="bi bi-exclamation-triangle-fill text-danger mb-3" style="font-size: 3rem;"></i>
                <h3 class="text-danger mb-2">Erreur</h3>
                <p class="text-muted-custom">{{ error }}</p>
                <BaseButton label="Retour aux tickets" variant="primary" icon="bi bi-arrow-left" @click="goBack" class="mt-3" />
            </div>
        </div>

        <!-- Ticket Details -->
        <template v-else-if="ticket">
            <!-- Page Header -->
            <div class="page-header mb-4">
                <div class="d-flex justify-content-between align-items-start flex-wrap gap-3">
                    <div>
                        <div class="d-flex align-items-center gap-2 mb-2">
                            <span class="eyebrow">Ticket</span>
                            <span :class="['badge-custom', `badge-${statusColor}`]">
                                {{ ticket.statusObject?.name || 'Statut inconnu' }}
                            </span>
                            <span :class="['badge-custom', `badge-${priorityColor}`]">
                                Priorité {{ ticket.priorityObject?.name || '—' }}
                            </span>
                        </div>
                        <h1 class="page-title mb-1">Ticket #{{ ticket.externalid }}</h1>
                        <p class="page-subtitle mb-0">{{ ticket.typeObject?.name || 'Ticket' }} • Créé le {{ formatDate(ticket.date_creation || ticket.date) }}</p>
                    </div>

                    <div class="d-flex gap-2 flex-wrap">
                        <BaseButton 
                            icon="bi bi-arrow-left" 
                            variant="outline-secondary" 
                            size="sm" 
                            @click="goBack"
                            label="Retour"
                        />
                        <BaseButton 
                            icon="bi bi-arrow-repeat" 
                            variant="ghost" 
                            size="sm" 
                            @click="refreshTicket"
                            title="Rafraîchir"
                        />
                        <BaseButton 
                            icon="bi bi-pencil" 
                            variant="primary" 
                            size="sm" 
                            @click="editTicket"
                            label="Modifier"
                        />
                        <BaseButton 
                            icon="bi bi-trash" 
                            variant="danger" 
                            size="sm" 
                            @click="confirmDelete"
                            label="Supprimer"
                        />
                    </div>
                </div>
            </div>

            <!-- Content -->
            <div class="row g-4">
                <!-- Colonne gauche : Infos principales -->
                <div class="col-12 col-lg-8">
                    <!-- Description -->
                    <div class="card-custom mb-4">
                        <h2 class="section-title mb-3">{{ ticket.name || 'Sans titre' }}</h2>
                        <div class="ticket-content">
                            {{ ticket.content || 'Aucune description fournie pour ce ticket.' }}
                        </div>
                    </div>

                    <!-- Actifs liés -->
                    <div class="card-custom mb-4">
                        <div class="d-flex justify-content-between align-items-center mb-3">
                            <h3 class="section-title mb-0">Actifs liés</h3>
                            <span class="badge-custom badge-default">{{ ticketItems.length }} actif(s)</span>
                        </div>
                        <BaseTable 
                            v-if="ticketItems.length" 
                            :items="ticketItems" 
                            :columns="itemsColumns"
                            :pageSize="5"
                            empty-message="Aucun actif lié"
                        />
                        <div v-else class="empty-state-small">
                            <i class="bi bi-inbox"></i>
                            <span>Aucun actif lié pour ce ticket</span>
                        </div>
                    </div>

                    <!-- Coûts associés -->
                    <div class="card-custom mb-4">
                        <div class="d-flex justify-content-between align-items-center mb-3">
                            <h3 class="section-title mb-0">Coûts associés</h3>
                            <div class="d-flex gap-3">
                                <div class="cost-summary">
                                    <small class="text-muted-custom">Durée totale</small>
                                    <strong>{{ formatTime(totalDuration) }}</strong>
                                </div>
                                <div class="cost-summary">
                                    <small class="text-muted-custom">Coût total</small>
                                    <strong class="text-success">{{ formatPrice(totalCost) }}</strong>
                                </div>
                            </div>
                        </div>
                        <BaseTable 
                            v-if="ticketCosts.length" 
                            :items="ticketCosts" 
                            :columns="costsColumns"
                            :pageSize="5"
                            empty-message="Aucun coût enregistré"
                        />
                        <div v-else class="empty-state-small">
                            <i class="bi bi-cash-coin"></i>
                            <span>Aucun coût enregistré pour ce ticket</span>
                        </div>
                    </div>

                    <!-- Historique de suivi -->
                    <div class="card-custom">
                        <div class="d-flex justify-content-between align-items-center mb-3">
                            <h3 class="section-title mb-0">Historique de suivi</h3>
                            <span class="badge-custom badge-default">{{ ticketFollowupRows.length }} suivi(s)</span>
                        </div>
                        <BaseTable 
                            v-if="ticketFollowupRows.length" 
                            :items="ticketFollowupRows" 
                            :columns="followupColumns"
                            :pageSize="5"
                            empty-message="Aucun suivi disponible"
                        />
                        <div v-else class="empty-state-small">
                            <i class="bi bi-clock-history"></i>
                            <span>Aucun suivi disponible pour ce ticket</span>
                        </div>
                    </div>
                </div>

                <!-- Colonne droite : Détails -->
                <div class="col-12 col-lg-4">
                    <!-- Carte Résumé -->
                    <div class="card-custom mb-4">
                        <div class="d-flex align-items-center gap-3 mb-3">
                            <div class="stat-icon mb-0">
                                <i class="bi bi-info-circle"></i>
                            </div>
                            <h3 class="section-title mb-0">Résumé</h3>
                        </div>
                        
                        <dl class="detail-list">
                            <dt>Demandeur</dt>
                            <dd>{{ requester }}</dd>

                            <dt>Assigné à</dt>
                            <dd>{{ assigneeName }}</dd>

                            <dt>Lieu</dt>
                            <dd>{{ locationName }}</dd>

                            <dt>Créé le</dt>
                            <dd>{{ formatDate(ticket.date_creation || ticket.date) }}</dd>

                            <dt>Dernière MAJ</dt>
                            <dd>{{ formatDate(ticket.date_mod) }}</dd>

                            <dt>Date de clôture</dt>
                            <dd>{{ formatDate(ticket.closedate) }}</dd>
                        </dl>
                    </div>

                    <!-- Carte Attributs -->
                    <div class="card-custom">
                        <div class="d-flex align-items-center gap-3 mb-3">
                            <div class="stat-icon mb-0">
                                <i class="bi bi-tags"></i>
                            </div>
                            <h3 class="section-title mb-0">Attributs</h3>
                        </div>

                        <div class="attributes-grid">
                            <div class="attribute-item">
                                <span class="attribute-label">Type</span>
                                <span class="attribute-value">{{ ticket.typeObject?.name || '—' }}</span>
                            </div>
                            <div class="attribute-item">
                                <span class="attribute-label">Catégorie</span>
                                <span class="attribute-value">{{ ticket.itilcategories_id || '—' }}</span>
                            </div>
                            <div class="attribute-item">
                                <span class="attribute-label">Urgence</span>
                                <span :class="['badge-custom', `badge-${priorityColor}`]">
                                    {{ ticket.urgencyObject?.name || '—' }}
                                </span>
                            </div>
                            <div class="attribute-item">
                                <span class="attribute-label">Impact</span>
                                <span class="attribute-value">{{ ticket.impactObject?.name || '—' }}</span>
                            </div>
                            <div class="attribute-item">
                                <span class="attribute-label">Priorité</span>
                                <span :class="['badge-custom', `badge-${priorityColor}`]">
                                    {{ ticket.priorityObject?.name || '—' }}
                                </span>
                            </div>
                            <div class="attribute-item">
                                <span class="attribute-label">Statut</span>
                                <span :class="['badge-custom', `badge-${statusColor}`]">
                                    {{ ticket.statusObject?.name || '—' }}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </template>

        <!-- Modal de confirmation de suppression -->
        <BaseModal v-model="showDeleteModal" title="Confirmer la suppression" size="sm">
            <div class="text-center py-3">
                <i class="bi bi-exclamation-triangle-fill text-danger mb-3" style="font-size: 2.5rem;"></i>
                <p class="mb-3">Êtes-vous sûr de vouloir supprimer le ticket <strong>#{{ ticket?.externalid }}</strong> ?</p>
                <p class="text-muted-custom small mb-0">Cette action est irréversible.</p>
            </div>
            <template #footer>
                <BaseButton label="Annuler" variant="outline-secondary" @click="showDeleteModal = false" />
                <BaseButton label="Supprimer définitivement" variant="danger" @click="deleteTicket" />
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
}

.page-title {
    font-size: 2rem;
    font-weight: 800;
    color: var(--text-main);
    margin: 0;
    letter-spacing: -0.02em;
}

.page-subtitle {
    color: var(--text-muted);
    font-size: 0.92rem;
    font-weight: 500;
    margin: 0;
}

/* ============ CARDS ============ */
.card-custom {
    background: var(--card-bg);
    border: 1px solid var(--border-color);
    border-radius: 16px;
    box-shadow: var(--shadow-card);
    padding: 24px;
}

.section-title {
    font-size: 1.2rem;
    font-weight: 800;
    color: var(--text-main);
    letter-spacing: -0.01em;
    margin: 0;
}

.stat-icon {
    width: 42px;
    height: 42px;
    border-radius: 50%;
    background: var(--pill-bg);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.1rem;
    color: var(--brand-green);
    flex-shrink: 0;
}

/* ============ TICKET CONTENT ============ */
.ticket-content {
    color: var(--text-main);
    line-height: 1.7;
    font-size: 0.95rem;
    white-space: pre-wrap;
}

/* ============ BADGES ============ */
.badge-custom {
    display: inline-flex;
    align-items: center;
    padding: 0.3rem 0.75rem;
    border-radius: 999px;
    font-size: 0.78rem;
    font-weight: 600;
    white-space: nowrap;
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

.badge-secondary {
    background: var(--pill-bg);
    color: var(--text-muted);
}

/* ============ DETAIL LIST ============ */
.detail-list {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem 1.5rem;
    margin: 0;
}

.detail-list dt {
    font-size: 0.8rem;
    font-weight: 700;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.04em;
}

.detail-list dd {
    font-size: 0.9rem;
    font-weight: 500;
    color: var(--text-main);
    margin: 0;
}

/* ============ ATTRIBUTES ============ */
.attributes-grid {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.attribute-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 0.75rem;
    border-bottom: 1px solid var(--border-color);
}

.attribute-item:last-child {
    border-bottom: none;
    padding-bottom: 0;
}

.attribute-label {
    font-size: 0.85rem;
    font-weight: 500;
    color: var(--text-muted);
}

.attribute-value {
    font-size: 0.9rem;
    font-weight: 600;
    color: var(--text-main);
}

/* ============ COST SUMMARY ============ */
.cost-summary {
    text-align: right;
}

.cost-summary small {
    display: block;
    font-size: 0.75rem;
}

.cost-summary strong {
    font-size: 1rem;
}

/* ============ EMPTY STATE ============ */
.empty-state-small {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 1.5rem 1rem;
    border-radius: 12px;
    background: var(--bg);
    color: var(--text-muted);
    font-size: 0.88rem;
    justify-content: center;
}

.empty-state-small i {
    font-size: 1.2rem;
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
    background: linear-gradient(90deg, transparent, var(--skeleton-highlight), transparent);
    transform: translateX(-100%);
    animation: shimmer 1.4s infinite;
}

.skeleton-title {
    height: 24px;
}

.skeleton-line {
    height: 14px;
}

@keyframes shimmer {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
}

/* ============ RESPONSIVE ============ */
@media (max-width: 768px) {
    .page-title {
        font-size: 1.5rem;
    }
    
    .card-custom {
        padding: 18px;
    }
    
    .detail-list {
        grid-template-columns: 1fr;
        gap: 0.5rem;
    }
    
    .detail-list dt {
        font-size: 0.75rem;
    }
    
    .attributes-grid {
        gap: 0.75rem;
    }
}
</style>