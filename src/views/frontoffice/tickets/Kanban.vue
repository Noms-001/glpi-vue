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
import NewTicketModal from '../../../components/tickets/NewTicketModal.vue'
import { useToast } from '../../../composables/useToast'
import { cancelLastSuperCost, getAllTickets, getTicketFollowups, saveCost } from '../../../utils/TicketManager.js'
import { setStatutTicket } from "../../../utils/TicketManager"
import { get, post } from '../../../api/backend-client.js'
import BaseSelect from '../../../components/base/BaseSelect.vue'
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
const createModalOpen = ref(false)
const selectedLanguage = ref('fr')
const languageOptions = ref([])
const superCost = ref(null)
const percent = ref(null)
const mode = ref(null)

const { showSuccess, showError } = useToast()

// Libellés par défaut (français) pour les statuts affichés dans le Kanban
const defaultStatusLabels = {
    1: 'Nouveau',
    2: 'In progress',
    6: 'Terminé'
}

// Colonnes initiales (fallback en cas d'erreur de chargement)
const statusColumns = ref([
    { id: 1, label: 'Nouveau', badge: 'primary', couleur: '' },
    { id: 2, label: 'In progress', badge: 'info', couleur: '' },
    { id: 6, label: 'Terminé', badge: 'success', couleur: '' }
])

const normalizeLang = (lang) => String(lang || '').trim().toLowerCase()

const findTranslation = (statusItem, lang) => {
    // L'API renvoie "languues" (double u) – on accepte aussi "langues" par précaution
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
                    label: t.langue
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
    return statuses.value.map(status => {
        let label =
            findTranslation(status, selectedLanguage.value) ||
            defaultStatusLabels[status.id] ||
            `Statut ${status.id}`

        return {
            id: status.id,
            label,
            badge: 'secondary',
            couleur: status.couleur || '',
            customClass: '',
            cards: visibleTickets.value.filter(
                ticket => ticket.status === status.id
            )
        }
    })
})

const formatTicketLabel = (ticket) => {
    const reference = ticket.externalid || ticket.external_id || ticket.id
    return `Ticket-${reference}`
}

const getTicketState = (statusId) => {
    const found = statusColumns.value.find(s => s.id === statusId)
    if (found) return found.label || ''
    // fallback to legacy mapping
    if (statusId === 1) return 'Nouveau'
    if (statusId === 2) return 'En cours (Attribué)'
    if (statusId === 6) return 'Clos'
    return ''
}

const requiresExtraInfo = (statusId) => {
    return statusId === 2 || statusId === 6  
}

