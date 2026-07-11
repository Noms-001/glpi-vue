<script setup>
// @ts-nocheck
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import BaseLayout from '../../../layouts/BaseLayout.vue'
import BaseTable from '../../../components/base/BaseTable.vue'
import BaseButton from '../../../components/base/BaseButton.vue'
import { getAllTickets } from '../../../utils/TicketManager.js'

const tickets = ref([])
const loading = ref(false)

const columns = [
    { key: 'externalid', label: 'ID' },
    { key: 'name', label: 'Titre' },
    {
        key: 'statusLabel',
        label: 'Statut',
        badge: true,
        badgeVariant: (value) => {
            if (value === 'Nouveau') return 'primary'
            if (value === 'Validation') return 'info'
            if (value.includes('En cours')) return 'warning'
            if (value === 'Résolu') return 'success'
            if (value === 'Clos') return 'dark'
            return 'secondary'
        }
    },
    { key: 'date_mod', label: 'Dernière modification' },
    { key: 'date', label: "Date d'ouverture" },
    {
        key: 'priorityLabel',
        label: 'Priorité',
        badge: true,
        badgeVariant: (value) => {
            if (value === 'Très faible') return 'secondary'
            if (value === 'Faible') return 'info'
            if (value === 'Moyen') return 'warning'
            if (value === 'Élevé') return 'danger'
            if (value === 'Très élevé' || value === 'Majeur') return 'dark'
            return 'secondary'
        }
    },
    { key: 'recipientLabel', label: 'Demandeur' },
    { key: 'actions', label: 'Action' }
]

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
                ticket.recipientObject?.displayName || ticket.recipientObject?.name || ticket.recipientObject?.realname || ''
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

onMounted(loadTickets)
</script>

<template>
    <BaseLayout>
        <section class="section">
            <header class="page-header">
                <span class="eyebrow">Tickets</span>
                <h1 class="page-title">Liste des tickets</h1>
                <p class="page-subtitle">
                    Tous les tickets avec statut, date d'ouverture, priorité et demandeur.
                </p>
            </header>

            <div class="section-panel mt-4">
                <BaseTable :items="tickets" :loading="loading" :columns="columns" searchable sortable>
                    <template #cell-actions="{ item }">
                        <BaseButton
                            icon="bi bi-eye"
                            label="Voir détail"
                            title="Voir détail"
                            variant="secondary"
                            size="sm"
                            @click="viewTicket(item)"
                        />
                    </template>
                </BaseTable>
            </div>
        </section>
    </BaseLayout>
</template>
