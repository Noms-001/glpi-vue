<script setup>
// @ts-nocheck
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import BaseLayout from '../../../layouts/BaseLayout.vue'
import BaseButton from '../../../components/base/BaseButton.vue'
import BaseCard from '../../../components/base/BaseCard.vue'
import BaseTable from '../../../components/base/BaseTable.vue'
import { getTicketById, getTicketFollowups } from '../../../utils/TicketManager.js'
import { get } from '../../../api/backend-client.js'
import TicketStatus from '../../../models/tickets/TicketStatuts.js'

const route = useRoute()
const router = useRouter()
const ticket = ref(null)
const ticketFollowups = ref([])
const loading = ref(false)
const error = ref('')

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

const requester = computed(() => {
    if (!ticket.value) return '—'
    return ticket.value.recipientObject?.displayName || ticket.value.recipientObject?.name || ticket.value.recipientObject?.realname || '—'
})

const locationName = computed(() => {
    if (!ticket.value) return '—'
    return ticket.value.locationObject?.completename || ticket.value.locationObject?.name || '—'
})

const assigneeName = computed(() => {
    if (!ticket.value) return '—'
    return ticket.value.lastUpdaterObject?.displayName || ticket.value.lastUpdaterObject?.name || ticket.value.lastUpdaterObject?.realname || '—'
})

const ticketItems = computed(() => {
    return ticket.value?.items?.map((link) => ({
        id: link.id,
        actif: link.item?.name || link.item?.completename || link.item?.label || `#${link.items_id}`,
        type: link.itemtype,
        reference: link.items_id
    })) || []
})

const ticketCosts = computed(() => {
    return ticket.value?.costs?.map((cost) => {
        const coutHoraire = Number(cost.cost_time || 0)
        const duree = Number(cost.actiontime || 0)
        const coutFixe = Number(cost.cost_fixed || 0)
        const coutMateriel = Number( cost.cost_material || 0)
        return {
            id: cost.id,
            temps: coutHoraire,
            duree: duree,
            fixe: coutFixe,
            materiel: coutMateriel,
            total: (duree/3600)*coutHoraire + coutFixe + coutMateriel
        }
    }) || []
})

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
            content: followup.content || '—'
        }
    })
})

const itemsColumns = [
    { key: 'id', label: 'ID' },
    { key: 'actif', label: 'Actif' },
    { key: 'type', label: 'Type' },
    { key: 'reference', label: 'Référence' }
]

const getTotalCost = (value, items) => {
    let cost = 0
    items.map(i => {
        cost += i.temps * i.duree / 3600 
    })
    return formatPrice(cost)
}

const formatTime = (cost) => cost ? `${cost} s` : '—'
const formatPrice = (cost) =>  cost ? `${Number(cost || 0).toFixed(2)} €` : '—'

const costsColumns = [
    { key: 'id', label: 'ID', footer: 'Total' },
    { key: 'duree', label: 'Durée', total: true, formatter: formatTime, totalFormatter: formatTime },
    { key: 'temps', label: 'Cout Horaire', total: true, formatter: formatPrice, totalFormatter: getTotalCost },
    { key: 'fixe', label: 'Cout Fixe', total: true, formatter: formatPrice, totalFormatter: formatPrice },
    { key: 'materiel', label: 'Cout Matériel', total: true, formatter: formatPrice, totalFormatter: formatPrice },
    { key: 'total', label: 'Cout Total', total: true, formatter: formatPrice, totalFormatter: formatPrice }
]

const followupColumns = [
    { key: 'id', label: 'ID' },
    { key: 'date', label: 'Date' },
    { key: 'time', label: 'Heure' },
    { key: 'content', label: 'Commentaire' }
]

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

onMounted(async () => {
    await loadTicket()
    if (ticket.value?.id) {
        await loadTicketFollowups(ticket.value.id)
    }
})
</script>