const loadTickets = async () => {
    loading.value = true
    try {
        const [data, technicians, profiles] = await Promise.all([getAllTickets(), userService.getAll(), profileUserService.getAll()])
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
    event.dataTransfer.effectAllowed = 'move'
}

const dropOnColumn = async (statusId) => {
    if (!dragTicket.value) return

    const ticket = dragTicket.value
    dragTicket.value = null

    if (ticket.status === statusId) return

    try {
        if (requiresExtraInfo(statusId)) {
            pendingTicket.value = ticket
            pendingStatus.value = statusId
            statusNote.value = ''
            userId.value = null
            closeDate.value = ''
            statusModalOpen.value = true
            return
        }

        await setStatutTicket(ticket.id, statusId)

        ticket.status = statusId

        showSuccess(
            `${formatTicketLabel(ticket)} déplacé vers ${statusColumns.value.find(c => c.id === statusId)?.label
            }`
        )

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
        pendingTicket.value.statusNote = statusNote.value
        pendingTicket.value.closedate = closeDate.value || pendingTicket.value.closedate

        showSuccess(
            `${formatTicketLabel(pendingTicket.value)} mis à jour`
        )
        loading.value = false

    } catch (e) {
        console.error(e)
        showError("Erreur mise à jour statut")
        loading.value = false
    }

    statusModalOpen.value = false
    pendingTicket.value = null
    pendingStatus.value = null
    statusNote.value = ''
}

const confirmStatusChange = async () => {
    if (!pendingTicket.value || pendingStatus.value == null) return
    loading.value = true
    try {
        let type = pendingStatus.value == 6 ? 'CLOSE' : 'OPEN',
            value = pendingStatus.value == 6 ? superCost.value : percent.value

        const [response,] = await Promise.all([
            saveCost(pendingTicket.value.id, type, value, mode.value),
            setStatutTicket(pendingTicket.value.id, pendingStatus.value, userId.value,
                statusNote.value, closeDate.value)
        ])

        showSuccess(response)

        pendingTicket.value.status = pendingStatus.value
        pendingTicket.value.statusNote = statusNote.value
        pendingTicket.value.closedate = closeDate.value || pendingTicket.value.closedate

        showSuccess(
            `${formatTicketLabel(pendingTicket.value)} mis à jour`
        )
        loading.value = false

    } catch (e) {
        console.error(e)
        showError("Erreur mise à jour statut")
        loading.value = false
    }

    statusModalOpen.value = false
    pendingTicket.value = null
    pendingStatus.value = null
    statusNote.value = ''
    superCost.value = null
    percent.value = null
    mode.value = null
}

const cancelStatusChange = () => {
    statusModalOpen.value = false
    pendingTicket.value = null
    pendingStatus.value = null
    statusNote.value = ''
}

const openCreateModal = () => {
    createModalOpen.value = true
}

const ticketFollowups = ref([])

const ticketDetails = computed(() => {
    if (!selectedTicket.value) return null
    return {
        reference: formatTicketLabel(selectedTicket.value),
        subject: selectedTicket.value.name || 'Sans sujet',
        status: getTicketState(selectedTicket.value.status),
        requester: selectedTicket.value.recipientObject?.displayName || selectedTicket.value.recipientObject?.name || '—',
        location: selectedTicket.value.locationObject?.completename || selectedTicket.value.locationObject?.name || '—',
        type: selectedTicket.value.typeObject?.name || '—',
        priority: selectedTicket.value.priorityObject?.name || '—',
        impact: selectedTicket.value.impactObject?.name || '—',
        urgency: selectedTicket.value.urgencyObject?.name || '—',
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
        label: link.item?.name || link.item?.completename || link.item?.label || `#${link.items_id}`,
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

const followupColumns = [
    { key: 'id', label: 'ID' },
    { key: 'date', label: 'Date' },
    { key: 'time', label: 'Heure' },
    { key: 'content', label: 'Commentaire' }
]

const itemDetailsColumns = [
    { key: 'id', label: 'ID' },
    { key: 'itemtype', label: 'Type' },
    { key: 'label', label: 'Actif' },
    { key: 'reference', label: 'Référence' }
]

const costDetailsColumns = [
    { key: 'id', label: 'ID' },
    { key: 'name', label: 'Libellé' },
    { key: 'comment', label: 'Commentaire' },
    { key: 'actiontime', label: 'Durée' },
    { key: 'cost_time', label: 'Temps' },
    { key: 'cost_fixed', label: 'Fixe' },
    { key: 'cost_material', label: 'Matériel' }
]

const loadTicketFollowups = async (ticketId) => {
    try {
        ticketFollowups.value = await getTicketFollowups(ticketId)
    } catch (error) {
        console.error('Impossible de charger l\'historique de suivi', error)
        ticketFollowups.value = []
    }
}

// Convertit une couleur hexadécimale (ex: "#RRGGBB" ou "#RGB") en luminance relative
function getContrastColor(hexColor) {
    if (!hexColor) return '#212529' // valeur par défaut (text-dark)

    let hex = hexColor.replace('#', '')
    if (hex.length === 3) {
        hex = hex.split('').map(c => c + c).join('')
    }
    const r = parseInt(hex.substring(0, 2), 16) / 255
    const g = parseInt(hex.substring(2, 4), 16) / 255
    const b = parseInt(hex.substring(4, 6), 16) / 255
    // Formule de luminance relative (WCAG)
    const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b
    return luminance > 0.5 ? '#000000' : '#ffffff'
}

onMounted(async () => {
    await Promise.all([loadStatuses(), loadTickets()])
})
</script>

<template>
    <FrontLayout>
        <div class="container">
            <section class="section">
                <header class="page-header">
                    <span class="eyebrow">Kanban Ticket</span>
                    <h1 class="page-title">Tableau de tickets</h1>
                    <p class="page-subtitle">Déplacez les tickets entre Nouveau, In progress et Terminé.</p>
                </header>

                <div class="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
                    <div>
                        <p class="mb-1 text-muted-custom">Gestion rapide des tickets</p>
                        <strong>{{ tickets.length }} ticket(s) total</strong>
                    </div>
                    <div class="d-flex gap-3 align-items-end">
                        <BaseSelect v-model="selectedLanguage" :options="languageOptions" optionLabel="label"
                            optionValue="value" label="Langue" placeholder="DEFAULT" />

                        <BaseButton label="Ajouter un ticket" icon="bi bi-plus-lg" variant="primary"
                            @click="() => router.push('/tickets/new')" />
                    </div>
                </div>

                <div v-if="loading" class="py-5 text-center">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Chargement...</span>
                    </div>
                </div>

                <div v-else class="row row-cols-1 row-cols-md-3 g-4">
                    <div v-for="column in columns" :key="column.id" class="col">
                        <div class="section-panel h-100 d-flex flex-column" :class="column.customClass"
                            :style="column.couleur ? { backgroundColor: column.couleur, opacity: 0.9 } : null">
                            <div class="kanban-header"
                                :style="column.couleur ? { backgroundColor: column.couleur } : null">
                                <div class="d-flex align-items-center justify-content-between mb-3">
                                    <div>
                                        <h2 class="h5 mb-1" :style="{ color: getContrastColor(column.couleur) }">
                                            {{ column.label }}
                                        </h2>
                                        <small :style="{ color: getContrastColor(column.couleur, 0.7) }">
                                            {{ column.cards.length }} ticket(s)
                                        </small>
                                    </div>
                                    <span :class="`bg-${column.badge}`" class="badge">
                                        {{ column.cards.length }}
                                    </span>
                                </div>
                                <div v-if="column.id === 1"
                                    class="card p-3 bg-body-tertiary rounded-4 border border-dashed cursor-pointer"
                                    @click="openCreateModal" style="border: 1px dashed var(--border-color) !important">
                                    <div class="d-flex align-items-center justify-content-between">
                                        <div>
                                            <h3 class="h6 mb-1">Ajouter un ticket</h3>
                                        </div>
                                        <i class="bi bi-plus-lg fs-4"></i>
                                    </div>
                                </div>
                            </div>

                            <div class="flex-grow-1 d-flex flex-column gap-3 mt-4" @dragover.prevent
                                @drop.prevent="dropOnColumn(column.id)">
                                <div v-for="ticket in column.cards" :key="ticket.id"
                                    class="card p-3 bg-body rounded-4 shadow-sm cursor-grab" :class="column.customClass"
                                    :style="column.couleur ? { backgroundColor: column.couleur } : null"
                                    draggable="true" @dragstart="startDrag(ticket, $event)"
                                    @click="openTicketDetails(ticket)">
                                    <div class="d-flex align-items-center justify-content-between mb-3">
                                        <div>
                                            <div class="text-muted-custom small">{{ formatTicketLabel(ticket) }}</div>
                                            <h3 class="h6 mb-1">{{ ticket.name || 'Sans sujet' }}</h3>
                                        </div>
                                        <i class="bi bi-arrows-move fs-5 text-secondary"></i>
                                    </div>
                                </div>
                                <div v-if="!column.cards.length"
                                    class="text-center text-muted-custom bg-light py-4 border rounded-4">
                                    Aucun ticket ici.
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <BaseModal v-model:modelValue="detailsOpen" title="Détails du ticket" size="lg">
                    <div v-if="ticketDetails" class="row g-4">
                        <div class="col-12 col-lg-6">
                            <BaseCard :title="ticketDetails.reference" :subtitle="ticketDetails.status"
                                icon="bi bi-ticket-detailed" customClass="h-100">
                                <template #default>
                                    <p class="mb-2"><strong>Sujet :</strong> {{ ticketDetails.subject }}</p>
                                    <p class="mb-2"><strong>Demandeur :</strong> {{ ticketDetails.requester }}</p>
                                    <p class="mb-2"><strong>Lieu :</strong> {{ ticketDetails.location }}</p>
                                </template>
                            </BaseCard>
                        </div>
                        <div class="col-12 col-lg-6 d-flex flex-column gap-3">
                            <div class="section-panel p-3 bg-body-tertiary rounded-4 h-100">
                                <h3 class="h6 mb-3">Infos</h3>
                                <p class="mb-2"><strong>Type :</strong> {{ ticketDetails.type }}</p>
                                <p class="mb-2"><strong>Priorité :</strong> {{ ticketDetails.priority }}</p>
                                <p class="mb-2"><strong>Impact :</strong> {{ ticketDetails.impact }}</p>
                                <p class="mb-2"><strong>Urgence :</strong> {{ ticketDetails.urgency }}</p>
                            </div>
                            <div class="section-panel p-3 bg-body-tertiary rounded-4 h-100">
                                <h3 class="h6 mb-3">Comptes</h3>
                                <p class="mb-2"><strong>Actifs liés :</strong> {{ ticketDetails.itemsCount }}</p>
                                <p class="mb-0"><strong>Coûts :</strong> {{ ticketDetails.costsCount }}</p>
                            </div>
                        </div>
                        <div class="col-12">
                            <div class="section-panel p-3 bg-body-tertiary rounded-4">
                                <h3 class="h6 mb-3">Description</h3>
                                <p class="mb-0">{{ ticketDetails.content }}</p>
                            </div>
                        </div>
                        <div class="col-12">
                            <div class="section-panel p-3 bg-body-tertiary rounded-4">
                                <h3 class="h6 mb-3">Actifs liés</h3>
                                <BaseTable v-if="ticketItemRows.length" :items="ticketItemRows"
                                    :columns="itemDetailsColumns" :pageSize="5" />
                                <div v-else class="empty-state">Aucun actif lié pour ce ticket.</div>
                            </div>
                        </div>
                        <div class="col-12">
                            <div class="section-panel p-3 bg-body-tertiary rounded-4">
                                <h3 class="h6 mb-3">Coûts associés</h3>
                                <BaseTable v-if="ticketCostRows.length" :items="ticketCostRows"
                                    :columns="costDetailsColumns" :pageSize="5" />
                                <div v-else class="empty-state">Aucun coût enregistré pour ce ticket.</div>
                            </div>
                        </div>
                        <div class="col-12">
                            <div class="section-panel p-3 bg-body-tertiary rounded-4">
                                <h3 class="h6 mb-3">Historique de suivi</h3>
                                <BaseTable v-if="ticketFollowupRows.length" :items="ticketFollowupRows"
                                    :columns="followupColumns" :pageSize="5" />
                                <div v-else class="empty-state">Aucun suivi disponible pour ce ticket.</div>
                            </div>
                        </div>
                    </div>
                </BaseModal>

                <BaseModal v-model:modelValue="statusModalOpen" title="Information supplémentaire requise" size="md">
                    <p>Ce changement de statut nécessite une note de suivi.</p>
                    <BaseInput v-if="pendingStatus === 2 && pendingTicket.status === 6" v-model="percent" type="number"
                        label="Reopning Percent Cost" />
                    <BaseSelect v-if="pendingStatus === 2 && pendingTicket.status === 6" v-model="mode"
                        label="Mode de calcul" :options="[1, 2, 3, 4]" />
                    <BaseInput v-if="pendingStatus === 6" v-model="superCost" type="number" label="Super Cost" />
                    <BaseInput v-if="pendingStatus === 6" v-model="closeDate" type="date" label="Date de fermeture"
                        placeholder="YYYY-MM-DD" helper="Par defaut date du jour" />
                    <BaseSelect v-if="pendingStatus === 2" v-model="userId" type="number" label="Technicien"
                        :options="users" optionValue="id" optionLabel="name" autocomplete />
                    <BaseInput v-model="statusNote" type="textarea" label="Commentaire"
                        placeholder="Saisissez un commentaire pour ce changement de statut" />
                    <template #footer>
                        <BaseButton v-if="pendingStatus === 2 && pendingTicket.status === 6" :loading="loading"
                            label="Annuler Super Cost" variant="danger" size="sm" @click="cancelSuperCost" />
                        <BaseButton label="Annuler" variant="secondary" size="sm" @click="cancelStatusChange" />
                        <BaseButton label="Valider" :loading="loading" variant="primary" size="sm"
                            @click="confirmStatusChange" />
                    </template>
                </BaseModal>

                <NewTicketModal v-model:modelValue="createModalOpen" @created="loadTickets" />
            </section>
        </div>
    </FrontLayout>
</template>

<style scoped>
.kanban-header {
    position: sticky;
    top: 75px;
    z-index: 10;
    padding-bottom: 1rem;
    margin: -5px -6px;
    padding: 5px 6px;
}
</style>