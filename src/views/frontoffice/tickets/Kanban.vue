<script setup>
// @ts-nocheck
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import FrontLayout from '../../../layouts/FrontLayout.vue'
import BaseCard from '../../../components/base/BaseCard.vue'
import BaseButton from '../../../components/base/BaseButton.vue'
import BaseModal from '../../../components/base/BaseModal.vue'
import BaseInput from '../../../components/base/BaseInput.vue'
import BaseTable from '../../../components/base/BaseTable.vue'
import BaseSelect from '../../../components/base/BaseSelect.vue'
import { useToast } from '../../../composables/useToast'
import { cancelLastSuperCost, getAllTickets, getTicketFollowups, saveCost } from '../../../utils/TicketManager.js'
import { setStatutTicket } from "../../../utils/TicketManager"
import { get } from '../../../api/backend-client.js'
import { profileUserService, userService } from '../../../services/BaseService.js'

const router = useRouter()
const tickets = ref([])
const users = ref([])
const loading = ref(true)
const detailsOpen = ref(false)
const statusModalOpen = ref(false)
const pendingStatus = ref(null)
const pendingTicket = ref(null)
const statusNote = ref('')
const userId = ref(null)
const closeDate = ref('')
const selectedTicket = ref(null)
const dragTicket = ref(null)
const selectedLanguage = ref('fr')
const languageOptions = ref([])
const superCost = ref(null)
const percent = ref(null)
const mode = ref(null)
const isDragging = ref(false)

const { showSuccess, showError } = useToast()

// Libellés par défaut pour les statuts
const defaultStatusLabels = {
    1: 'Nouveau',
    2: 'En cours',
    6: 'Terminé'
}

const normalizeLang = (lang) => String(lang || '').trim().toLowerCase()

const findTranslation = (statusItem, lang) => {
    const translations = statusItem.languues || statusItem.langues
    if (!translations) return null
    const wanted = normalizeLang(lang)
    const match = translations.find(t => normalizeLang(t.langue) === wanted)
    return match?.valeur || null
}

const buildLanguageOptions = (statuses) => {
    const languages = new Map()
    statuses.forEach(status => {
        const translations = status.languues || status.langues || []
        translations.forEach(t => {
            if (!languages.has(t.langue)) {
                languages.set(t.langue, {
                    value: t.langue,
                    label: t.langue.toUpperCase()
                })
            }
        })
    })
    languageOptions.value = Array.from(languages.values())
    if (languageOptions.value.length) {
        selectedLanguage.value = languageOptions.value[0].value
    }
}

const statuses = ref([])

const loadStatuses = async () => {
    try {
        const res = await get('/status')
        if (Array.isArray(res.data)) {
            statuses.value = res.data
            buildLanguageOptions(statuses.value)
        }
    } catch (e) {
        console.warn('Impossible de charger les statuts', e)
    }
}

const visibleTickets = computed(() => {
    return tickets.value.filter(ticket => [1, 2, 6].includes(ticket.status))
})

const columns = computed(() => {
    const kanbanStatuses = statuses.value.filter(s => [1, 2, 6].includes(s.id))
    
    return kanbanStatuses.map(status => {
        let label = findTranslation(status, selectedLanguage.value) || defaultStatusLabels[status.id] || `Statut ${status.id}`
        
        return {
            id: status.id,
            label,
            couleur: status.couleur || '',
            cards: visibleTickets.value.filter(ticket => ticket.status === status.id)
        }
    })
})

const formatTicketLabel = (ticket) => {
    const reference = ticket.externalid || ticket.external_id || ticket.id
    return `#${reference}`
}

const requiresExtraInfo = (statusId) => {
    return statusId === 2 || statusId === 6  
}

const loadTickets = async () => {
    loading.value = true
    try {
        const [data, technicians, profiles] = await Promise.all([
            getAllTickets(), 
            userService.getAll(), 
            profileUserService.getAll()
        ])
        tickets.value = data
        const map = new Map()
        profiles.forEach(p => map.set(Number(p.users_id), Number(p.profiles_id)))
        users.value = technicians.filter(u => map.get(Number(u.id)) === 6)
    } catch (error) {
        console.error(error)
        showError('Impossible de charger les tickets.')
    } finally {
        loading.value = false
    }
}