<template>
    <BaseLayout>
        <section class="section">
            <header class="page-header">
                <span class="eyebrow">Détails du ticket</span>
                <p class="page-subtitle">
                    Affiche les informations détaillées du ticket et les éléments associés.
                </p>
            </header>

            <div class="d-flex align-items-center flex-wrap gap-2 mb-4">
                <BaseButton icon="bi bi-arrow-left" label="Retour" variant="secondary" size="sm" @click="goBack" />

                <BaseButton icon="bi bi-arrow-clockwise" label="Rafraîchir" variant="primary" size="sm"
                    @click="refreshTicket" />
            </div>

            <div v-if="error" class="empty-state text-danger">{{ error }}</div>
            <div v-else-if="loading" class="empty-state">Chargement du ticket...</div>
            <div v-else-if="ticket" class="row g-4">
                <div class="row mb-4">
                    <div class="col-6 col-offset-1  mt-4">
                        <BaseCard :title="`Ticket #${ticket.externalid}`" :subtitle="ticket.typeObject?.name || 'Ticket'"
                            label="Statut" :value="ticket.statusObject?.name || '—'"
                            :description="`Demandeur : ${requester}`" icon="bi bi-ticket-detailed" customClass="h-100">
                            <template #actions>
                                <div class="detail-badge-row">
                                    <span class="badge bg-success">Priorité : {{ ticket.priorityObject?.name || '—'
                                        }}</span>
                                    <span class="badge bg-info text-dark">Impact : {{ ticket.impactObject?.name || '—'
                                        }}</span>
                                </div>
                            </template>
                        </BaseCard>
                    </div>
                    <div class="section-panel col-6 mt-4">
                        <h2>Résumé</h2>
                        <dl class="detail-list">
                            <dt>Demandeur</dt>
                            <dd>{{ requester }}</dd>

                            <dt>Lieu</dt>
                            <dd>{{ locationName }}</dd>

                            <dt>Dernière mise à jour</dt>
                            <dd>{{ formatDate(ticket.date_mod) }}</dd>

                            <dt>Créé le</dt>
                            <dd>{{ formatDate(ticket.date_creation || ticket.date) }}</dd>

                            <dt>Mise à jour par</dt>
                            <dd>{{ assigneeName }}</dd>
                        </dl>
                    </div>
                </div>

                <div class="row">
                    <div class="section-panel">
                        <h2>{{ ticket.name || 'Sans titre' }}</h2>
                        <p class="mb-4">{{ ticket.content || 'Aucune description fournie pour ce ticket.' }}
                        </p>

                        <div class="row gy-3 gx-4 mb-4">
                            <div class="col-12 col-md-6">
                                <div class="info-card">
                                    <strong>Type</strong>
                                    <p>{{ ticket.typeObject?.name || '—' }}</p>
                                </div>
                            </div>
                            <div class="col-12 col-md-6">
                                <div class="info-card">
                                    <strong>Urgence</strong>
                                    <p>{{ ticket.urgencyObject?.name || '—' }}</p>
                                </div>
                            </div>
                            <div class="col-12 col-md-6">
                                <div class="info-card">
                                    <strong>Impact</strong>
                                    <p>{{ ticket.impactObject?.name || '—' }}</p>
                                </div>
                            </div>
                            <div class="col-12 col-md-6">
                                <div class="info-card">
                                    <strong>Priorité</strong>
                                    <p>{{ ticket.priorityObject?.name || '—' }}</p>
                                </div>
                            </div>
                        </div>

                        <div class="mb-4">
                            <h3 class="section-title">Actifs liés</h3>
                            <BaseTable v-if="ticketItems.length" :items="ticketItems" :columns="itemsColumns" />
                            <div v-else class="empty-state">Aucun actif lié pour ce ticket.</div>
                        </div>

                        <div class="mb-4">
                            <h3 class="section-title">Coûts associés</h3>
                            <BaseTable v-if="ticketCosts.length" :items="ticketCosts" :columns="costsColumns" />
                            <div v-else class="empty-state">Aucun coût enregistré pour ce ticket.</div>
                        </div>

                        <div>
                            <h3 class="section-title">Historique de suivi</h3>
                            <BaseTable v-if="ticketFollowupRows.length" :items="ticketFollowupRows" :columns="followupColumns" />
                            <div v-else class="empty-state">Aucun suivi disponible pour ce ticket.</div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    </BaseLayout>
</template>

<style scoped>
p {
    color: var(--text-color);
}
.detail-list {
    display: grid;
    grid-template-columns: minmax(110px, 1fr) 2fr;
    gap: 0.75rem 1.5rem;
    margin: 0;
}

.detail-list dt {
    font-weight: 700;
    color: var(--text-color);
}

.detail-list dd {
    margin: 0;
    color: var(--muted-color, #6c757d);
}

.detail-badge-row {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-top: 1rem;
}

.info-card {
    background: var(--surface-color);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-lg);
    padding: 1rem;
}

.info-card strong {
    display: block;
    margin-bottom: 0.5rem;
    color: var(--text-color);
}

.section-title {
    margin-bottom: 1rem;
    font-size: 1.05rem;
    font-weight: 700;
}

.empty-state {
    padding: 1.25rem 1rem;
    border-radius: var(--radius-lg);
    background: rgba(108, 117, 125, 0.08);
    color: var(--muted-color, #6c757d);
}

.card {
    box-shadow: 0 0 0;
    border: 1px solid var(--border-color);
}

.card:hover, .section-panel {
    box-shadow: 0 0 0;
}
</style>
