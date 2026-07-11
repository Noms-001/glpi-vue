<script setup>
import { ref, onMounted } from 'vue'

import BaseLayout from '../../layouts/BaseLayout.vue'
import BaseCard from '../../components/base/BaseCard.vue'
import BaseTable from '../../components/base/BaseTable.vue'

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

const elementColumns = [
    { key: 'name', label: 'Type' },
    { key: 'count', label: 'Nombre' }
]

const ticketColumns = [
    { key: 'name', label: 'Type' },
    { key: 'count', label: 'Nombre' }
]

const loading = ref(false)

async function loadStats() {
    loading.value = true

    const [itemsStats, ticketsStats] = await Promise.all([
        getItemsStats(),
        getTicketStats()
    ])

    totalElements.value = itemsStats.total
    totalTickets.value = ticketsStats.total

    elementDetails.value = itemsStats.items
    ticketDetails.value = ticketsStats.items
    loading.value = false
}

onMounted(loadStats)
</script>
<template>
    <BaseLayout>
        <section class="section">
            <!-- En-tête de page -->
            <header class="page-header">
                <span class="eyebrow">Dashboard</span>
                <h1 class="page-title">Vue d'ensemble</h1>
                <p class="page-subtitle">
                    Suivi des éléments et des tickets par type.
                </p>
            </header>

            <!-- Cartes de totaux généraux -->
            <div class="dashboard-grid">
                <BaseCard label="Total Éléments" :loading="loading" :value="totalElements" icon="bi bi-box-seam" />
                <BaseCard label="Total Tickets" :loading="loading" :value="totalTickets" icon="bi bi-ticket-perforated" />
            </div>

            <!-- Détails par type d'élément -->
            <div class="section-panel mt-4">
                <h2>Détails par type d'élément</h2>
                <BaseTable :items="elementDetails" :loading="loading" :columns="elementColumns" sortable />
            </div>

            <!-- Détails par type de ticket -->
            <div class="section-panel mt-4">
                <h2>Détails par type de ticket</h2>
                <BaseTable :loading="loading" :items="ticketDetails" :columns="ticketColumns" sortable />
            </div>
        </section>
    </BaseLayout>
</template>