const openTicketDetails = async (ticket) => {
    selectedTicket.value = ticket
    await loadTicketFollowups(ticket.id)
    detailsOpen.value = true
}

const startDrag = (ticket, event) => {
    dragTicket.value = ticket
    isDragging.value = true
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', ticket.id)
}

const endDrag = () => {
    isDragging.value = false
}

const dropOnColumn = async (statusId) => {
    if (!dragTicket.value) return

    const ticket = dragTicket.value
    dragTicket.value = null
    isDragging.value = false

    if (ticket.status === statusId) return

    try {
        if (requiresExtraInfo(statusId)) {
            pendingTicket.value = ticket
            pendingStatus.value = statusId
            statusNote.value = ''
            userId.value = null
            closeDate.value = ''
            superCost.value = null
            percent.value = null
            mode.value = null
            statusModalOpen.value = true
            return
        }

        await setStatutTicket(ticket.id, statusId)
        ticket.status = statusId
        showSuccess(`Ticket déplacé avec succès`)
    } catch (e) {
        console.error(e)
        showError("Erreur lors du changement de statut")
    }
}

const cancelSuperCost = async () => {
    if (!pendingTicket.value || pendingStatus.value == null) return
    loading.value = true
    try {
        const response = await cancelLastSuperCost(pendingTicket.value.id)
        showSuccess(response)
        await setStatutTicket(
            pendingTicket.value.id,
            pendingStatus.value,
            userId.value,
            statusNote.value,
            closeDate.value
        )
        pendingTicket.value.status = pendingStatus.value
        showSuccess('Ticket mis à jour')
    } catch (e) {
        console.error(e)
        showError("Erreur mise à jour statut")
    } finally {
        loading.value = false
        statusModalOpen.value = false
        resetPendingState()
    }
}

const confirmStatusChange = async () => {
    if (!pendingTicket.value || pendingStatus.value == null) return
    loading.value = true
    try {
        let type = pendingStatus.value == 6 ? 'CLOSE' : 'OPEN',
            value = pendingStatus.value == 6 ? superCost.value : percent.value

        const [response] = await Promise.all([
            saveCost(pendingTicket.value.id, type, value, mode.value),
            setStatutTicket(
                pendingTicket.value.id, 
                pendingStatus.value, 
                userId.value,
                statusNote.value, 
                closeDate.value
            )
        ])

        showSuccess(response)
        pendingTicket.value.status = pendingStatus.value
        showSuccess('Ticket mis à jour')
    } catch (e) {
        console.error(e)
        showError("Erreur mise à jour statut")
    } finally {
        loading.value = false
        statusModalOpen.value = false
        resetPendingState()
    }
}

const resetPendingState = () => {
    pendingTicket.value = null
    pendingStatus.value = null
    statusNote.value = ''
    superCost.value = null
    percent.value = null
    mode.value = null
    userId.value = null
    closeDate.value = ''
}

const cancelStatusChange = () => {
    statusModalOpen.value = false
    resetPendingState()
}

// Détails du ticket
const ticketFollowups = ref([])

const ticketDetails = computed(() => {
    if (!selectedTicket.value) return null
    return {
        reference: formatTicketLabel(selectedTicket.value),
        subject: selectedTicket.value.name || 'Sans sujet',
        status: columns.value.find(c => c.id === selectedTicket.value.status)?.label || '—',
        requester: selectedTicket.value.recipientObject?.displayName || selectedTicket.value.recipientObject?.name || '—',
        location: selectedTicket.value.locationObject?.completename || selectedTicket.value.locationObject?.name || '—',
        type: selectedTicket.value.typeObject?.name || '—',
        priority: selectedTicket.value.priorityObject?.name || '—',
        itemsCount: selectedTicket.value.items?.length || 0,
        costsCount: selectedTicket.value.costs?.length || 0,
        content: selectedTicket.value.content || 'Aucune description disponible.',
        items: selectedTicket.value.items || [],
        costs: selectedTicket.value.costs || []
    }
})

