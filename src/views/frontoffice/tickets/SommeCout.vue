<script setup>
// @ts-nocheck
import { onMounted, ref } from 'vue';
import { getDetailsByItemType, getSumCost } from '../../../utils/TicketManager';
import FrontLayout from '../../../layouts/FrontLayout.vue';
import BaseTable from '../../../components/base/BaseTable.vue';
import { items } from '../../../utils/ItemManager';
import { useToast } from '../../../composables/useToast';
import BaseModal from '../../../components/base/BaseModal.vue';

const sum = ref([])
const details = ref([])
const loading = ref(false)
const loadingDetails = ref(false)
const showModal = ref(false)
const { showError, showInfo } = useToast()

onMounted(async () => {
    loading.value = true
    try {
        sum.value = await getSumCost()
        showInfo('Donnees chargees avec succes')
    } catch (error) {
        console.log(error)
        showError('Erreur lors du chargement de donnees')
    }
    loading.value = false
})

const showDetails = async (item) => {
    showModal.value = true
    loadingDetails.value = true
    try {
        details.value = await getDetailsByItemType(item.type)
        showInfo('Donnees chargees avec succes')
    } catch (error) {
        console.log(error)
        showError('Erreur lors du chargement de donnees')
    }
    loadingDetails.value = false
}

</script>

<template>
    <FrontLayout>
        <BaseTable :items="sum" :loading="loading" :columns="[
            { key: 'type', label: 'Item type', footer: 'Total' },
            { key: 'cost', label: 'Cost', total: true },
            { key: 'superCost', label: 'Super Cost', total: true },
            { key: 'openCost', label: 'Reopening Cost', total: true },
            { key: 'total', label: 'Total', total: true },
        ]" :onRowClick="showDetails" />
        <BaseModal v-model="showModal" title="Details" size="xl">
            <BaseTable :items="details" :loading="loadingDetails" :columns="[
                { key: 'name', label: 'Item name', footer: 'Total' },
                { key: 'cost', label: 'Cost', total: true },
                { key: 'superCost', label: 'Super Cost', total: true },
                { key: 'openCost', label: 'Reopening Cost', total: true },
                { key: 'total', label: 'Total', total: true },
            ]" :pageSize="5" />
        </BaseModal>
    </FrontLayout>
</template>