const ticketItemRows = computed(() => {
    return ticketDetails.value?.items.map((link) => ({
        id: link.id || '',
        itemtype: link.itemtype,
        label: link.item?.name || link.item?.completename || `#${link.items_id}`,
        reference: link.items_id
    })) || []
})

const ticketCostRows = computed(() => {
    return ticketDetails.value?.costs.map((cost) => ({
        id: cost.id || '',
        name: cost.name || 'Coût',
        comment: cost.comment || '—',
        actiontime: cost.actiontime || '—',
        cost_time: cost.cost_time || '—',
        cost_fixed: cost.cost_fixed || '—',
        cost_material: cost.cost_material || '—'
    })) || []
})

const parseFollowupDateTime = (value) => {
    if (!value) return { date: '—', time: '—' }
    const normalized = String(value).trim().replace('T', ' ')
    const [date, ...rest] = normalized.split(' ')
    return { date: date || '—', time: rest.join(' ') || '—' }
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

const followupColumns = [
    { key: 'date', label: 'Date' },
    { key: 'time', label: 'Heure' },
    { key: 'content', label: 'Commentaire' }
]

const itemDetailsColumns = [
    { key: 'itemtype', label: 'Type' },
    { key: 'label', label: 'Actif', class: 'fw-semibold' },
    { key: 'reference', label: 'Référence' }
]

const costDetailsColumns = [
    { key: 'name', label: 'Libellé' },
    { key: 'comment', label: 'Commentaire' },
    { key: 'actiontime', label: 'Durée', align: 'right' },
    { key: 'cost_time', label: 'Temps', align: 'right' },
    { key: 'cost_fixed', label: 'Fixe', align: 'right' },
    { key: 'cost_material', label: 'Matériel', align: 'right' }
]

const loadTicketFollowups = async (ticketId) => {
    try {
        ticketFollowups.value = await getTicketFollowups(ticketId)
    } catch (error) {
        console.error('Impossible de charger l\'historique de suivi', error)
        ticketFollowups.value = []
    }
}

function getContrastColor(hexColor) {
    if (!hexColor) return '#212529'
    let hex = hexColor.replace('#', '')
    if (hex.length === 3) hex = hex.split('').map(c => c + c).join('')
    const r = parseInt(hex.substring(0, 2), 16) / 255
    const g = parseInt(hex.substring(2, 4), 16) / 255
    const b = parseInt(hex.substring(4, 6), 16) / 255
    const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b
    return luminance > 0.5 ? '#000000' : '#ffffff'
}

function getColumnBgColor(column) {
    if (!column.couleur) return null
    return {
        backgroundColor: column.couleur,
        borderColor: column.couleur
    }
}

function getTicketBgColor(ticket) {
    const column = columns.value.find(c => c.id === ticket.status)
    if (!column?.couleur) return null
    return {
        backgroundColor: column.couleur + '15',
        borderLeft: `3px solid ${column.couleur}`
    }
}

onMounted(async () => {
    await Promise.all([loadStatuses(), loadTickets()])
})
</script>

<template>
    <FrontLayout>
        <!-- Page Header -->
        <div class="page-header mb-4">
            <div class="d-flex justify-content-between align-items-start flex-wrap gap-3">
                <div>
                    <span class="eyebrow">Kanban</span>
                    <h1 class="page-title">Tableau de tickets</h1>
                    <p class="page-subtitle">
                        Déplacez les tickets entre les colonnes — {{ tickets.length }} ticket(s) au total
                    </p>
                </div>
                <div class="d-flex gap-3 align-items-end">
                    <BaseSelect 
                        v-model="selectedLanguage" 
                        :options="languageOptions" 
                        optionLabel="label"
                        optionValue="value" 
                        label="Langue"
                        size="sm"
                    />
                    <BaseButton 
                        label="Nouveau ticket" 
                        icon="bi bi-plus-lg" 
                        variant="primary"
                        @click="() => router.push('/tickets/new')" 
                    />
                </div>
            </div>
        </div>

        <!-- Loading -->
        <div v-if="loading" class="text-center py-5">
            <div class="kanban-skeleton">
                <div v-for="i in 3" :key="i" class="skeleton-column">
                    <div class="skeleton skeleton-header"></div>
                    <div class="skeleton skeleton-card"></div>
                    <div class="skeleton skeleton-card"></div>
                    <div class="skeleton skeleton-card short"></div>
                </div>
            </div>
        </div>

        <!-- Kanban -->
        <div v-else class="kanban-board">
            <div v-for="column in columns" :key="column.id" class="kanban-column">
                <!-- En-tête colonne -->
                <div 
                    class="kanban-column-header"
                    :style="getColumnBgColor(column)"
                >
                    <div class="d-flex align-items-center justify-content-between">
                        <div>
                            <h2 
                                class="kanban-column-title"
                                :style="column.couleur ? { color: getContrastColor(column.couleur) } : {}"
                            >
                                {{ column.label }}
                            </h2>
                            <span 
                                class="kanban-column-count"
                                :style="column.couleur ? { color: getContrastColor(column.couleur), opacity: 0.8 } : {}"
                            >
                                {{ column.cards.length }} ticket(s)
                            </span>
                        </div>
                        <span class="kanban-column-badge">
                            {{ column.cards.length }}
                        </span>
                    </div>
                </div>

                <!-- Zone de drop -->
                <div 
                    class="kanban-column-body"
                    :class="{ 'kanban-drag-over': isDragging }"
                    @dragover.prevent
                    @dragenter.prevent
                    @drop.prevent="dropOnColumn(column.id)"
                    @dragleave.prevent
                >
                    <!-- Cartes -->
                    <div 
                        v-for="ticket in column.cards" 
                        :key="ticket.id"
                        class="kanban-card"
                        :style="getTicketBgColor(ticket)"
                        draggable="true" 
                        @dragstart="startDrag(ticket, $event)"
                        @dragend="endDrag"
                        @click="openTicketDetails(ticket)"
                    >
                        <div class="kanban-card-header">
                            <span class="kanban-card-id">{{ formatTicketLabel(ticket) }}</span>
                            <i class="bi bi-grip-vertical drag-handle"></i>
                        </div>
                        <h3 class="kanban-card-title">{{ ticket.name || 'Sans sujet' }}</h3>
                        <div class="kanban-card-meta">
                            <span v-if="ticket.recipientObject?.name">
                                <i class="bi bi-person"></i> {{ ticket.recipientObject.name }}
                            </span>
                            <span v-if="ticket.date">
                                <i class="bi bi-calendar"></i> {{ new Date(ticket.date).toLocaleDateString('fr-FR') }}
                            </span>
                        </div>
                    </div>

                    <!-- État vide -->
                    <div v-if="!column.cards.length" class="kanban-empty">
                        <i class="bi bi-inbox"></i>
                        <span>Glissez un ticket ici</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- Modal Détails -->
        <BaseModal v-model="detailsOpen" title="Détails du ticket" size="lg">
            <div v-if="ticketDetails">
                <div class="row g-4">
                    <div class="col-md-6">
                        <div class="detail-card">
                            <h3 class="detail-card-title">{{ ticketDetails.reference }}</h3>
                            <div class="detail-row">
                                <span class="detail-label">Sujet</span>
                                <span class="detail-value">{{ ticketDetails.subject }}</span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">Demandeur</span>
                                <span class="detail-value">{{ ticketDetails.requester }}</span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">Lieu</span>
                                <span class="detail-value">{{ ticketDetails.location }}</span>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="detail-card">
                            <h3 class="detail-card-title">Informations</h3>
                            <div class="detail-row">
                                <span class="detail-label">Type</span>
                                <span class="detail-value">{{ ticketDetails.type }}</span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">Priorité</span>
                                <span class="detail-value">{{ ticketDetails.priority }}</span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">Actifs</span>
                                <span class="detail-value">{{ ticketDetails.itemsCount }}</span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">Coûts</span>
                                <span class="detail-value">{{ ticketDetails.costsCount }}</span>
                            </div>
                        </div>
                    </div>
                    <div class="col-12">
                        <div class="detail-card">
                            <h3 class="detail-card-title">Description</h3>
                            <p class="detail-description">{{ ticketDetails.content }}</p>
                        </div>
                    </div>
                    <div class="col-12">
                        <div class="detail-card">
                            <h3 class="detail-card-title">Actifs liés</h3>
                            <BaseTable v-if="ticketItemRows.length" :items="ticketItemRows" :columns="itemDetailsColumns" :pageSize="5" />
                            <p v-else class="text-muted-custom text-center py-3">Aucun actif lié</p>
                        </div>
                    </div>
                    <div class="col-12">
                        <div class="detail-card">
                            <h3 class="detail-card-title">Coûts associés</h3>
                            <BaseTable v-if="ticketCostRows.length" :items="ticketCostRows" :columns="costDetailsColumns" :pageSize="5" />
                            <p v-else class="text-muted-custom text-center py-3">Aucun coût enregistré</p>
                        </div>
                    </div>
                    <div class="col-12">
                        <div class="detail-card">
                            <h3 class="detail-card-title">Historique de suivi</h3>
                            <BaseTable v-if="ticketFollowupRows.length" :items="ticketFollowupRows" :columns="followupColumns" :pageSize="5" />
                            <p v-else class="text-muted-custom text-center py-3">Aucun suivi disponible</p>
                        </div>
                    </div>
                </div>
            </div>
        </BaseModal>

        <!-- Modal Changement de statut -->
        <BaseModal v-model="statusModalOpen" title="Information requise" size="md">
            <p class="text-muted-custom mb-3">Ce changement de statut nécessite des informations supplémentaires.</p>
            
            <div class="d-flex flex-column gap-3">
                <BaseInput 
                    v-if="pendingStatus === 2 && pendingTicket?.status === 6" 
                    v-model="percent" 
                    type="number" 
                    label="Pourcentage de réouverture" 
                    placeholder="0-100"
                />
                <BaseSelect 
                    v-if="pendingStatus === 2 && pendingTicket?.status === 6" 
                    v-model="mode"
                    label="Mode de calcul" 
                    :options="[
                        { value: 1, label: 'Mode 1' },
                        { value: 2, label: 'Mode 2' },
                        { value: 3, label: 'Mode 3' },
                        { value: 4, label: 'Mode 4' }
                    ]" 
                />
                <BaseInput 
                    v-if="pendingStatus === 6" 
                    v-model="superCost" 
                    type="number" 
                    label="Super Cost" 
                    placeholder="Montant"
                />
                <BaseInput 
                    v-if="pendingStatus === 6" 
                    v-model="closeDate" 
                    type="date" 
                    label="Date de fermeture"
                />
                <BaseSelect 
                    v-if="pendingStatus === 2" 
                    v-model="userId" 
                    label="Technicien assigné"
                    :options="users" 
                    optionValue="id" 
                    optionLabel="name" 
                    autocomplete
                    searchable
                    placeholder="Rechercher un technicien..."
                />
                <BaseInput 
                    v-model="statusNote" 
                    type="textarea" 
                    label="Commentaire"
                    placeholder="Saisissez un commentaire pour ce changement..."
                />
            </div>

            <template #footer>
                <div class="d-flex gap-2 w-100">
                    <BaseButton 
                        v-if="pendingStatus === 2 && pendingTicket?.status === 6" 
                        :loading="loading"
                        label="Annuler Super Cost" 
                        variant="danger" 
                        size="sm" 
                        @click="cancelSuperCost" 
                    />
                    <BaseButton 
                        label="Annuler" 
                        variant="outline-secondary" 
                        size="sm" 
                        @click="cancelStatusChange"
                        class="ms-auto"
                    />
                    <BaseButton 
                        label="Valider" 
                        :loading="loading" 
                        variant="primary" 
                        size="sm"
                        @click="confirmStatusChange" 
                    />
                </div>
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

/* ============ KANBAN BOARD ============ */
.kanban-board {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1.25rem;
    min-height: 60vh;
}

/* ============ KANBAN COLUMN ============ */
.kanban-column {
    display: flex;
    flex-direction: column;
    background: var(--card-bg);
    border: 1px solid var(--border-color);
    border-radius: 16px;
    overflow: hidden;
    box-shadow: var(--shadow-card);
}

.kanban-column-header {
    padding: 1.25rem;
    background: var(--pill-bg);
    border-bottom: 1px solid var(--border-color);
}

.kanban-column-title {
    font-size: 1.1rem;
    font-weight: 700;
    margin: 0 0 0.15rem 0;
    color: var(--text-main);
}

.kanban-column-count {
    font-size: 0.8rem;
    color: var(--text-muted);
    font-weight: 500;
}

.kanban-column-badge {
    background: var(--card-bg);
    color: var(--text-main);
    padding: 0.25rem 0.65rem;
    border-radius: 999px;
    font-size: 0.8rem;
    font-weight: 700;
}

/* ============ KANBAN BODY ============ */
.kanban-column-body {
    flex: 1;
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    overflow-y: auto;
    min-height: 200px;
    transition: background 0.2s ease;
}

.kanban-drag-over {
    background: var(--brand-green-light);
}

/* ============ KANBAN CARD ============ */
.kanban-card {
    background: var(--bg);
    border: 1px solid var(--border-color);
    border-radius: 12px;
    padding: 1rem;
    cursor: grab;
    transition: all 0.2s ease;
    box-shadow: var(--shadow-sm);
}

.kanban-card:hover {
    box-shadow: var(--shadow-md);
    transform: translateY(-2px);
}

.kanban-card:active {
    cursor: grabbing;
    opacity: 0.8;
}

.kanban-card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.5rem;
}

.kanban-card-id {
    font-size: 0.75rem;
    font-weight: 700;
    color: var(--brand-green);
    background: var(--brand-green-light);
    padding: 0.2rem 0.5rem;
    border-radius: 6px;
}

.drag-handle {
    color: var(--text-muted);
    font-size: 1.1rem;
    cursor: grab;
}

.kanban-card-title {
    font-size: 0.9rem;
    font-weight: 600;
    color: var(--text-main);
    margin: 0 0 0.5rem 0;
    line-height: 1.4;
}

.kanban-card-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    font-size: 0.75rem;
    color: var(--text-muted);
}

.kanban-card-meta span {
    display: flex;
    align-items: center;
    gap: 0.25rem;
}

/* ============ EMPTY ============ */
.kanban-empty {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    color: var(--text-muted);
    font-size: 0.85rem;
    padding: 2rem;
    border: 2px dashed var(--border-color);
    border-radius: 12px;
}

.kanban-empty i {
    font-size: 1.5rem;
    opacity: 0.5;
}

/* ============ DETAIL MODAL ============ */
.detail-card {
    background: var(--bg);
    border: 1px solid var(--border-color);
    border-radius: 12px;
    padding: 1.25rem;
    height: 100%;
}

.detail-card-title {
    font-size: 0.85rem;
    font-weight: 700;
    color: var(--text-main);
    margin: 0 0 1rem 0;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid var(--border-color);
}

.detail-row {
    display: flex;
    justify-content: space-between;
    padding: 0.4rem 0;
    border-bottom: 1px solid var(--border-color);
}

.detail-row:last-child {
    border-bottom: none;
}

.detail-label {
    font-size: 0.8rem;
    font-weight: 500;
    color: var(--text-muted);
}

.detail-value {
    font-size: 0.85rem;
    font-weight: 600;
    color: var(--text-main);
    text-align: right;
}

.detail-description {
    font-size: 0.88rem;
    color: var(--text-main);
    line-height: 1.7;
    margin: 0;
}

/* ============ SKELETON ============ */
.kanban-skeleton {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1.25rem;
}

.skeleton-column {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}

.skeleton {
    background: var(--skeleton-bg);
    border-radius: 8px;
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

.skeleton-header {
    height: 50px;
}

.skeleton-card {
    height: 100px;
}

.skeleton-card.short {
    height: 70px;
}

@keyframes shimmer {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
}

/* ============ RESPONSIVE ============ */
@media (max-width: 991px) {
    .kanban-board {
        grid-template-columns: 1fr;
    }
    
    .kanban-skeleton {
        grid-template-columns: 1fr;
    }
}

@media (max-width: 768px) {
    .page-title {
        font-size: 1.5rem;
    }
    
    .kanban-card-meta {
        flex-direction: column;
        gap: 0.25rem;
    }
}
</style>